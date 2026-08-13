// Cliente de Supabase falso para el modo demo.
//
// Imita la superficie de @supabase/supabase-js que la app realmente usa —
// .from(), 5 métodos de .auth y functions.invoke — contra un store en memoria.
// No hay storage, ni .rpc() desde el front, ni realtime en este proyecto.
//
// La clave es que el query builder sea *chainable* y *thenable*: el código hace
// `await` en cualquier punto de la cadena, no sólo al final.

import { DEMO_ROLE, type DemoRole } from './demoMode';
import { DEMO_USERS, nextId, table } from './fixtures';

// Latencia baja a propósito: loadActivePeople() dispara ~3 queries por vínculo
// en un loop secuencial (N+1), así que 100ms harían esperar varios segundos.
// 30ms alcanza para que los spinners se vean sin arruinar la navegación.
const QUERY_LATENCY_MS = 30;
const AUTH_LATENCY_MS = 350;
const FUNCTION_LATENCY_MS = 700;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Row = Record<string, any>;
type FilterOp = 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt' | 'in';
interface Filter { col: string; op: FilterOp; value: any }

/** Columnas de fecha que Postgres completaría solo en un INSERT. */
const AUTO_TIMESTAMP: Record<string, string> = {
  tutor_v2: 'created_at',
  historial_seguimiento: 'timestamp',
};

class MockQuery implements PromiseLike<any> {
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private limitN: number | null = null;
  private selectStr = '*';
  private headOnly = false;
  private wantCount = false;
  private singleMode: null | 'strict' | 'maybe' = null;
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any = null;
  private conflictCols: string[] = [];
  private ran: Promise<any> | null = null;
  private tableName: string;

  // Sin parameter property: el proyecto compila con erasableSyntaxOnly.
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // ── Construcción de la consulta ──────────────────────────────────────────

  select(cols = '*', opts?: { count?: string; head?: boolean }) {
    this.selectStr = cols || '*';
    if (opts?.count) this.wantCount = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }

  insert(payload: any) { this.op = 'insert'; this.payload = payload; return this; }
  update(payload: any) { this.op = 'update'; this.payload = payload; return this; }
  delete() { this.op = 'delete'; return this; }

  upsert(payload: any, opts?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = payload;
    this.conflictCols = opts?.onConflict ? opts.onConflict.split(',').map((c) => c.trim()) : [];
    return this;
  }

  eq(col: string, value: any) { return this.filter(col, 'eq', value); }
  neq(col: string, value: any) { return this.filter(col, 'neq', value); }
  gte(col: string, value: any) { return this.filter(col, 'gte', value); }
  lte(col: string, value: any) { return this.filter(col, 'lte', value); }
  gt(col: string, value: any) { return this.filter(col, 'gt', value); }
  lt(col: string, value: any) { return this.filter(col, 'lt', value); }
  in(col: string, values: any[]) { return this.filter(col, 'in', values); }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false });
    return this;
  }

  limit(n: number) { this.limitN = n; return this; }
  single() { this.singleMode = 'strict'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }

  private filter(col: string, op: FilterOp, value: any) {
    this.filters.push({ col, op, value });
    return this;
  }

  // ── Ejecución ────────────────────────────────────────────────────────────

  then<TR1 = any, TR2 = never>(
    onfulfilled?: ((value: any) => TR1 | PromiseLike<TR1>) | null,
    onrejected?: ((reason: any) => TR2 | PromiseLike<TR2>) | null,
  ): Promise<TR1 | TR2> {
    return this.exec().then(onfulfilled, onrejected);
  }

  private exec(): Promise<any> {
    // Memoizado: si alguien awaitea dos veces la misma cadena no se duplica el
    // insert.
    if (!this.ran) {
      this.ran = (async () => {
        await sleep(QUERY_LATENCY_MS);
        try {
          switch (this.op) {
            case 'insert': return this.runInsert();
            case 'update': return this.runUpdate();
            case 'upsert': return this.runUpsert();
            case 'delete': return this.runDelete();
            default: return this.runSelect();
          }
        } catch (err: any) {
          return { data: null, error: { message: err?.message || 'Error en el modo demo' }, status: 400 };
        }
      })();
    }
    return this.ran;
  }

  private matches(row: Row): boolean {
    return this.filters.every((f) => {
      const v = row[f.col];
      switch (f.op) {
        // Comparación por string: el código mezcla number y string según la
        // tabla (dni es TEXT, dispositivo_id es serial) y PostgREST castea.
        case 'eq': return String(v) === String(f.value);
        case 'neq': return String(v) !== String(f.value);
        case 'gte': return v >= f.value;
        case 'lte': return v <= f.value;
        case 'gt': return v > f.value;
        case 'lt': return v < f.value;
        case 'in': return (f.value as any[]).some((x) => String(x) === String(v));
        default: return true;
      }
    });
  }

  /**
   * Adjunta los embeds anidados de PostgREST. Sólo hay 3 formas en todo el
   * proyecto (persona y/o dispositivo colgando de vinculo), así que alcanza con
   * detectar la palabra suelta en el select en vez de parsearlo.
   * Ojo: \b...\b no matchea dentro de "dispositivo_id" porque _ es word char.
   */
  private hydrate(row: Row): Row {
    const out = { ...row };
    if (this.tableName !== 'persona' && /\bpersona\b/.test(this.selectStr) && row.dni != null) {
      out.persona = table('persona').find((p) => p.dni === row.dni) || null;
    }
    if (this.tableName !== 'dispositivo' && /\bdispositivo\b/.test(this.selectStr) && row.dispositivo_id != null) {
      out.dispositivo = table('dispositivo').find((d) => d.id === row.dispositivo_id) || null;
    }
    return out;
  }

  private sorted(rows: Row[]): Row[] {
    if (this.orders.length === 0) return rows;
    return [...rows].sort((a, b) => {
      for (const { col, asc } of this.orders) {
        const av = a[col], bv = b[col];
        if (av === bv) continue;
        if (av == null) return asc ? -1 : 1;
        if (bv == null) return asc ? 1 : -1;
        const cmp = av < bv ? -1 : 1;
        return asc ? cmp : -cmp;
      }
      return 0;
    });
  }

  /** Empaqueta el resultado respetando single()/maybeSingle(). */
  private wrap(rows: Row[], count: number | null = null) {
    if (this.singleMode) {
      if (rows.length === 0) {
        return this.singleMode === 'maybe'
          ? { data: null, error: null, count, status: 200 }
          : { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned' }, status: 406 };
      }
      return { data: rows[0], error: null, count, status: 200 };
    }
    return { data: rows, error: null, count, status: 200 };
  }

  private runSelect() {
    const matched = table(this.tableName).filter((r) => this.matches(r));
    if (this.headOnly) return { data: null, error: null, count: matched.length, status: 200 };

    let rows = this.sorted(matched);
    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    return this.wrap(rows.map((r) => this.hydrate(r)), this.wantCount ? matched.length : null);
  }

  private newRow(raw: Row): Row {
    const rows = table(this.tableName);
    const row: Row = { ...raw };
    // Sólo autoincrementamos donde la tabla realmente tiene id (persona usa dni
    // como PK y no tiene columna id).
    const usaId = rows.length === 0 || rows[0].id !== undefined;
    if (usaId && row.id === undefined) row.id = nextId(this.tableName);
    const tsCol = AUTO_TIMESTAMP[this.tableName];
    if (tsCol && row[tsCol] === undefined) row[tsCol] = new Date().toISOString();
    return row;
  }

  private runInsert() {
    const raws: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted = raws.map((raw) => {
      const row = this.newRow(raw);
      table(this.tableName).push(row);
      return row;
    });
    return this.wrap(inserted.map((r) => this.hydrate(r)));
  }

  private runUpdate() {
    const matched = table(this.tableName).filter((r) => this.matches(r));
    matched.forEach((r) => Object.assign(r, this.payload));
    return this.wrap(matched.map((r) => this.hydrate(r)));
  }

  private runUpsert() {
    const raws: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload];
    const rows = table(this.tableName);
    const result = raws.map((raw) => {
      const existing = this.conflictCols.length
        ? rows.find((r) => this.conflictCols.every((k) => String(r[k]) === String(raw[k])))
        : undefined;
      if (existing) {
        Object.assign(existing, raw);
        return existing;
      }
      const row = this.newRow(raw);
      rows.push(row);
      return row;
    });
    return this.wrap(result.map((r) => this.hydrate(r)));
  }

  private runDelete() {
    const rows = table(this.tableName);
    const removed: Row[] = [];
    for (let i = rows.length - 1; i >= 0; i--) {
      if (this.matches(rows[i])) removed.push(...rows.splice(i, 1));
    }
    return this.wrap(removed);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

const buildUser = (role: DemoRole) => ({
  id: DEMO_USERS[role].id,
  aud: 'authenticated',
  role: 'authenticated',
  email: DEMO_USERS[role].email,
  email_confirmed_at: new Date().toISOString(),
  app_metadata: { provider: 'demo', providers: ['demo'] },
  user_metadata: { demo: true },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const buildSession = (role: DemoRole) => ({
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: buildUser(role),
});

let signUpSeq = 0;

/** Simula el chequeo de 2 ausencias consecutivas que hace la Edge Function. */
function simulateAbsenceAlerts() {
  const registros = table('registro_asistencia');
  const fechas = [...new Set(registros.map((r) => r.fecha as string))].sort();
  const [ayer, hoy] = [fechas[fechas.length - 2], fechas[fechas.length - 1]];
  if (!hoy || !ayer) return { ok: true, processed: 0, results: [] };

  const ausente = (fecha: string) =>
    new Set(registros.filter((r) => r.fecha === fecha && !r.presente).map((r) => r.dni as string));

  const ausentesHoy = ausente(hoy);
  const ausentesAyer = ausente(ayer);
  const dnis = [...ausentesHoy].filter((d) => ausentesAyer.has(d)).slice(0, 6);

  return {
    ok: true,
    processed: dnis.length,
    results: dnis.map((dni) => ({ dni, enviado: true })),
  };
}

// ── Cliente ───────────────────────────────────────────────────────────────────

/**
 * Devuelve un objeto con la forma del SupabaseClient para el modo demo.
 * Todas las instancias comparten el mismo store en memoria — hace falta porque
 * AdminPanel crea operadores con createSecondaryClient() y espera verlos en la
 * tabla que lee el cliente principal.
 */
export function createMockClient(): any {
  const role: DemoRole = DEMO_ROLE || 'fundacion';

  return {
    from: (tableName: string) => new MockQuery(tableName),

    rpc: async () => ({ data: null, error: null }),

    auth: {
      getSession: async () => {
        await sleep(AUTH_LATENCY_MS);
        return { data: { session: buildSession(role) }, error: null };
      },
      getUser: async () => ({ data: { user: buildUser(role) }, error: null }),

      // Nunca dispara: la sesión demo es fija. La forma del retorno tiene que
      // ser exacta porque AuthContext desestructura data.subscription.
      onAuthStateChange: (_cb: unknown) => ({
        data: { subscription: { id: 'demo-sub', callback: _cb, unsubscribe: () => {} } },
        error: null,
      }),

      signOut: async () => ({ error: null }),

      signInWithPassword: async () => {
        await sleep(AUTH_LATENCY_MS);
        return { data: { user: buildUser(role), session: buildSession(role) }, error: null };
      },

      signUp: async () => {
        await sleep(AUTH_LATENCY_MS);
        // Id nuevo por llamada: lo usa el alta de operadores del AdminPanel.
        const user = { ...buildUser(role), id: `demo-user-nuevo-${++signUpSeq}` };
        return { data: { user, session: null }, error: null };
      },
    },

    functions: {
      invoke: async (name: string) => {
        await sleep(FUNCTION_LATENCY_MS);
        if (name === 'check-asistencias') return { data: simulateAbsenceAlerts(), error: null };
        return { data: null, error: null };
      },
    },
  };
}

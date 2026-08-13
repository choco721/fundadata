// Datos simulados del modo demo.
//
// IMPORTANTE: todo acá es 100% inventado. Nombres, apellidos, barrios, DNIs y
// teléfonos no corresponden ni derivan de ninguna persona real. Los DNI usan un
// rango sin asignar (90.000.000+) y los teléfonos el prefijo 011 0000-xxxx, que
// no es asignable. Esta app maneja fichas de personas en situación de
// vulnerabilidad: nada real puede terminar en un fixture público.
//
// Los datos se generan con un PRNG sembrado (no Math.random) para que la demo se
// vea igual en cada carga, y las fechas se calculan relativas a hoy para que las
// edades, la pirámide etaria y la asistencia del último mes tengan sentido
// cualquier día que alguien abra el link.

import { DEMO_CENTRO, type DemoRole } from './demoMode';

// ── PRNG determinístico (mulberry32) ──────────────────────────────────────────

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260812);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const chance = (p: number) => rnd() < p;

// ── Fechas ────────────────────────────────────────────────────────────────────
// La app calcula "hoy" con new Date().toISOString().split('T')[0] (UTC), así que
// acá usamos exactamente el mismo criterio para que los rangos coincidan.

const dayStr = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

const isWeekday = (d: string) => {
  const day = new Date(d + 'T12:00:00').getDay();
  return day !== 0 && day !== 6;
};

const TODAY = dayStr(0);

// ── Pools de texto (inventados) ───────────────────────────────────────────────

// Los pools están separados por generación: un centro de niñez con chicos
// llamados Néstor u Olga se lee falso enseguida.

const NINEZ_F = [
  'Milagros', 'Abril', 'Renata', 'Guadalupe', 'Catalina', 'Zoe', 'Jazmín', 'Aitana',
  'Emilia', 'Delfina', 'Antonella', 'Morena', 'Isabella', 'Alma', 'Julieta', 'Mía',
];

const NINEZ_M = [
  'Thiago', 'Bautista', 'Ciro', 'Lautaro', 'Benicio', 'Ramiro', 'Dante', 'Benjamín',
  'Valentín', 'Joaquín', 'Facundo', 'Tomás', 'Lorenzo', 'Bruno', 'Simón', 'Máximo',
];

const MAYOR_F = [
  'Norma', 'Beatriz', 'Susana', 'Mirta', 'Graciela', 'Olga', 'Elsa', 'Nélida',
  'Haydée', 'Amanda', 'Dora', 'Irma', 'Blanca', 'Ofelia', 'Zulema', 'Elba',
];

const MAYOR_M = [
  'Osvaldo', 'Rubén', 'Alberto', 'Héctor', 'Néstor', 'Aníbal', 'Ricardo', 'Oscar',
  'Jorge', 'Raúl', 'Omar', 'Hugo', 'Julio', 'Alfredo', 'Roberto', 'Eduardo',
];

// Generación intermedia: madres, padres y referentes de los chicos.
const ADULTO_F = [
  'Vanesa', 'Romina', 'Marisol', 'Carolina', 'Yesica', 'Natalia', 'Verónica',
  'Silvana', 'Lorena', 'Mariela', 'Andrea', 'Paola', 'Cintia', 'Gisela',
];

const ADULTO_M = [
  'Cristian', 'Marcelo', 'Gustavo', 'Sergio', 'Pablo', 'Diego', 'Fernando',
  'Leandro', 'Javier', 'Damián', 'Walter', 'Ariel', 'Maximiliano', 'Gonzalo',
];

const APELLIDOS = [
  'Quiroga', 'Almirón', 'Barrionuevo', 'Ledesma', 'Zalazar', 'Mansilla', 'Coronel',
  'Villalba', 'Ocampo', 'Bustamante', 'Aguirre', 'Cabral', 'Maidana', 'Peralta',
  'Sandoval', 'Ferreyra', 'Godoy', 'Escalante', 'Brizuela', 'Vergara', 'Olmedo',
  'Alcaraz', 'Nieva', 'Roldán', 'Cardozo', 'Alegre', 'Verón', 'Chávez',
];

const BARRIOS = [
  'Villa Progreso', 'Barrio San Cayetano', 'Las Acacias', 'Bajo Grande',
  'Loma Verde', 'Barrio Norte Chico', 'El Ceibal', 'Los Álamos',
  'Barrio 12 de Octubre', 'La Ribera', 'Altos del Sur', 'Barrio Esperanza',
];

const RELACIONES = ['Madre', 'Padre', 'Abuela', 'Abuelo', 'Tía', 'Tío', 'Hermana mayor', 'Referente afectivo'];

/** El año escolar tiene que seguir a la edad: un nene de 6 en 3° año de
 *  secundaria salta a la vista en una demo. */
const anoEscolarPorEdad = (edad: number): string => {
  if (edad <= 5) return 'Nivel inicial (sala de 5)';
  if (edad <= 11) return `${edad - 5}° grado`;
  return `${Math.min(edad - 11, 6)}° año secundario`;
};

const NIVELES_EDUCATIVOS = ['Primario completo', 'Primario incompleto', 'Secundario completo', 'Secundario incompleto', 'Sin escolarizar'];
const SITUACIONES_HAB = ['Vivienda propia', 'Alquila', 'Vive con familiares', 'Vivienda precaria', 'Hogar de tránsito'];
const LIMITACIONES = ['ninguna', 'ninguna', 'ninguna', 'auditiva', 'visual', 'motriz', 'intelectual'];
const MOVILIDADES = ['autonomo', 'autonomo', 'asistido', 'silla_de_ruedas'];
const OBRAS_SOCIALES = ['PAMI', 'Sin cobertura', 'Obra social provincial', 'Programa municipal de salud'];
const DIAGNOSTICOS = ['Hipertensión arterial', 'Diabetes tipo II', 'Artrosis', 'EPOC', 'Sin diagnósticos registrados'];
const MEDICACIONES = ['Enalapril 10mg diario', 'Metformina 850mg', 'Levotiroxina 50mcg', 'Analgesia según demanda'];

const MOTIVOS_EGRESO = [
  'Mudanza a otra localidad',
  'Derivación a dispositivo especializado',
  'Finalización del ciclo del programa',
  'Alta por cumplimiento de objetivos',
];

const OBS_NINEZ = [
  'Buena adaptación al espacio. Participa de los talleres de apoyo escolar.',
  'Se trabaja articuladamente con la escuela para sostener la asistencia.',
  'Muestra avances en el vínculo con el grupo de pares.',
  'Se solicitó turno en el centro de salud para control pediátrico.',
  'La familia participa de las reuniones mensuales del centro.',
];

const OBS_DIA = [
  'Participa activamente del taller de memoria.',
  'Se coordina traslado con el municipio dos veces por semana.',
  'Buen vínculo con el equipo. Asiste con regularidad.',
  'Se realizó seguimiento nutricional durante el último trimestre.',
  'Se articuló con trabajo social para la gestión de la pensión.',
];

const CAMPOS_HISTORIAL = [
  'persona.barrio', 'vinculo.estado', 'ficha.escolarizado', 'ficha.consumo_activo',
  'ficha.violencia_familiar', 'ficha.limitacion_permanente', 'ficha.referenciado_salud',
];

// ── Dispositivos (mismo seed que schema_setup.sql) ────────────────────────────

export const DISPOSITIVOS = [
  { id: 1, nombre: 'Centro de Niñez "Rayito de Luz"', tipo: 'ninez' },
  { id: 2, nombre: 'Centro de Niñez "Pequeños Pasos"', tipo: 'ninez' },
  { id: 3, nombre: 'Centro de Niñez "Futuro Feliz"', tipo: 'ninez' },
  { id: 4, nombre: 'Centro de Niñez "Travesuras"', tipo: 'ninez' },
  { id: 5, nombre: 'Centro de Niñez "Manitos Mágicas"', tipo: 'ninez' },
  { id: 6, nombre: 'Centro de Día "Renacer"', tipo: 'dia' },
  { id: 7, nombre: 'Centro de Día "Sabiduría"', tipo: 'dia' },
  { id: 8, nombre: 'Centro de Día "Edad de Oro"', tipo: 'dia' },
  { id: 9, nombre: 'Centro de Día "Vida Activa"', tipo: 'dia' },
  { id: 10, nombre: 'Centro de Día "Nuevo Horizonte"', tipo: 'dia' },
];

/** Centro asignado al operador demo, elegido al entrar (ver DEMO_CENTRO). Se
 *  valida contra los centros existentes para que un valor manipulado a mano en
 *  sessionStorage no deje al operador sin centro y caiga en "Rol Pendiente". */
export const DEMO_DISPOSITIVO_ID = DISPOSITIVOS.some((d) => d.id === DEMO_CENTRO) ? DEMO_CENTRO : 1;

export const DEMO_USERS: Record<DemoRole, { id: string; email: string }> = {
  fundacion: { id: 'demo-user-fundacion', email: 'demo.fundacion@fundadata.app' },
  operador: { id: 'demo-user-operador', email: 'demo.operador@fundadata.app' },
};

// ── Generación ────────────────────────────────────────────────────────────────

interface Row { [k: string]: any }

function buildStore(): Record<string, Row[]> {
  const persona: Row[] = [];
  const vinculo: Row[] = [];
  const ficha_ninez: Row[] = [];
  const ficha_dia: Row[] = [];
  const tutor_v2: Row[] = [];
  const registro_asistencia: Row[] = [];
  const historial_seguimiento: Row[] = [];

  let dniSeq = 90_100_000;
  let vinculoId = 1;
  let tutorId = 1;
  let asistenciaId = 1;
  let historialId = 1;

  for (const dev of DISPOSITIVOS) {
    const esNinez = dev.tipo === 'ninez';
    const cantidad = esNinez ? int(9, 13) : int(7, 11);

    for (let i = 0; i < cantidad; i++) {
      const sexo = chance(0.48) ? 'Femenino' : 'Masculino';
      // Los centros de día son mayormente de adultos mayores, pero con algo de
      // dispersión: si no, las bandas 36-60 de la pirámide etaria quedan en cero
      // y el gráfico parece roto.
      const edad = esNinez ? int(4, 17) : chance(0.28) ? int(41, 60) : int(61, 88);
      const dni = String((dniSeq += int(137, 4200)));

      const nacimiento = new Date(Date.now() - (edad * 365 + int(0, 364)) * 86400000)
        .toISOString()
        .split('T')[0];

      const poolNombres = esNinez
        ? (sexo === 'Femenino' ? NINEZ_F : NINEZ_M)
        : (sexo === 'Femenino' ? MAYOR_F : MAYOR_M);

      persona.push({
        dni,
        nombre: pick(poolNombres),
        apellido: pick(APELLIDOS),
        fecha_nacimiento: nacimiento,
        sexo,
        barrio: pick(BARRIOS),
      });

      // ~85% activo, ~10% egresado, ~5% inasistencia prolongada
      const roll = rnd();
      const estado = roll < 0.85 ? 'activo' : roll < 0.95 ? 'egresado' : 'inasistencia_prolongada';
      const diasAlta = int(45, 900);
      const vId = vinculoId++;

      vinculo.push({
        id: vId,
        dni,
        dispositivo_id: dev.id,
        fecha_alta: dayStr(diasAlta),
        fecha_baja: estado === 'egresado' ? dayStr(int(5, Math.max(6, diasAlta - 20))) : null,
        estado,
        motivo_egreso: estado === 'egresado' ? pick(MOTIVOS_EGRESO) : null,
      });

      const consumo = !esNinez ? chance(0.06) : chance(0.04);
      const violencia = chance(0.09);

      if (esNinez) {
        // observaciones es un TEXT con JSON adentro: si va vacío, todos los
        // campos extendidos aparecen en blanco en la ficha.
        const obs: Row = {
          ano_escolar: anoEscolarPorEdad(edad),
          texto_libre: pick(OBS_NINEZ),
        };
        if (consumo) {
          obs.consumo_sustancias = 'Consumo episódico referido por la familia';
          obs.consumo_contexto = 'Contexto grupal fuera del centro';
          obs.consumo_familiar = 'Se trabaja con el grupo familiar';
        }
        if (violencia) obs.violencia_detalle = 'Situación intrafamiliar en seguimiento con el equipo territorial';

        ficha_ninez.push({
          vinculo_id: vId,
          escolarizado: chance(0.88),
          discapacidad: chance(0.11),
          referenciado_salud: chance(0.34),
          consumo_activo: consumo,
          violencia_familiar: violencia,
          observaciones: JSON.stringify(obs),
        });

        const cantTutores = chance(0.35) ? 2 : 1;
        for (let t = 0; t < cantTutores; t++) {
          // El nombre sigue a la relación: una abuela no se llama como una madre
          // de 30 años.
          const relacion = pick(RELACIONES);
          const esAbuelo = relacion.startsWith('Abuel');
          const esVaron = /^(Padre|Abuelo|Tío)$/.test(relacion);
          const pool = esAbuelo
            ? (esVaron ? MAYOR_M : MAYOR_F)
            : (esVaron ? ADULTO_M : ADULTO_F);

          tutor_v2.push({
            id: tutorId++,
            vinculo_id: vId,
            nombre: `${pick(pool)} ${pick(APELLIDOS)}`,
            telefono: `011 0000-${String(int(1000, 9999))}`,
            relacion,
            created_at: dayStr(diasAlta - t),
          });
        }
      } else {
        const tieneMed = chance(0.55);
        const tieneDisc = chance(0.22);
        const obs: Row = {
          condicion_actual: 'Concurre al centro con regularidad',
          obra_social: pick(OBRAS_SOCIALES),
          tiene_medicacion: tieneMed,
          movilidad: pick(MOVILIDADES),
          diagnosticos: pick(DIAGNOSTICOS),
          tiene_discapacidad: tieneDisc,
          vive_solo: chance(0.3),
          red_apoyo_familiar: chance(0.72),
          tiene_jubilacion: chance(0.66),
          texto_libre: pick(OBS_DIA),
        };
        if (tieneMed) obs.medicacion_detalle = pick(MEDICACIONES);
        if (tieneDisc) obs.discapacidad_detalle = 'Certificado vigente presentado en el centro';
        if (consumo) {
          obs.consumo_sustancias = 'Consumo problemático de alcohol referido';
          obs.consumo_contexto = 'Consumo domiciliario';
        }
        if (violencia) obs.violencia_detalle = 'Situación de violencia económica en seguimiento';

        ficha_dia.push({
          vinculo_id: vId,
          tiene_cud: tieneDisc && chance(0.8),
          limitacion_permanente: pick(LIMITACIONES),
          nivel_educativo: pick(NIVELES_EDUCATIVOS),
          situacion_habitacional: pick(SITUACIONES_HAB),
          consumo_activo: consumo,
          violencia_familiar: violencia,
          observaciones: JSON.stringify(obs),
        });
      }
    }
  }

  // ── Asistencia de los últimos 60 días corridos (sólo hábiles) ───────────────
  // Se siembran algunas rachas de faltas recientes para que el tablero muestre
  // "faltas críticas" y la alerta de 2 ausencias consecutivas tenga sentido.

  const fechas: string[] = [];
  for (let d = 60; d >= 0; d--) {
    const f = dayStr(d);
    if (isWeekday(f)) fechas.push(f);
  }

  const activos = vinculo.filter((v) => v.estado === 'activo');
  const conRacha = new Set<string>();
  // 2 del centro del operador demo (para que se vea al entrar) + 3 de otros
  const candidatosDemo = activos.filter((v) => v.dispositivo_id === DEMO_DISPOSITIVO_ID);
  const otros = activos.filter((v) => v.dispositivo_id !== DEMO_DISPOSITIVO_ID);
  [candidatosDemo[0], candidatosDemo[3], otros[2], otros[11], otros[24]]
    .filter(Boolean)
    .forEach((v) => conRacha.add(v.dni));

  for (const v of activos) {
    const racha = conRacha.has(v.dni) ? int(2, 4) : 0;
    // Tasa base de asistencia propia de cada persona, para que el promedio no
    // sea plano y el filtro "mínimo de faltas" tenga con qué trabajar.
    const tasa = 0.78 + rnd() * 0.2;

    fechas.forEach((fecha, idx) => {
      const desdeElFinal = fechas.length - 1 - idx;
      const presente = desdeElFinal < racha ? false : chance(tasa);
      registro_asistencia.push({
        id: asistenciaId++,
        dni: v.dni,
        dispositivo_id: v.dispositivo_id,
        fecha,
        presente,
        registrado_por: DEMO_USERS.operador.id,
      });
    });
  }

  // ── Historial de seguimiento (para el modal de detalle de Fundación) ───────

  // Se recorre vínculo por vínculo en vez de sortear al azar sobre el total: si
  // sólo el 40% tiene historial, el primero que abra un visitante muy
  // probablemente aparece vacío y la función parece rota.
  for (const v of vinculo) {
    if (!chance(0.7)) continue;
    const cantidad = int(1, 3);
    for (let i = 0; i < cantidad; i++) {
      const campo = pick(CAMPOS_HISTORIAL);
      const booleano = campo.startsWith('ficha.') && !campo.includes('limitacion');
      historial_seguimiento.push({
        id: historialId++,
        vinculo_id: v.id,
        timestamp: new Date(Date.now() - int(1, 180) * 86400000).toISOString(),
        campo_modificado: campo,
        valor_anterior: booleano ? 'false' : campo === 'vinculo.estado' ? 'activo' : pick(BARRIOS),
        valor_nuevo: booleano ? 'true' : campo === 'vinculo.estado' ? 'egresado' : pick(BARRIOS),
        user_id: DEMO_USERS.operador.id,
      });
    }
  }

  // ── Roles ─────────────────────────────────────────────────────────────────
  // El usuario demo activo TIENE que tener su fila acá: si el rol resuelve a
  // null, ProtectedRoute inserta un 'pendiente' y la demo se clava en la
  // pantalla "Rol Pendiente".

  const user_roles: Row[] = [
    {
      id: 1,
      user_id: DEMO_USERS.fundacion.id,
      role: 'fundacion',
      dispositivo_id: null,
      email: DEMO_USERS.fundacion.email,
      activo: true,
    },
    {
      id: 2,
      user_id: DEMO_USERS.operador.id,
      role: 'operador',
      dispositivo_id: DEMO_DISPOSITIVO_ID,
      email: DEMO_USERS.operador.email,
      activo: true,
    },
  ];

  DISPOSITIVOS.filter((d) => d.id !== DEMO_DISPOSITIVO_ID).forEach((d, i) => {
    user_roles.push({
      id: 3 + i,
      user_id: `demo-user-op-${d.id}`,
      role: 'operador',
      dispositivo_id: d.id,
      email: `operador.centro${d.id}@fundadata.app`,
      activo: i !== 4, // uno inactivo, para que el toggle tenga los dos estados
    });
  });

  user_roles.push(
    { id: 20, user_id: 'demo-user-pend-1', role: 'pendiente', dispositivo_id: null, email: 'nuevo.ingreso@fundadata.app', activo: false },
    { id: 21, user_id: 'demo-user-pend-2', role: 'pendiente', dispositivo_id: null, email: 'coordinacion.zona.sur@fundadata.app', activo: false },
  );

  return {
    dispositivo: DISPOSITIVOS.map((d) => ({ ...d })),
    persona,
    vinculo,
    ficha_ninez,
    ficha_dia,
    tutor_v2,
    registro_asistencia,
    historial_seguimiento,
    user_roles,
    notificacion_log: [],
    tutor: [], // tabla legacy, el front ya no la usa
  };
}

/**
 * Store singleton en memoria. Las escrituras de la demo lo mutan, así que dar de
 * alta un chico o marcar asistencia se refleja de verdad en las pantallas.
 * Se pierde al recargar, que es exactamente lo que queremos.
 */
export const demoStore: Record<string, Row[]> = buildStore();

/** Contadores de id autoincremental, arrancados por encima del máximo actual. */
const idSeq: Record<string, number> = {};
for (const [table, rows] of Object.entries(demoStore)) {
  const max = rows.reduce((m, r) => (typeof r.id === 'number' && r.id > m ? r.id : m), 0);
  idSeq[table] = max;
}

export const nextId = (table: string): number => {
  idSeq[table] = (idSeq[table] || 0) + 1;
  return idSeq[table];
};

/** Devuelve (creando si hace falta) el array de una tabla. */
export const table = (name: string): Row[] => {
  if (!demoStore[name]) demoStore[name] = [];
  return demoStore[name];
};

export const DEMO_TODAY = TODAY;

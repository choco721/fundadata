import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/fundacion/")({
  component: () => (
    <Protected requireRole="admin">
      <Dashboard />
    </Protected>
  ),
});

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
.fd-root { --bg:#F4F2EE; --surface:#FFFFFF; --surface2:#EDEBE6; --border:rgba(0,0,0,0.08); --border2:rgba(0,0,0,0.14); --text:#1A1917; --text2:#6B6860; --text3:#9C9A93; --teal:#0F6E56; --teal-light:#E1F5EE; --teal-mid:#1D9E75; --blue:#185FA5; --blue-light:#E6F1FB; --purple:#534AB7; --purple-light:#EEEDFE; --amber:#854F0B; --amber-light:#FAEEDA; --amber-mid:#EF9F27; --red:#A32D2D; --red-light:#FCEBEB; --gray:#5F5E5A; --gray-light:#F1EFE8; --fd-radius:12px; --fd-radius-sm:8px; font-family:'DM Sans',sans-serif; color:var(--text); background:var(--bg); margin:-1rem; padding:0; }
.fd-root *, .fd-root *::before, .fd-root *::after { box-sizing:border-box; }
.fd-wrapper { max-width:1100px; margin:0 auto; padding:1.5rem 1rem; }
.fd-section-label { font-family:'DM Mono',monospace; font-size:10px; font-weight:500; color:var(--text3); letter-spacing:0.1em; text-transform:uppercase; margin:1.75rem 0 0.75rem; }
.fd-section-label:first-child { margin-top:0; }
.fd-cards-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; }
.fd-mcard { background:var(--surface); border:1px solid var(--border); border-radius:var(--fd-radius); padding:1rem 1.1rem; transition:transform .15s, box-shadow .15s; }
.fd-mcard:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.07); }
.fd-mcard-label { font-size:11px; color:var(--text3); margin-bottom:8px; }
.fd-mcard-value { font-size:28px; font-weight:300; line-height:1; }
.fd-mcard-sub { font-size:11px; color:var(--text3); margin-top:5px; }
.fd-mv-teal .fd-mcard-value { color:var(--teal); }
.fd-mv-blue .fd-mcard-value { color:var(--blue); }
.fd-mv-purple .fd-mcard-value { color:var(--purple); }
.fd-mv-amber .fd-mcard-value { color:var(--amber); }
.fd-mv-red .fd-mcard-value { color:var(--red); }
.fd-two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:640px) { .fd-two-col { grid-template-columns:1fr; } }
.fd-panel { background:var(--surface); border:1px solid var(--border); border-radius:var(--fd-radius); padding:1.1rem 1.25rem; }
.fd-panel-title { font-size:13px; font-weight:500; margin-bottom:14px; color:var(--text); }
.fd-bar-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.fd-bar-row:last-child { margin-bottom:0; }
.fd-bar-label { font-size:12px; color:var(--text2); width:110px; flex-shrink:0; }
.fd-bar-track { flex:1; height:6px; background:var(--surface2); border-radius:3px; overflow:hidden; }
.fd-bar-fill { height:100%; border-radius:3px; transition:width .8s cubic-bezier(.4,0,.2,1); }
.fd-bar-val { font-size:12px; font-weight:500; color:var(--text); width:38px; text-align:right; flex-shrink:0; font-family:'DM Mono',monospace; }
.fd-hist-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid var(--border); }
.fd-hist-row:last-child { border-bottom:none; }
.fd-hist-label { font-size:12px; color:var(--text2); }
.fd-badge { font-size:11px; font-weight:500; padding:2px 9px; border-radius:20px; font-family:'DM Mono',monospace; }
.fd-badge-teal { background:var(--teal-light); color:var(--teal); }
.fd-badge-amber { background:var(--amber-light); color:var(--amber); }
.fd-badge-red { background:var(--red-light); color:var(--red); }
.fd-badge-blue { background:var(--blue-light); color:var(--blue); }
.fd-badge-gray { background:var(--gray-light); color:var(--gray); }
.fd-tray-inner { display:flex; align-items:center; gap:20px; background:var(--purple-light); border-radius:var(--fd-radius-sm); padding:1rem 1.25rem; margin-top:10px; }
.fd-tray-num { font-size:42px; font-weight:300; color:var(--purple); line-height:1; font-family:'DM Mono',monospace; flex-shrink:0; }
.fd-tray-divider { width:1px; height:48px; background:rgba(83,74,183,0.2); flex-shrink:0; }
.fd-tray-text { font-size:12px; color:#534AB7; line-height:1.6; }
.fd-tray-text strong { font-weight:500; display:block; margin-bottom:2px; font-size:13px; }
.fd-table-panel { background:var(--surface); border:1px solid var(--border); border-radius:var(--fd-radius); overflow:hidden; }
.fd-table-header { padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:10px; }
.fd-table-title { font-size:13px; font-weight:500; }
.fd-filters { display:flex; gap:8px; flex-wrap:wrap; }
.fd-filters select, .fd-filters input { font-family:'DM Sans',sans-serif; font-size:11px; padding:5px 10px; border:1px solid var(--border2); border-radius:var(--fd-radius-sm); background:var(--bg); color:var(--text2); cursor:pointer; outline:none; }
.fd-filters select:hover { border-color:var(--teal); }
.fd-export-btn { font-family:'DM Sans',sans-serif; font-size:11px; font-weight:500; padding:5px 12px; border:1px solid var(--border2); border-radius:var(--fd-radius-sm); background:var(--surface); color:var(--text2); cursor:pointer; display:flex; align-items:center; gap:5px; transition:all .15s; }
.fd-export-btn:hover { background:var(--teal); color:white; border-color:var(--teal); }
.fd-table-scroll { overflow-x:auto; }
.fd-table-panel table { width:100%; border-collapse:collapse; font-size:12px; }
.fd-table-panel th { text-align:left; padding:9px 14px; color:var(--text3); font-weight:500; background:var(--bg); border-bottom:1px solid var(--border); font-family:'DM Mono',monospace; font-size:10px; letter-spacing:0.05em; text-transform:uppercase; white-space:nowrap; }
.fd-table-panel td { padding:10px 14px; border-bottom:1px solid var(--border); color:var(--text); }
.fd-table-panel tr:last-child td { border-bottom:none; }
.fd-table-panel tr:hover td { background:var(--bg); }
.fd-table-panel a { color:inherit; text-decoration:none; }
.fd-table-panel a:hover { color:var(--teal); }
.fd-status { font-size:10px; font-weight:500; padding:3px 8px; border-radius:20px; font-family:'DM Mono',monospace; letter-spacing:0.03em; }
.fd-st-activo { background:var(--teal-light); color:var(--teal); }
.fd-st-egresado { background:var(--gray-light); color:var(--gray); }
.fd-st-inasistencia { background:var(--amber-light); color:var(--amber); }
.fd-mono { font-family:'DM Mono',monospace; font-size:11px; }
.fd-footer { text-align:center; padding:2rem 0 1rem; font-size:11px; color:var(--text3); font-family:'DM Mono',monospace; }
@keyframes fdFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
.fd-mcard { animation:fdFadeUp .4s ease both; }
`;

function pct(n: number, total: number) { return total ? Math.round((n / total) * 100) : 0; }
function age(fechaNac?: string | null) {
  if (!fechaNac) return null;
  const d = new Date(fechaNac); if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}
function fmtDate(s?: string | null) {
  if (!s) return "—";
  const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`;
}

function Dashboard() {
  const [disp, setDisp] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [fn, setFn] = useState<any[]>([]);
  const [fd, setFd] = useState<any[]>([]);
  const [filterDisp, setFilterDisp] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterBarrio, setFilterBarrio] = useState("all");

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: v }, { data: fnRows }, { data: fdRows }] = await Promise.all([
        supabase.from("dispositivo").select("*").order("nombre"),
        supabase.from("vinculo").select("id, estado, fecha_alta, fecha_baja, motivo_egreso, dni, dispositivo:dispositivo_id(id, nombre, tipo), persona:dni(dni, nombre_completo, barrio, sexo, fecha_nacimiento)").order("fecha_alta", { ascending: false }),
        supabase.from("ficha_ninez").select("vinculo_id, escolarizado, consumo_activo, violencia_familiar, discapacidad"),
        supabase.from("ficha_dia").select("vinculo_id, tiene_cud, consumo_activo, violencia_familiar, limitacion_permanente"),
      ]);
      setDisp(d ?? []); setRows(v ?? []); setFn(fnRows ?? []); setFd(fdRows ?? []);
    })();
  }, []);

  const barrios = useMemo(() => Array.from(new Set(rows.map(r => r.persona?.barrio).filter(Boolean))).sort(), [rows]);

  const stats = useMemo(() => {
    const activos = rows.filter(r => r.estado === "activo");
    const activosNinez = activos.filter(r => r.dispositivo?.tipo === "ninez");
    const activosDia = activos.filter(r => r.dispositivo?.tipo === "dia");
    const total = activos.length;
    const activeIds = new Set(activos.map(a => a.id));
    const fnActive = fn.filter(f => activeIds.has(f.vinculo_id));
    const fdActive = fd.filter(f => activeIds.has(f.vinculo_id));
    // sexo
    const sx = { F: 0, M: 0, X: 0 };
    activos.forEach(a => {
      const s = (a.persona?.sexo ?? "").toString().toUpperCase();
      if (s.startsWith("F")) sx.F++; else if (s.startsWith("M")) sx.M++; else sx.X++;
    });
    // edad
    const ages = { a: 0, b: 0, c: 0, d: 0 };
    activos.forEach(r => {
      const e = age(r.persona?.fecha_nacimiento);
      if (e === null) return;
      if (e <= 12) ages.a++; else if (e <= 17) ages.b++; else if (e <= 35) ages.c++; else ages.d++;
    });
    const ageTot = ages.a + ages.b + ages.c + ages.d;
    // motivos egreso
    const egresados = rows.filter(r => r.estado === "egresado");
    const motivos: Record<string, number> = {};
    egresados.forEach(r => {
      const k = (r.motivo_egreso ?? "Otros").trim() || "Otros";
      motivos[k] = (motivos[k] ?? 0) + 1;
    });
    const motivosArr = Object.entries(motivos).sort((a, b) => b[1] - a[1]).slice(0, 4);
    // histórico
    const allFichas = [...fn, ...fd];
    const consumoHist = pct(allFichas.filter((f: any) => f.consumo_activo).length, allFichas.length);
    const violenciaHist = pct(allFichas.filter((f: any) => f.violencia_familiar).length, allFichas.length);
    const discapHist = pct(fn.filter((f: any) => f.discapacidad).length + fd.filter((f: any) => f.limitacion_permanente).length, allFichas.length);
    // trayectoria: personas con historial en niñez/día que también tienen vínculo en otro centro (terapéutico)
    const dniByTipo: Record<string, Set<string>> = {};
    rows.forEach(r => {
      const t = r.dispositivo?.tipo ?? "otro";
      if (!dniByTipo[t]) dniByTipo[t] = new Set();
      dniByTipo[t].add(r.dni);
    });
    const baseDnis = new Set<string>([...(dniByTipo["ninez"] ?? []), ...(dniByTipo["dia"] ?? [])]);
    const otrosTipos = Object.keys(dniByTipo).filter(t => t !== "ninez" && t !== "dia");
    const transitDnis = new Set<string>();
    otrosTipos.forEach(t => dniByTipo[t].forEach(dni => { if (baseDnis.has(dni)) transitDnis.add(dni); }));
    const trayPct = baseDnis.size ? Math.round((transitDnis.size / baseDnis.size) * 100) : 0;

    return {
      total, activosNinez: activosNinez.length, activosDia: activosDia.length,
      pctEscol: pct(fnActive.filter(f => f.escolarizado).length, fnActive.length),
      pctCud: pct(fdActive.filter(f => f.tiene_cud).length, fdActive.length),
      pctConsumoActivo: pct([...fnActive, ...fdActive].filter(f => f.consumo_activo).length, fnActive.length + fdActive.length),
      sx, sxTot: sx.F + sx.M + sx.X,
      ages, ageTot,
      motivosArr, motivosTot: egresados.length,
      consumoHist, violenciaHist, discapHist,
      trayPct, trayN: transitDnis.size, trayBase: baseDnis.size,
    };
  }, [rows, fn, fd]);

  const filtered = useMemo(() => rows.filter(r => {
    if (filterDisp !== "all" && r.dispositivo?.id !== filterDisp) return false;
    if (filterEstado !== "all" && r.estado !== filterEstado) return false;
    if (filterBarrio !== "all" && r.persona?.barrio !== filterBarrio) return false;
    return true;
  }), [rows, filterDisp, filterEstado, filterBarrio]);

  function exportCSV() {
    const headers = ["DNI", "Nombre", "Centro", "Tipo", "Barrio", "Ingreso", "Estado"];
    const lines = [headers.join(",")];
    filtered.forEach(r => lines.push([
      r.persona?.dni, `"${r.persona?.nombre_completo ?? ""}"`, `"${r.dispositivo?.nombre ?? ""}"`,
      r.dispositivo?.tipo, `"${r.persona?.barrio ?? ""}"`, r.fecha_alta, r.estado,
    ].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `fundadata-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fd-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="fd-wrapper">
        <p className="fd-section-label">Estado actual — todos los centros</p>
        <div className="fd-cards-grid">
          <Metric color="teal" label="Personas activas" value={stats.total} sub="todos los centros" />
          <Metric color="blue" label="Centros de niñez" value={stats.activosNinez} sub={`${pct(stats.activosNinez, stats.total)}% del total`} />
          <Metric color="purple" label="Centros de día" value={stats.activosDia} sub={`${pct(stats.activosDia, stats.total)}% del total`} />
          <Metric color="teal" label="Escolarizados" value={`${stats.pctEscol}%`} sub="centros de niñez" />
          <Metric color="amber" label="Con CUD" value={`${stats.pctCud}%`} sub="centros de día" />
          <Metric color="red" label="Consumo activo" value={`${stats.pctConsumoActivo}%`} sub="declarado" />
        </div>

        <p className="fd-section-label">Distribución</p>
        <div className="fd-two-col">
          <div className="fd-panel">
            <div className="fd-panel-title">Por sexo</div>
            <Bar label="Femenino" value={pct(stats.sx.F, stats.sxTot)} color="var(--teal-mid)" />
            <Bar label="Masculino" value={pct(stats.sx.M, stats.sxTot)} color="#378ADD" />
            <Bar label="Otro / NB" value={pct(stats.sx.X, stats.sxTot)} color="var(--gray)" />
          </div>
          <div className="fd-panel">
            <div className="fd-panel-title">Por rango etario</div>
            <Bar label="0–12 años" value={pct(stats.ages.a, stats.ageTot)} color="#7F77DD" />
            <Bar label="13–17 años" value={pct(stats.ages.b, stats.ageTot)} color="#AFA9EC" />
            <Bar label="18–35 años" value={pct(stats.ages.c, stats.ageTot)} color="var(--teal-mid)" />
            <Bar label="36+ años" value={pct(stats.ages.d, stats.ageTot)} color="var(--gray)" />
          </div>
        </div>

        <p className="fd-section-label">Prevalencia histórica</p>
        <div className="fd-two-col">
          <div className="fd-panel">
            <div className="fd-panel-title">Indicadores acumulados</div>
            <HistRow label="Consumo en trayectoria" value={stats.consumoHist} tone="amber" />
            <HistRow label="Exposición a violencia familiar" value={stats.violenciaHist} tone="red" />
            <HistRow label="Con discapacidad / CUD" value={stats.discapHist} tone="blue" />
          </div>
          <div className="fd-panel">
            <div className="fd-panel-title">Motivos de egreso</div>
            {stats.motivosArr.length === 0 && <p style={{ fontSize: 12, color: "var(--text3)" }}>Sin egresos registrados.</p>}
            {stats.motivosArr.map(([k, n], i) => (
              <Bar key={k} label={k} value={pct(n, stats.motivosTot)} color={["var(--teal-mid)", "#378ADD", "var(--amber-mid)", "var(--gray)"][i] ?? "var(--gray)"} />
            ))}
          </div>
        </div>

        <p className="fd-section-label">Tasa de trayectoria entre dispositivos</p>
        <div className="fd-panel">
          <div className="fd-panel-title">Personas que transitaron niñez / día → otro dispositivo</div>
          <div className="fd-tray-inner">
            <div className="fd-tray-num">{stats.trayPct}%</div>
            <div className="fd-tray-divider" />
            <div className="fd-tray-text">
              <strong>{stats.trayN} de {stats.trayBase} personas con historial en centros de niñez o de día</strong>
              ingresaron posteriormente a otro dispositivo.<br />
              Mide indirectamente la efectividad del trabajo de prevención.
            </div>
          </div>
        </div>

        <p className="fd-section-label">Personas registradas</p>
        <div className="fd-table-panel">
          <div className="fd-table-header">
            <div className="fd-table-title">Todos los vínculos persona–centro <span style={{ color: "var(--text3)", fontWeight: 400 }}>({filtered.length})</span></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div className="fd-filters">
                <select value={filterDisp} onChange={e => setFilterDisp(e.target.value)}>
                  <option value="all">Todos los centros</option>
                  {disp.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="egresado">Egresado</option>
                  <option value="inasistencia_prolongada">Inasistencia</option>
                </select>
                <select value={filterBarrio} onChange={e => setFilterBarrio(e.target.value)}>
                  <option value="all">Todos los barrios</option>
                  {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <button className="fd-export-btn" onClick={exportCSV}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2v8M5 7l3 3 3-3M3 13h10" /></svg>
                Exportar CSV
              </button>
            </div>
          </div>
          <div className="fd-table-scroll">
            <table>
              <thead>
                <tr><th>Nombre</th><th>DNI</th><th>Centro</th><th>Tipo</th><th>Barrio</th><th>Ingreso</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map(r => (
                  <tr key={r.id}>
                    <td><Link to="/fundacion/persona/$vinculoId" params={{ vinculoId: r.id }}>{r.persona?.nombre_completo}</Link></td>
                    <td className="fd-mono">{r.persona?.dni}</td>
                    <td>{r.dispositivo?.nombre}</td>
                    <td><span className={`fd-badge ${r.dispositivo?.tipo === "ninez" ? "fd-badge-blue" : "fd-badge-teal"}`} style={{ fontSize: 10 }}>{r.dispositivo?.tipo === "ninez" ? "Niñez" : "Día"}</span></td>
                    <td>{r.persona?.barrio}</td>
                    <td className="fd-mono">{fmtDate(r.fecha_alta)}</td>
                    <td><span className={`fd-status ${r.estado === "activo" ? "fd-st-activo" : r.estado === "egresado" ? "fd-st-egresado" : "fd-st-inasistencia"}`}>{r.estado === "inasistencia_prolongada" ? "Inasistencia" : r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}</span></td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: "2rem" }}>Sin resultados.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fd-footer">FundaData · Panel de gestión centralizado</div>
      </div>
    </div>
  );
}

function Metric({ color, label, value, sub }: { color: string; label: string; value: any; sub?: string }) {
  return (
    <div className={`fd-mcard fd-mv-${color}`}>
      <div className="fd-mcard-label">{label}</div>
      <div className="fd-mcard-value">{value}</div>
      {sub && <div className="fd-mcard-sub">{sub}</div>}
    </div>
  );
}
function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="fd-bar-row">
      <div className="fd-bar-label">{label}</div>
      <div className="fd-bar-track"><div className="fd-bar-fill" style={{ width: `${value}%`, background: color }} /></div>
      <div className="fd-bar-val">{value}%</div>
    </div>
  );
}
function HistRow({ label, value, tone }: { label: string; value: number; tone: "amber" | "red" | "blue" | "teal" | "gray" }) {
  return (
    <div className="fd-hist-row">
      <div className="fd-hist-label">{label}</div>
      <span className={`fd-badge fd-badge-${tone}`}>{value}%</span>
    </div>
  );
}

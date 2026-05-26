import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/fundacion/")({
  component: () => (
    <Protected requireRole="admin">
      <Dashboard />
    </Protected>
  ),
});

function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [{ data: disp }, { data: vins }, { data: fn }, { data: fd }] = await Promise.all([
        supabase.from("dispositivo").select("*"),
        supabase.from("vinculo").select("id, estado, dispositivo_id"),
        supabase.from("ficha_ninez").select("vinculo_id, escolarizado, consumo_activo, violencia_familiar"),
        supabase.from("ficha_dia").select("vinculo_id, tiene_cud, consumo_activo, violencia_familiar"),
      ]);
      const activos = (vins ?? []).filter((v) => v.estado === "activo");
      const activosByDisp = (disp ?? []).map((d: any) => ({
        nombre: d.nombre.replace("Centro de ", "").replace("N° ", "#"),
        tipo: d.tipo,
        activos: activos.filter((a: any) => a.dispositivo_id === d.id).length,
      }));
      const activeIds = new Set(activos.map((a: any) => a.id));
      const fnActive = (fn ?? []).filter((f: any) => activeIds.has(f.vinculo_id));
      const fdActive = (fd ?? []).filter((f: any) => activeIds.has(f.vinculo_id));
      const pct = (arr: any[], k: string) => (arr.length ? Math.round((arr.filter((x) => x[k]).length / arr.length) * 100) : 0);
      const totalActivosNinez = fnActive.length;
      const totalActivosDia = fdActive.length;
      setData({
        totalActivos: activos.length,
        totalEgresados: (vins ?? []).filter((v) => v.estado === "egresado").length,
        totalInasistencia: (vins ?? []).filter((v) => v.estado === "inasistencia_prolongada").length,
        activosByDisp,
        pctEscolarizados: pct(fnActive, "escolarizado"),
        pctCud: pct(fdActive, "tiene_cud"),
        pctConsumo: pct([...fnActive, ...fdActive], "consumo_activo"),
        pctViolencia: pct([...fnActive, ...fdActive], "violencia_familiar"),
        totalActivosNinez,
        totalActivosDia,
      });
    })();
  }, []);

  if (!data) return <p className="text-sm text-muted-foreground p-4">Cargando…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Dashboard Fundación</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat title="Activos" value={data.totalActivos} sub={`${data.totalActivosNinez} niñez · ${data.totalActivosDia} día`} />
        <Stat title="Egresados" value={data.totalEgresados} />
        <Stat title="Inasistencia" value={data.totalInasistencia} />
        <Stat title="% Escolarizados" value={`${data.pctEscolarizados}%`} sub="niñez activa" />
        <Stat title="% con CUD" value={`${data.pctCud}%`} sub="día activa" />
        <Stat title="% Consumo activo" value={`${data.pctConsumo}%`} accent />
        <Stat title="% Violencia familiar" value={`${data.pctViolencia}%`} accent />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Personas activas por centro</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.activosByDisp}>
              <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="activos" fill="oklch(0.7 0.1 195)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Link to="/fundacion/personas" className="block">
        <Card className="hover:bg-muted/40">
          <CardContent className="py-4 text-sm font-medium text-center">Ver tabla completa →</CardContent>
        </Card>
      </Link>
    </div>
  );
}

function Stat({ title, value, sub, accent }: any) {
  return (
    <Card className={accent ? "border-accent/40" : ""}>
      <CardContent className="py-3">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className={`text-2xl font-semibold ${accent ? "text-accent" : ""}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

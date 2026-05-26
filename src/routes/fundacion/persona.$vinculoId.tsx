import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/routes/operador/index";
import { HistorialList } from "@/routes/operador/persona.$vinculoId";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/fundacion/persona/$vinculoId")({
  component: () => (
    <Protected requireRole="admin">
      <Detalle />
    </Protected>
  ),
});

function Detalle() {
  const { vinculoId } = useParams({ from: "/fundacion/persona/$vinculoId" });
  const [v, setV] = useState<any>(null);
  const [ficha, setFicha] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: vin } = await supabase
        .from("vinculo")
        .select("*, persona:dni(*), dispositivo:dispositivo_id(*)")
        .eq("id", vinculoId).single();
      if (!vin) return;
      setV(vin);
      const tabla = vin.dispositivo.tipo === "ninez" ? "ficha_ninez" : "ficha_dia";
      const { data: f } = await supabase.from(tabla).select("*").eq("vinculo_id", vinculoId).maybeSingle();
      setFicha(f);
      const { data: h } = await supabase.from("historial_cambio").select("*").eq("vinculo_id", vinculoId).order("created_at", { ascending: false });
      setHistorial(h ?? []);
    })();
  }, [vinculoId]);

  if (!v) return <p className="text-sm text-muted-foreground p-4">Cargando…</p>;
  const p = v.persona;

  return (
    <div className="space-y-3">
      <Link to="/fundacion/personas" className="text-xs text-muted-foreground">&larr; Volver</Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{p.nombre_completo}</h1>
          <p className="text-xs text-muted-foreground">DNI {p.dni} · {p.barrio} · {v.dispositivo.nombre}</p>
        </div>
        <EstadoBadge estado={v.estado} />
      </div>

      <Tabs defaultValue="ficha">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="ficha">Ficha</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="ficha">
          <Card>
            <CardHeader><CardTitle className="text-sm">Datos completos</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-1">
              <Pair k="Sexo" v={p.sexo} />
              <Pair k="Nacimiento" v={p.fecha_nacimiento} />
              <Pair k="Fecha alta" v={v.fecha_alta} />
              {v.fecha_baja && <Pair k="Fecha baja" v={v.fecha_baja} />}
              {v.motivo_egreso && <Pair k="Motivo egreso" v={v.motivo_egreso} />}
              <hr className="my-2" />
              {ficha && Object.entries(ficha).filter(([k]) => !["vinculo_id", "updated_at", "updated_by"].includes(k)).map(([k, val]) => (
                <Pair key={k} k={k} v={String(val ?? "—")} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historial">
          <HistorialList items={historial} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2 py-0.5 border-b border-border/40"><span className="text-muted-foreground">{k}</span><span className="text-right">{v}</span></div>;
}

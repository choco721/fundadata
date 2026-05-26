import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { EstadoBadge } from "@/routes/operador/index";

export const Route = createFileRoute("/operador/persona/$vinculoId")({
  component: () => (
    <Protected requireRole="operador">
      <PersonaDetalle />
    </Protected>
  ),
});

function PersonaDetalle() {
  const { vinculoId } = useParams({ from: "/operador/persona/$vinculoId" });
  const [vinculo, setVinculo] = useState<any>(null);
  const [persona, setPersona] = useState<any>(null);
  const [ficha, setFicha] = useState<any>(null);
  const [tipo, setTipo] = useState<"ninez" | "dia" | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data: v } = await supabase
      .from("vinculo")
      .select("*, persona:dni(*), dispositivo:dispositivo_id(*)")
      .eq("id", vinculoId)
      .single();
    if (!v) return;
    setVinculo(v);
    setPersona(v.persona);
    const t = v.dispositivo.tipo as "ninez" | "dia";
    setTipo(t);
    const tabla = t === "ninez" ? "ficha_ninez" : "ficha_dia";
    const { data: f } = await supabase.from(tabla).select("*").eq("vinculo_id", vinculoId).maybeSingle();
    setFicha(f ?? {});
    const { data: h } = await supabase
      .from("historial_cambio")
      .select("*")
      .eq("vinculo_id", vinculoId)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistorial(h ?? []);
  }

  useEffect(() => { load(); }, [vinculoId]);

  async function guardarFicha() {
    if (!tipo) return;
    setSaving(true);
    const tabla = tipo === "ninez" ? "ficha_ninez" : "ficha_dia";
    const { error } = await supabase.from(tabla).update(ficha).eq("vinculo_id", vinculoId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Ficha actualizada");
    load();
  }

  async function cambiarEstado(estado: string, motivo?: string) {
    const upd: any = { estado };
    if (estado !== "activo") upd.fecha_baja = new Date().toISOString().slice(0, 10);
    if (motivo) upd.motivo_egreso = motivo;
    const { error } = await supabase.from("vinculo").update(upd).eq("id", vinculoId);
    if (error) return toast.error(error.message);
    toast.success("Estado actualizado");
    load();
  }

  if (!vinculo || !persona) return <p className="text-sm text-muted-foreground p-4">Cargando…</p>;

  return (
    <div className="space-y-3">
      <Link to="/operador" className="text-xs text-muted-foreground">&larr; Volver</Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">{persona.nombre_completo}</h1>
          <p className="text-xs text-muted-foreground">DNI {persona.dni} · {persona.barrio} · {vinculo.dispositivo.nombre}</p>
        </div>
        <EstadoBadge estado={vinculo.estado} />
      </div>

      <Tabs defaultValue="ficha">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="ficha">Ficha</TabsTrigger>
          <TabsTrigger value="estado">Estado</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="ficha" className="space-y-3">
          {tipo === "ninez" ? <FichaNinezForm ficha={ficha} setFicha={setFicha} /> : <FichaDiaForm ficha={ficha} setFicha={setFicha} />}
          <BloquesSensibles ficha={ficha} setFicha={setFicha} />
          <Button className="w-full" onClick={guardarFicha} disabled={saving}>{saving ? "..." : "Guardar cambios"}</Button>
        </TabsContent>

        <TabsContent value="estado" className="space-y-2">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => cambiarEstado("activo")}>Marcar activo</Button>
              <Button variant="outline" className="w-full" onClick={() => cambiarEstado("inasistencia_prolongada")}>Inasistencia prolongada</Button>
              <Button variant="destructive" className="w-full" onClick={() => {
                const m = prompt("Motivo de egreso") ?? "";
                if (m) cambiarEstado("egresado", m);
              }}>Marcar egresado</Button>
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

export function FichaNinezForm({ ficha, setFicha }: any) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Niñez</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Row label="Escolarizado"><Switch checked={!!ficha.escolarizado} onCheckedChange={(v) => setFicha({ ...ficha, escolarizado: v })} /></Row>
        {ficha.escolarizado && <Field label="Año escolar"><Input value={ficha.anio_escolar ?? ""} onChange={(e) => setFicha({ ...ficha, anio_escolar: e.target.value })} /></Field>}
        <Row label="Discapacidad"><Switch checked={!!ficha.discapacidad} onCheckedChange={(v) => setFicha({ ...ficha, discapacidad: v })} /></Row>
        <Row label="Referenciado salud"><Switch checked={!!ficha.referenciado_salud} onCheckedChange={(v) => setFicha({ ...ficha, referenciado_salud: v })} /></Row>
      </CardContent>
    </Card>
  );
}

export function FichaDiaForm({ ficha, setFicha }: any) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Centro de Día</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Row label="Tiene CUD"><Switch checked={!!ficha.tiene_cud} onCheckedChange={(v) => setFicha({ ...ficha, tiene_cud: v })} /></Row>
        <Row label="Limitación permanente"><Switch checked={!!ficha.limitacion_permanente} onCheckedChange={(v) => setFicha({ ...ficha, limitacion_permanente: v })} /></Row>
        <Field label="Nivel educativo"><Input value={ficha.nivel_educativo ?? ""} onChange={(e) => setFicha({ ...ficha, nivel_educativo: e.target.value })} /></Field>
        <Field label="Situación habitacional"><Input value={ficha.situacion_habitacional ?? ""} onChange={(e) => setFicha({ ...ficha, situacion_habitacional: e.target.value })} /></Field>
      </CardContent>
    </Card>
  );
}

export function BloquesSensibles({ ficha, setFicha }: any) {
  const [openC, setOpenC] = useState(!!ficha.consumo_activo || !!ficha.consumo_sustancias);
  const [openV, setOpenV] = useState(!!ficha.violencia_familiar || !!ficha.violencia_tipo);
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Información sensible</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Row label="Mostrar consumo"><Switch checked={openC} onCheckedChange={setOpenC} /></Row>
        {openC && (
          <div className="pl-2 border-l-2 border-accent space-y-2">
            <Row label="Consumo activo"><Switch checked={!!ficha.consumo_activo} onCheckedChange={(v) => setFicha({ ...ficha, consumo_activo: v })} /></Row>
            <Field label="Sustancias"><Input value={ficha.consumo_sustancias ?? ""} onChange={(e) => setFicha({ ...ficha, consumo_sustancias: e.target.value })} /></Field>
            <Field label="Contexto"><Textarea value={ficha.consumo_contexto ?? ""} onChange={(e) => setFicha({ ...ficha, consumo_contexto: e.target.value })} /></Field>
          </div>
        )}
        <Row label="Mostrar violencia familiar"><Switch checked={openV} onCheckedChange={setOpenV} /></Row>
        {openV && (
          <div className="pl-2 border-l-2 border-destructive space-y-2">
            <Row label="Violencia familiar"><Switch checked={!!ficha.violencia_familiar} onCheckedChange={(v) => setFicha({ ...ficha, violencia_familiar: v })} /></Row>
            <Field label="Tipo"><Input value={ficha.violencia_tipo ?? ""} onChange={(e) => setFicha({ ...ficha, violencia_tipo: e.target.value })} /></Field>
            <Field label="Observaciones"><Textarea value={ficha.violencia_observaciones ?? ""} onChange={(e) => setFicha({ ...ficha, violencia_observaciones: e.target.value })} /></Field>
          </div>
        )}
        <Field label="Observaciones generales"><Textarea value={ficha.observaciones ?? ""} onChange={(e) => setFicha({ ...ficha, observaciones: e.target.value })} /></Field>
      </CardContent>
    </Card>
  );
}

export function HistorialList({ items }: { items: any[] }) {
  if (!items.length) return <p className="text-sm text-muted-foreground p-4 text-center">Sin cambios registrados.</p>;
  return (
    <div className="space-y-2">
      {items.map((h) => (
        <Card key={h.id}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{h.tabla} · {h.operacion}</span>
              <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString("es-AR")}</span>
            </div>
            <details className="text-xs mt-1">
              <summary className="text-muted-foreground cursor-pointer">Ver datos</summary>
              <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto">{JSON.stringify(h.datos_nuevos, null, 2)}</pre>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between"><Label className="text-sm">{label}</Label>{children}</div>;
}

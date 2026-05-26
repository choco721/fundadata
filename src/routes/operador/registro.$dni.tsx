import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/operador/registro/$dni")({
  component: () => (
    <Protected requireRole="operador">
      <Registro />
    </Protected>
  ),
});

function Registro() {
  const { dni } = useParams({ from: "/operador/registro/$dni" });
  const { dispositivo } = useAuth();
  const nav = useNavigate();
  const tipo = dispositivo?.tipo;

  const [p, setP] = useState({
    dni,
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    sexo: "F" as "F" | "M" | "X",
    barrio: "",
  });

  // Ficha
  const [f, setF] = useState<any>({
    escolarizado: false,
    anio_escolar: "",
    discapacidad: false,
    referenciado_salud: false,
    tiene_cud: false,
    limitacion_permanente: false,
    nivel_educativo: "",
    situacion_habitacional: "",
    consumo_activo: false,
    consumo_sustancias: "",
    consumo_contexto: "",
    violencia_familiar: false,
    violencia_tipo: "",
    violencia_observaciones: "",
    observaciones: "",
  });

  const [showConsumo, setShowConsumo] = useState(false);
  const [showViolencia, setShowViolencia] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dispositivo) return;
    setSaving(true);
    try {
      // 1. Persona
      const { error: eP } = await supabase.from("persona").insert(p);
      if (eP && !eP.message.includes("duplicate")) throw eP;
      // 2. Vinculo
      const { data: v, error: eV } = await supabase
        .from("vinculo")
        .insert({ dni: p.dni, dispositivo_id: dispositivo.id, estado: "activo" })
        .select("id")
        .single();
      if (eV) throw eV;
      // 3. Ficha según tipo
      if (tipo === "ninez") {
        const ficha = {
          vinculo_id: v.id,
          escolarizado: f.escolarizado,
          anio_escolar: f.anio_escolar || null,
          discapacidad: f.discapacidad,
          referenciado_salud: f.referenciado_salud,
          consumo_activo: showConsumo && f.consumo_activo,
          consumo_sustancias: showConsumo ? f.consumo_sustancias : null,
          consumo_contexto: showConsumo ? f.consumo_contexto : null,
          violencia_familiar: showViolencia && f.violencia_familiar,
          violencia_tipo: showViolencia ? f.violencia_tipo : null,
          violencia_observaciones: showViolencia ? f.violencia_observaciones : null,
          observaciones: f.observaciones || null,
        };
        const { error } = await supabase.from("ficha_ninez").insert(ficha);
        if (error) throw error;
      } else {
        const ficha = {
          vinculo_id: v.id,
          tiene_cud: f.tiene_cud,
          limitacion_permanente: f.limitacion_permanente,
          nivel_educativo: f.nivel_educativo || null,
          situacion_habitacional: f.situacion_habitacional || null,
          consumo_activo: showConsumo && f.consumo_activo,
          consumo_sustancias: showConsumo ? f.consumo_sustancias : null,
          consumo_contexto: showConsumo ? f.consumo_contexto : null,
          violencia_familiar: showViolencia && f.violencia_familiar,
          violencia_tipo: showViolencia ? f.violencia_tipo : null,
          violencia_observaciones: showViolencia ? f.violencia_observaciones : null,
          observaciones: f.observaciones || null,
        };
        const { error } = await supabase.from("ficha_dia").insert(ficha);
        if (error) throw error;
      }
      toast.success("Persona registrada.");
      nav({ to: "/operador/persona/$vinculoId", params: { vinculoId: v.id } });
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h1 className="text-lg font-semibold">
        Registrar nueva persona <span className="text-xs text-muted-foreground">({tipo === "ninez" ? "Niñez" : "Día"})</span>
      </h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Datos personales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="DNI"><Input value={p.dni} onChange={(e) => setP({ ...p, dni: e.target.value })} required /></Field>
          <Field label="Fecha de nacimiento"><Input type="date" value={p.fecha_nacimiento} onChange={(e) => setP({ ...p, fecha_nacimiento: e.target.value })} required /></Field>
          <Field label="Nombre"><Input value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} required /></Field>
          <Field label="Apellido"><Input value={p.apellido} onChange={(e) => setP({ ...p, apellido: e.target.value })} required /></Field>
          <Field label="Sexo">
            <Select value={p.sexo} onValueChange={(v: any) => setP({ ...p, sexo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="X">Otro</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Barrio"><Input value={p.barrio} onChange={(e) => setP({ ...p, barrio: e.target.value })} required /></Field>
        </CardContent>
      </Card>

      {tipo === "ninez" ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Datos de Niñez</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <SwitchRow label="Escolarizado" checked={f.escolarizado} onChange={(v) => setF({ ...f, escolarizado: v })} />
            {f.escolarizado && (
              <Field label="Año escolar"><Input value={f.anio_escolar} onChange={(e) => setF({ ...f, anio_escolar: e.target.value })} placeholder="ej: 4° grado" /></Field>
            )}
            <SwitchRow label="Discapacidad" checked={f.discapacidad} onChange={(v) => setF({ ...f, discapacidad: v })} />
            <SwitchRow label="Referenciado a centro de salud" checked={f.referenciado_salud} onChange={(v) => setF({ ...f, referenciado_salud: v })} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-sm">Datos del Centro de Día</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <SwitchRow label="Tiene CUD" checked={f.tiene_cud} onChange={(v) => setF({ ...f, tiene_cud: v })} />
            <SwitchRow label="Limitación permanente" checked={f.limitacion_permanente} onChange={(v) => setF({ ...f, limitacion_permanente: v })} />
            <Field label="Nivel educativo"><Input value={f.nivel_educativo} onChange={(e) => setF({ ...f, nivel_educativo: e.target.value })} /></Field>
            <Field label="Situación habitacional"><Input value={f.situacion_habitacional} onChange={(e) => setF({ ...f, situacion_habitacional: e.target.value })} /></Field>
          </CardContent>
        </Card>
      )}

      {/* Bloques sensibles condicionales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Información sensible</CardTitle>
          <p className="text-xs text-muted-foreground">Activá los bloques solo si corresponden a esta persona.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <SwitchRow label="Registrar situación de consumo" checked={showConsumo} onChange={setShowConsumo} />
          {showConsumo && (
            <div className="pl-2 border-l-2 border-accent space-y-2">
              <SwitchRow label="Consumo activo" checked={f.consumo_activo} onChange={(v) => setF({ ...f, consumo_activo: v })} />
              <Field label="Sustancias"><Input value={f.consumo_sustancias} onChange={(e) => setF({ ...f, consumo_sustancias: e.target.value })} /></Field>
              <Field label="Contexto"><Textarea value={f.consumo_contexto} onChange={(e) => setF({ ...f, consumo_contexto: e.target.value })} /></Field>
            </div>
          )}

          <SwitchRow label="Registrar violencia familiar" checked={showViolencia} onChange={setShowViolencia} />
          {showViolencia && (
            <div className="pl-2 border-l-2 border-destructive space-y-2">
              <SwitchRow label="Violencia familiar" checked={f.violencia_familiar} onChange={(v) => setF({ ...f, violencia_familiar: v })} />
              <Field label="Tipo"><Input value={f.violencia_tipo} onChange={(e) => setF({ ...f, violencia_tipo: e.target.value })} /></Field>
              <Field label="Observaciones"><Textarea value={f.violencia_observaciones} onChange={(e) => setF({ ...f, violencia_observaciones: e.target.value })} /></Field>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Field label="Observaciones generales"><Textarea value={f.observaciones} onChange={(e) => setF({ ...f, observaciones: e.target.value })} /></Field>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Guardando…" : "Guardar registro"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

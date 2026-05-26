import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/operador/buscar")({
  component: () => (
    <Protected requireRole="operador">
      <Buscar />
    </Protected>
  ),
});

function Buscar() {
  const { dispositivo } = useAuth();
  const nav = useNavigate();
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const { data } = await supabase.from("persona").select("*").eq("dni", dni).maybeSingle();
    setResult(data);
    setSearched(true);
    setLoading(false);
  }

  async function vincular() {
    if (!dispositivo) return;
    // ¿Ya tiene vínculo activo en este centro?
    const { data: existente } = await supabase
      .from("vinculo")
      .select("id")
      .eq("dni", dni)
      .eq("dispositivo_id", dispositivo.id)
      .eq("estado", "activo")
      .maybeSingle();
    if (existente) {
      toast.info("Ya está vinculado en este centro.");
      nav({ to: "/operador/persona/$vinculoId", params: { vinculoId: existente.id } });
      return;
    }
    const { data, error } = await supabase
      .from("vinculo")
      .insert({ dni, dispositivo_id: dispositivo.id, estado: "activo" })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    // Crear ficha vacía según tipo
    const tabla = dispositivo.tipo === "ninez" ? "ficha_ninez" : "ficha_dia";
    await supabase.from(tabla).insert({ vinculo_id: data.id });
    toast.success("Vinculado.");
    nav({ to: "/operador/persona/$vinculoId", params: { vinculoId: data.id } });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Buscar persona</h1>
      <Card>
        <CardHeader><CardTitle className="text-sm">Paso 1: ingresar DNI</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={buscar} className="flex gap-2">
            <Input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))} placeholder="DNI" inputMode="numeric" required minLength={6} />
            <Button type="submit" disabled={loading || !dni}>Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {searched && result && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-accent">Persona encontrada</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{result.nombre_completo}</p>
            <p className="text-xs text-muted-foreground">
              DNI {result.dni} · {result.barrio} · {result.sexo}
            </p>
            <Button onClick={vincular} className="w-full">
              Vincular a {dispositivo?.nombre}
            </Button>
          </CardContent>
        </Card>
      )}

      {searched && !result && (
        <Card>
          <CardHeader><CardTitle className="text-sm">No existe esta persona</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Continuá con el registro completo.</p>
            <Button className="w-full" onClick={() => nav({ to: "/operador/registro/$dni", params: { dni } })}>
              Registrar nueva persona
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

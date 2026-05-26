import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/operador/")({
  component: () => (
    <Protected requireRole="operador">
      <OperadorHome />
    </Protected>
  ),
});

type Row = {
  id: string;
  estado: string;
  fecha_alta: string;
  persona: { dni: string; nombre_completo: string; barrio: string };
};

function OperadorHome() {
  const { dispositivo } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dispositivo) return;
    (async () => {
      const { data } = await supabase
        .from("vinculo")
        .select("id, estado, fecha_alta, persona:dni(dni, nombre_completo, barrio)")
        .eq("dispositivo_id", dispositivo.id)
        .order("fecha_alta", { ascending: false });
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, [dispositivo]);

  if (!dispositivo) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          Tu usuario aún no fue asignado a un centro. Pedí a la Fundación que te asigne uno.
        </CardContent>
      </Card>
    );
  }

  const filtered = rows.filter(
    (r) =>
      !q ||
      r.persona?.nombre_completo?.toLowerCase().includes(q.toLowerCase()) ||
      r.persona?.dni?.includes(q)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{dispositivo.nombre}</h1>
          <p className="text-xs text-muted-foreground">
            {rows.filter((r) => r.estado === "activo").length} activos · {rows.length} en total
          </p>
        </div>
        <Link to="/operador/buscar">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" />Nueva</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Buscar por nombre o DNI" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground p-4 text-center">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 text-center">Sin personas todavía.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Link key={r.id} to="/operador/persona/$vinculoId" params={{ vinculoId: r.id }}>
              <Card className="hover:bg-muted/40 transition-colors">
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{r.persona?.nombre_completo}</p>
                    <p className="text-xs text-muted-foreground">DNI {r.persona?.dni} · {r.persona?.barrio}</p>
                  </div>
                  <EstadoBadge estado={r.estado} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    activo: { label: "Activo", cls: "bg-accent text-accent-foreground" },
    egresado: { label: "Egresado", cls: "bg-muted text-muted-foreground" },
    inasistencia_prolongada: { label: "Inasistencia", cls: "bg-destructive/15 text-destructive" },
  };
  const v = map[estado] ?? { label: estado, cls: "" };
  return <Badge className={v.cls}>{v.label}</Badge>;
}

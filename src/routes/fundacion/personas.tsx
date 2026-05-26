import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { EstadoBadge } from "@/routes/operador/index";

export const Route = createFileRoute("/fundacion/personas")({
  component: () => (
    <Protected requireRole="admin">
      <PersonasTabla />
    </Protected>
  ),
});

function PersonasTabla() {
  const [rows, setRows] = useState<any[]>([]);
  const [disp, setDisp] = useState<any[]>([]);
  const [filterDisp, setFilterDisp] = useState("all");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterBarrio, setFilterBarrio] = useState("");
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: d }, { data: v }] = await Promise.all([
        supabase.from("dispositivo").select("*"),
        supabase
          .from("vinculo")
          .select("id, estado, fecha_alta, fecha_baja, dispositivo:dispositivo_id(id, nombre, tipo), persona:dni(dni, nombre_completo, barrio, sexo, fecha_nacimiento)")
          .order("fecha_alta", { ascending: false }),
      ]);
      setDisp(d ?? []);
      setRows(v ?? []);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (filterDisp !== "all" && r.dispositivo?.id !== filterDisp) return false;
    if (filterEstado !== "all" && r.estado !== filterEstado) return false;
    if (filterBarrio && !r.persona?.barrio?.toLowerCase().includes(filterBarrio.toLowerCase())) return false;
    if (filterDesde && r.fecha_alta < filterDesde) return false;
    if (filterHasta && r.fecha_alta > filterHasta) return false;
    return true;
  }), [rows, filterDisp, filterEstado, filterBarrio, filterDesde, filterHasta]);

  function exportCSV() {
    const headers = ["DNI", "Nombre", "Barrio", "Sexo", "Nacimiento", "Centro", "Tipo", "Estado", "Fecha alta", "Fecha baja"];
    const lines = [headers.join(",")];
    filtered.forEach((r) => {
      lines.push([
        r.persona?.dni,
        `"${r.persona?.nombre_completo ?? ""}"`,
        `"${r.persona?.barrio ?? ""}"`,
        r.persona?.sexo,
        r.persona?.fecha_nacimiento,
        `"${r.dispositivo?.nombre}"`,
        r.dispositivo?.tipo,
        r.estado,
        r.fecha_alta,
        r.fecha_baja ?? "",
      ].join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fundadata-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Personas <span className="text-xs text-muted-foreground">({filtered.length})</span></h1>
        <Button size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-2">
          <Select value={filterDisp} onValueChange={setFilterDisp}>
            <SelectTrigger><SelectValue placeholder="Centro" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los centros</SelectItem>
              {disp.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="egresado">Egresado</SelectItem>
              <SelectItem value="inasistencia_prolongada">Inasistencia</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Barrio" value={filterBarrio} onChange={(e) => setFilterBarrio(e.target.value)} />
          <div />
          <Input type="date" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} placeholder="Desde" />
          <Input type="date" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} placeholder="Hasta" />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((r) => (
          <Link key={r.id} to="/fundacion/persona/$vinculoId" params={{ vinculoId: r.id }}>
            <Card className="hover:bg-muted/40">
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{r.persona?.nombre_completo}</p>
                  <p className="text-xs text-muted-foreground">
                    DNI {r.persona?.dni} · {r.persona?.barrio} · {r.dispositivo?.nombre}
                  </p>
                </div>
                <EstadoBadge estado={r.estado} />
              </CardContent>
            </Card>
          </Link>
        ))}
        {!filtered.length && <p className="text-sm text-muted-foreground text-center p-4">Sin resultados.</p>}
      </div>
    </div>
  );
}

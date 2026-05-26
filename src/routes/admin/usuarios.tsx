import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/usuarios")({
  component: () => (
    <Protected requireRole="admin">
      <AdminUsuarios />
    </Protected>
  ),
});

function AdminUsuarios() {
  const [disp, setDisp] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [dispId, setDispId] = useState("");
  const [rol, setRol] = useState<"operador" | "admin">("operador");

  async function load() {
    const [{ data: d }, { data: r }, { data: a }] = await Promise.all([
      supabase.from("dispositivo").select("*").order("nombre"),
      supabase.from("user_roles").select("*"),
      supabase.from("user_dispositivo").select("*, dispositivo:dispositivo_id(nombre)"),
    ]);
    setDisp(d ?? []); setRoles(r ?? []); setAsignaciones(a ?? []);
  }
  useEffect(() => { load(); }, []);

  async function asignar() {
    if (!userId) return toast.error("Falta el user id");
    // Insertar rol
    const { error: er } = await supabase.from("user_roles").upsert({ user_id: userId, role: rol });
    if (er) return toast.error(er.message);
    if (rol === "operador") {
      if (!dispId) return toast.error("Elegí un centro");
      const { error: ed } = await supabase.from("user_dispositivo").upsert({ user_id: userId, dispositivo_id: dispId });
      if (ed) return toast.error(ed.message);
    }
    toast.success("Asignación guardada");
    setUserId(""); setDispId("");
    load();
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Gestión de usuarios</h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Asignar rol y centro</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">User ID (UUID de auth)</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Ej: 4f9c…" />
            <p className="text-[10px] text-muted-foreground">El operador se registra en /login, después pegás aquí su user id para asignarle centro.</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rol</Label>
            <Select value={rol} onValueChange={(v: any) => setRol(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="operador">Operador</SelectItem>
                <SelectItem value="admin">Admin / Fundación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {rol === "operador" && (
            <div className="space-y-1">
              <Label className="text-xs">Centro</Label>
              <Select value={dispId} onValueChange={setDispId}>
                <SelectTrigger><SelectValue placeholder="Elegir centro" /></SelectTrigger>
                <SelectContent>
                  {disp.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={asignar} className="w-full">Guardar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Asignaciones actuales</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {asignaciones.map((a) => (
            <div key={a.user_id} className="flex justify-between border-b border-border/40 py-1">
              <span className="font-mono">{a.user_id.slice(0, 8)}…</span>
              <span>{a.dispositivo?.nombre}</span>
            </div>
          ))}
          {!asignaciones.length && <p className="text-muted-foreground">Sin operadores asignados.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Roles</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {roles.map((r) => (
            <div key={r.id} className="flex justify-between border-b border-border/40 py-1">
              <span className="font-mono">{r.user_id.slice(0, 8)}…</span>
              <span className="font-medium">{r.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

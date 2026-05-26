import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export function Protected({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "admin" | "operador";
}) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireRole && role !== requireRole) {
    return <Navigate to={role === "admin" ? "/fundacion" : "/operador"} />;
  }
  return <AppShell>{children}</AppShell>;
}

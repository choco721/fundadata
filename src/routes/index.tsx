import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando…</div>;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={role === "admin" ? "/fundacion" : "/operador"} />;
}

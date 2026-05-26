import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, BarChart3, Search } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, role, dispositivo } = useAuth();
  if (!user) return <>{children}</>;

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-30 border-b border-sidebar-border">
        <div className="px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <Link to="/" className="font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-accent" />
            FundaData
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline opacity-80">
              {isAdmin ? "Fundación" : dispositivo?.nombre ?? "Operador"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-5xl w-full mx-auto pb-24">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-30">
        <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-4 gap-1 p-2">
          {isAdmin ? (
            <>
              <NavBtn to="/fundacion" icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" />
              <NavBtn to="/fundacion/personas" icon={<Users className="w-5 h-5" />} label="Personas" />
              <NavBtn to="/admin/usuarios" icon={<Home className="w-5 h-5" />} label="Usuarios" />
            </>
          ) : (
            <>
              <NavBtn to="/operador" icon={<Users className="w-5 h-5" />} label="Mi centro" />
              <NavBtn to="/operador/buscar" icon={<Search className="w-5 h-5" />} label="Nueva" />
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-0.5 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors [&.active]:text-primary [&.active]:bg-muted"
      activeProps={{ className: "active" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

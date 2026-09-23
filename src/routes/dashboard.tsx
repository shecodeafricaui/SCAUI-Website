import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CalendarCheck,
  Gauge,
  KeyRound,
  LayoutGrid,
  LogOut,
  Sparkles,
  UserRound,
  Users,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const LINKS = [
  { to: "/dashboard", label: "Overview", icon: Gauge, exact: true },
  { to: "/dashboard/profile", label: "My profile", icon: UserRound },
  { to: "/dashboard/work", label: "My work", icon: Briefcase },
  { to: "/dashboard/events", label: "Events", icon: CalendarCheck },
  { to: "/dashboard/attendance", label: "Attendance", icon: LayoutGrid },
  { to: "/dashboard/community", label: "Tracks & teams", icon: Users },
  { to: "/dashboard/opportunities", label: "Saved opportunities", icon: Sparkles },
  { to: "/dashboard/security", label: "Password", icon: KeyRound },
] as const;

function DashboardLayout() {
  const { user, loading, profile, isLead, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.must_change_password && pathname !== "/dashboard/security") {
      void navigate({ to: "/dashboard/security" });
    }
  }, [profile?.must_change_password, pathname, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-10 w-10 bg-white p-0.5" />
          <span className="font-display text-sm font-extrabold">SCAUI Portal</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
          {isLead && (
            <Link
              to="/admin"
              className="mt-4 flex items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin area
            </Link>
          )}
        </nav>

        <Button
          variant="ghost"
          className="justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={async () => {
            await signOut();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Member portal</p>
            <p className="font-display text-lg font-bold">{profile?.full_name ?? "Member"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Back to site</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={async () => {
                await signOut();
                void navigate({ to: "/" });
              }}
            >
              Sign out
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-border px-5 py-3 lg:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-medium"
              activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

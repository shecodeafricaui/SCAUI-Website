import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { BarChart3, CalendarCog, Inbox, Layers, Users2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const LINKS: { to: string; label: string; icon: typeof Users2; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/members", label: "Members & approvals", icon: Users2 },
  { to: "/admin/events", label: "Events & attendance", icon: CalendarCog },
  { to: "/admin/content", label: "Content", icon: Layers },
  { to: "/admin/inbox", label: "Inbox & newsletter", icon: Inbox },
];

function AdminLayout() {
  const { user, loading, isLead, profile } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
    if (!loading && user && !isLead) void navigate({ to: "/dashboard" });
  }, [loading, user, isLead, navigate]);

  if (loading || !user || !isLead) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-10 w-10 bg-white p-0.5" />
          <span className="font-display text-sm font-extrabold">SCAUI Admin</span>
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
        </nav>

        <Button asChild variant="ghost" className="justify-start text-sidebar-foreground/75">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Member portal
          </Link>
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin area</p>
            <p className="font-display text-lg font-bold">{profile?.full_name ?? "Chapter lead"}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">My portal</Link>
          </Button>
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

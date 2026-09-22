import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDateTime } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user, profile, roles } = useAuth();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["dashboard-overview", user?.id],
    queryFn: async () => {
      const uid = user!.id;
      const [attendance, registrations, events, announcements, tracks, teams] = await Promise.all([
        supabase.from("attendance").select("*").eq("user_id", uid).order("recorded_at", { ascending: false }),
        supabase.from("event_registrations").select("event_id").eq("user_id", uid),
        supabase
          .from("events")
          .select("*")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .order("starts_at")
          .limit(3),
        supabase.from("announcements").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(3),
        supabase.from("track_members").select("track_id, tracks(name)").eq("user_id", uid),
        supabase.from("team_members").select("team_id, teams(name)").eq("user_id", uid),
      ]);
      return {
        attendance: attendance.data ?? [],
        registrations: registrations.data ?? [],
        events: events.data ?? [],
        announcements: announcements.data ?? [],
        tracks: tracks.data ?? [],
        teams: teams.data ?? [],
      };
    },
  });

  const count = data?.attendance.length ?? 0;
  const pct = Math.min(100, (count / 5) * 100);

  return (
    <div className="space-y-8">
      <section className="surface-ink relative overflow-hidden rounded-3xl p-8">
        <div className="glow-plum absolute inset-0" />
        <div className="relative">
          <span className="eyebrow text-primary">Your SCAUI page</span>
          <h1 className="mt-2 font-display text-3xl font-black">
            Hello, {profile?.full_name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink-muted">
            {profile?.department ? `${profile.department}, ${profile.level ?? ""} level` : "Welcome to your member page."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((r) => (
              <Badge key={r} className="capitalize">{r.replace("_", " ")}</Badge>
            ))}
            {(data?.tracks ?? []).map((t) => (
              // @ts-expect-error nested select typing
              <Badge key={t.track_id} variant="outline" className="border-white/25 text-ink-foreground">{t.tracks?.name}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Engagement
          </div>
          <p className="mt-3 font-display text-3xl font-black">{count}/5</p>
          <Progress value={pct} className="mt-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {count >= 5 ? "You're an active member this session 🎉" : `${5 - count} more activities to go.`}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Registered events
          </div>
          <p className="mt-3 font-display text-3xl font-black">{data?.registrations.length ?? 0}</p>
          <Button asChild variant="link" className="mt-1 px-0">
            <Link to="/dashboard/events">Manage registrations</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Teams
          </div>
          <p className="mt-3 font-display text-3xl font-black">{data?.teams.length ?? 0}</p>
          <Button asChild variant="link" className="mt-1 px-0">
            <Link to="/dashboard/community">Join a team</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Upcoming events</h2>
          <div className="mt-4 space-y-3">
            {(data?.events ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
            ) : (
              (data?.events ?? []).map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded-xl bg-secondary/70 p-4">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{e.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(e.starts_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Announcements</h2>
          <div className="mt-4 space-y-3">
            {(data?.announcements ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements right now.</p>
            ) : (
              (data?.announcements ?? []).map((a) => (
                <div key={a.id} className="rounded-xl bg-secondary/70 p-4">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

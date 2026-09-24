import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [profiles, roster, events, regs, attendance, opps, messages, subs, audit] =
        await Promise.all([
          supabase.from("profiles").select("id, status, current_track, level, faculty"),
          supabase.from("member_records").select("id, approval_status, claimed"),
          supabase.from("events").select("id, title, starts_at, status"),
          supabase.from("event_registrations").select("id"),
          supabase.from("attendance").select("user_id"),
          supabase.from("opportunities").select("id, clicks, title, status"),
          supabase.from("contact_messages").select("id, status"),
          supabase.from("newsletter_subscribers").select("id, subscribed"),
          supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8),
        ]);
      return {
        profiles: profiles.data ?? [],
        roster: roster.data ?? [],
        events: events.data ?? [],
        regs: regs.data ?? [],
        attendance: attendance.data ?? [],
        opps: opps.data ?? [],
        messages: messages.data ?? [],
        subs: subs.data ?? [],
        audit: audit.data ?? [],
      };
    },
  });

  const counts = new Map<string, number>();
  (data?.attendance ?? []).forEach((a) => counts.set(a.user_id, (counts.get(a.user_id) ?? 0) + 1));
  const active = [...counts.values()].filter((n) => n >= 5).length;

  const stats = [
    { label: "Members on the roster", value: data?.roster.length ?? 0 },
    { label: "Accounts activated", value: (data?.roster ?? []).filter((r) => r.claimed).length },
    { label: "Awaiting approval", value: (data?.roster ?? []).filter((r) => r.approval_status === "pending").length },
    { label: "Active members (5+ activities)", value: active },
    { label: "Published events", value: (data?.events ?? []).filter((e) => e.status === "published").length },
    { label: "Event registrations", value: data?.regs.length ?? 0 },
    { label: "Newsletter subscribers", value: (data?.subs ?? []).filter((s) => s.subscribed).length },
    { label: "Open enquiries", value: (data?.messages ?? []).filter((m) => m.status !== "resolved").length },
  ];

  const tracks = new Map<string, number>();
  (data?.profiles ?? []).forEach((p) => {
    if (p.current_track) tracks.set(p.current_track, (tracks.get(p.current_track) ?? 0) + 1);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Chapter overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How the community is growing and how engaged it is this session.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-3xl font-black">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Members by track</h2>
          {tracks.size === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No tracks chosen yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {[...tracks.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([name, n]) => (
                  <li key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <Badge variant="secondary">{n}</Badge>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Recent admin activity</h2>
          {(data?.audit ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-2.5 text-sm">
              {(data?.audit ?? []).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{a.action}</span>
                  <span className="text-muted-foreground">{formatDate(a.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

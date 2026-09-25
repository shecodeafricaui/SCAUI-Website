import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, MapPin, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/events")({
  component: MemberEventsPage,
});

function MemberEventsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["member-events", user?.id],
    queryFn: async () => {
      const [events, regs, counts] = await Promise.all([
        supabase.from("events").select("*").eq("status", "published").order("starts_at"),
        supabase.from("event_registrations").select("*").eq("user_id", user!.id),
        supabase.from("event_registrations").select("event_id"),
      ]);
      return {
        events: events.data ?? [],
        regs: regs.data ?? [],
        counts: counts.data ?? [],
      };
    },
  });

  const register = async (eventId: string, capacity: number | null) => {
    if (!user) return;
    const taken = (data?.counts ?? []).filter((c) => c.event_id === eventId).length;
    const waitlisted = capacity !== null && taken >= capacity;
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: user.id,
      status: waitlisted ? "waitlist" : "confirmed",
    });
    if (error) {
      toast.error("Could not register. You may already be registered.");
      return;
    }
    toast.success(waitlisted ? "Event is full, you're on the waitlist." : "You're registered!");
    void qc.invalidateQueries({ queryKey: ["member-events"] });
  };

  // External events: open the ticket page and mark the member as registered (not attended).
  const registerExternal = async (eventId: string, url: string) => {
    if (!user) return;
    window.open(url, "_blank", "noopener,noreferrer");
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: user.id,
      status: "confirmed",
    });
    if (!error) {
      toast.success("Marked as registered. Complete your ticket on the event site.");
      void qc.invalidateQueries({ queryKey: ["member-events"] });
    }
  };

  const cancel = async (id: string) => {
    await supabase.from("event_registrations").delete().eq("id", id);
    toast.success("Registration cancelled.");
    void qc.invalidateQueries({ queryKey: ["member-events"] });
  };

  const now = Date.now();
  const upcoming = (data?.events ?? []).filter((e) => new Date(e.starts_at).getTime() >= now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Events</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register for what's coming up. Show your check-in code at the door.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {upcoming.map((e) => {
            const reg = (data?.regs ?? []).find((r) => r.event_id === e.id);
            const taken = (data?.counts ?? []).filter((c) => c.event_id === e.id).length;
            return (
              <article key={e.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{e.category}</Badge>
                  {reg && (
                    <Badge className="capitalize">{reg.status === "waitlist" ? "Waitlisted" : "Registered"}</Badge>
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
                <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" /> {formatDateTime(e.starts_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {e.is_online ? "Online" : (e.location ?? "Venue to be announced")}
                  </div>
                  {e.capacity && (
                    <p>
                      {taken}/{e.capacity} spaces taken
                    </p>
                  )}
                </dl>

                {reg ? (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/70 p-3 text-sm">
                      <QrCode className="h-4 w-4 text-primary" />
                      <span className="font-mono text-xs">{reg.qr_token}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => cancel(reg.id)}>
                      Cancel registration
                    </Button>
                  </div>
                ) : e.registration_url ? (
                  <Button size="sm" className="mt-5 w-full" onClick={() => registerExternal(e.id, e.registration_url!)}>
                    Register on the event site
                  </Button>
                ) : (
                  <Button size="sm" className="mt-5 w-full" onClick={() => register(e.id, e.capacity)}>
                    Register
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

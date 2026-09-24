import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const { user } = useAuth();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["member-attendance", user?.id],
    queryFn: async () => {
      const [attendance, completions] = await Promise.all([
        supabase
          .from("attendance")
          .select("*")
          .eq("user_id", user!.id)
          .order("recorded_at", { ascending: false }),
        supabase
          .from("programme_applications")
          .select("id, completed, certificate_url, programmes(title)")
          .eq("user_id", user!.id)
          .eq("completed", true),
      ]);
      return { attendance: attendance.data ?? [], completions: completions.data ?? [] };
    },
  });

  const count = data?.attendance.length ?? 0;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">My attendance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every SCAUI activity you take part in is recorded here.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Session progress</p>
          <Badge variant={count >= 5 ? "default" : "secondary"}>
            {count >= 5 ? "Active member" : "In progress"}
          </Badge>
        </div>
        <p className="mt-3 font-display text-3xl font-black">{count}/5 activities</p>
        <Progress value={Math.min(100, (count / 5) * 100)} className="mt-3" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Engagement history</h2>
        {count === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing recorded yet. Attend an event and it will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {(data?.attendance ?? []).map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl bg-secondary/70 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="capitalize">{a.activity_type}</span> · {formatDate(a.recorded_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Achievements</h2>
        <div className="mt-4 space-y-3">
          {count >= 5 && (
            <div className="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Active member — five activities completed</p>
            </div>
          )}
          {(data?.completions ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">
                Completed {(c as { programmes?: { title?: string } }).programmes?.title}
              </p>
            </div>
          ))}
          {count < 5 && (data?.completions ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Your badges will show up here as you take part.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

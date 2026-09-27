import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

function AdminSupport() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-support"],
    queryFn: async () => {
      const [g, m, p] = await Promise.all([
        supabase.from("grievances").select("*").order("created_at", { ascending: false }),
        supabase.from("mentorship_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      const names = new Map((p.data ?? []).map((x) => [x.id, x.full_name]));
      return { grievances: g.data ?? [], mentorship: m.data ?? [], names };
    },
  });

  const setStatus = async (table: "grievances" | "mentorship_applications", id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) return void toast.error("Couldn't update.");
    void qc.invalidateQueries({ queryKey: ["admin-support"] });
  };

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-2xl font-extrabold">Complaints</h1>
        <div className="mt-4 space-y-3">
          {data?.grievances.length === 0 && <p className="text-sm text-muted-foreground">Nothing reported.</p>}
          {data?.grievances.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{g.subject}</p>
                <Badge variant="secondary" className="capitalize">{g.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {g.category} · {g.anonymous ? "Anonymous" : data.names.get(g.user_id) ?? "Member"} ·{" "}
                {new Date(g.created_at).toLocaleDateString()}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm">{g.message}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setStatus("grievances", g.id, "in_review")}>In review</Button>
                <Button size="sm" onClick={() => setStatus("grievances", g.id, "resolved")}>Resolved</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-extrabold">Mentorship applications</h2>
        <div className="mt-4 space-y-3">
          {data?.mentorship.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
          {data?.mentorship.map((a) => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {data.names.get(a.user_id) ?? "Member"} · <span className="capitalize">{a.role}</span>
                </p>
                <Badge variant="secondary" className="capitalize">{a.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.areas.join(", ")} · {a.availability}</p>
              {a.goals && <p className="mt-2 text-sm">{a.goals}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setStatus("mentorship_applications", a.id, "accepted")}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus("mentorship_applications", a.id, "declined")}>Decline</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

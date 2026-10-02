import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/datacamp")({
  component: AdminDataCamp,
});

const LICENCES = 50;
const FILTERS = ["all", "pending", "accepted", "rejected"] as const;

function AdminDataCamp() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-datacamp"],
    queryFn: async () => {
      const { data: p } = await supabase.from("programmes").select("id").eq("slug", "datacamp-scholarship").maybeSingle();
      if (!p) return { apps: [], people: new Map<string, { full_name: string; email: string; level: string | null; faculty: string | null }>() };
      const [a, pr] = await Promise.all([
        supabase.from("programme_applications").select("*").eq("programme_id", p.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email, level, faculty"),
      ]);
      return { apps: a.data ?? [], people: new Map((pr.data ?? []).map((x) => [x.id, x])) };
    },
  });

  const apps = data?.apps ?? [];
  const accepted = apps.filter((a) => a.status === "accepted").length;
  const pending = apps.filter((a) => a.status === "pending").length;

  const rows = useMemo(() => {
    const term = q.toLowerCase();
    return apps.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      const p = data?.people.get(a.user_id);
      return !term || `${p?.full_name} ${p?.email} ${a.motivation}`.toLowerCase().includes(term);
    });
  }, [apps, filter, q, data]);

  const setStatus = async (id: string, status: string) => {
    if (status === "accepted" && accepted >= LICENCES) {
      toast.error("All 50 licences have been given out.");
      return;
    }
    const { error } = await supabase.from("programme_applications").update({ status }).eq("id", id);
    if (error) return toast.error("Could not update.");
    toast.success(`Marked ${status}.`);
    void qc.invalidateQueries({ queryKey: ["admin-datacamp"] });
  };

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["Name", "Email", "Level", "Faculty", "Status", "Applied", "Motivation"].join(",")];
    for (const a of rows) {
      const p = data?.people.get(a.user_id);
      lines.push([p?.full_name, p?.email, p?.level, p?.faculty, a.status, a.created_at.slice(0, 10), a.motivation].map(esc).join(","));
    }
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "datacamp-applications.csv";
    link.click();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">DataCamp scholarship</h1>
      <p className="mt-2 text-sm text-muted-foreground">Review applications and hand out the 50 DataCamp Donates licences.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[["Applications", apps.length], ["Awaiting review", pending], ["Licences given", `${accepted} / ${LICENCES}`], ["Licences left", Math.max(0, LICENCES - accepted)]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
        <Input placeholder="Search name, email, track…" value={q} onChange={(e) => setQ(e.target.value)} className="ml-auto max-w-xs" />
        <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
        {rows.map((a) => {
          const p = data?.people.get(a.user_id);
          return (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p?.full_name ?? "Member"}</p>
                  <p className="text-xs text-muted-foreground">{p?.email} · {[p?.level, p?.faculty].filter(Boolean).join(" · ")} · applied {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={a.status === "accepted" ? "default" : a.status === "rejected" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge>
              </div>
              {a.motivation && <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{a.motivation}</p>}
              <div className="mt-4 flex gap-2">
                <Button size="sm" disabled={a.status === "accepted"} onClick={() => setStatus(a.id, "accepted")}>Give licence</Button>
                <Button size="sm" variant="outline" disabled={a.status === "rejected"} onClick={() => setStatus(a.id, "rejected")}>Decline</Button>
                {a.status !== "pending" && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "pending")}>Reset</Button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

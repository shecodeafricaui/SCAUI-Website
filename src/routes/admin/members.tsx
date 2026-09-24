import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";
import { listMemberRecords, reviewMemberApplication } from "@/lib/scaui.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/admin/members")({
  component: AdminMembers,
});

function AdminMembers() {
  const qc = useQueryClient();
  const fetchRecords = useServerFn(listMemberRecords);
  const review = useServerFn(reviewMemberApplication);
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-members"],
    queryFn: () => fetchRecords(),
  });

  const records = data?.records ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return records;
    return records.filter((r) =>
      [r.full_name, r.email, r.level, r.faculty, r.department, r.current_track, r.preferred_team]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle)),
    );
  }, [records, q]);

  const pending = records.filter((r) => r.approval_status === "pending");

  const decide = async (id: string, decision: "approved" | "rejected") => {
    const res = await review({ data: { record_id: id, decision } });
    if (!res.ok) {
      toast.error(res.error ?? "Could not save that decision.");
      return;
    }
    toast.success(decision === "approved" ? "Member approved." : "Application rejected.");
    void qc.invalidateQueries({ queryKey: ["admin-members"] });
  };

  const exportCsv = () => {
    const head = [
      "Full name", "Email", "Phone", "Birthday", "Gender", "Faculty", "Department",
      "Level", "Track", "Preferred team", "Volunteer", "Approval", "Activated",
    ];
    const rows = filtered.map((r) => [
      r.full_name, r.email, r.phone, r.birthday, r.gender, r.faculty, r.department,
      r.level, r.current_track, r.preferred_team, r.willing_to_volunteer ? "Yes" : "No",
      r.approval_status, r.claimed ? "Yes" : "No",
    ]);
    const csv = [head, ...rows]
      .map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "scaui-members.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Members</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {records.length} people on the roster · {pending.length} awaiting approval
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All members</TabsTrigger>
          <TabsTrigger value="pending">Approvals ({pending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, email, level, team…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.level ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.preferred_team ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.claimed ? "default" : "secondary"} className="capitalize">
                        {r.claimed ? "Active" : r.approval_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications waiting.</p>
          ) : (
            pending.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold">{r.full_name}</p>
                    <p className="text-sm text-muted-foreground">{r.email}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[r.level, r.department, r.faculty].filter(Boolean).join(" · ")}
                    </p>
                    {r.expectations && (
                      <p className="mt-3 max-w-xl text-sm">{r.expectations}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Applied {formatDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decide(r.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Search, UserCheck, UserX } from "lucide-react";
import { listActivationStatus, type ActivationRow } from "@/lib/scaui.functions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/admin/activation")({
  component: AdminActivation,
});

type Stage = "not_signed_in" | "password_pending" | "done";

function stageOf(r: ActivationRow): Stage {
  if (!r.claimed) return "not_signed_in";
  if (r.must_change_password) return "password_pending";
  return "done";
}

const STAGE_LABEL: Record<Stage, string> = {
  not_signed_in: "Not signed in",
  password_pending: "Password not changed",
  done: "Fully set up",
};

function AdminActivation() {
  const fetchRows = useServerFn(listActivationStatus);
  const [q, setQ] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-activation"],
    queryFn: () => fetchRows(),
  });

  const rows = useMemo(() => data?.rows ?? [], [data]);

  const approved = rows.filter((r) => r.approval_status === "approved");
  const notSignedIn = approved.filter((r) => stageOf(r) === "not_signed_in");
  const passwordPending = approved.filter((r) => stageOf(r) === "password_pending");
  const done = approved.filter((r) => stageOf(r) === "done");

  const filter = (list: ActivationRow[]) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((r) =>
      [r.full_name, r.email, r.desired_role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle)),
    );
  };

  const renderTable = (list: ActivationRow[]) => (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[46rem] text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Signed in</th>
            <th className="px-4 py-3">Password changed</th>
            <th className="px-4 py-3">Profile filled</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                Nobody in this group.
              </td>
            </tr>
          ) : (
            list.map((r) => {
              const stage = stageOf(r);
              return (
                <tr key={r.record_id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{r.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {r.desired_role?.replace(/_/g, " ") ?? "Member"}
                  </td>
                  <td className="px-4 py-3">
                    {r.claimed ? (
                      <span className="text-muted-foreground">
                        {r.claimed_at ? formatDate(r.claimed_at) : "Yes"}
                      </span>
                    ) : (
                      <Badge variant="secondary">Not yet</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {stage === "done" ? (
                      <Badge>Yes</Badge>
                    ) : stage === "password_pending" ? (
                      <Badge variant="secondary">Still using first password</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.claimed ? (
                      r.profile_completed ? (
                        <Badge variant="outline">Complete</Badge>
                      ) : (
                        <Badge variant="secondary">Incomplete</Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Onboarding tracker</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          See which approved members and excos have signed in, changed their first password, and
          filled in their profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserX className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Not signed in</p>
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold">{notSignedIn.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Password not changed</p>
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold">{passwordPending.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Fully set up</p>
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold">{done.length}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name, email or role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Tabs defaultValue="not_signed_in">
        <TabsList>
          <TabsTrigger value="not_signed_in">Not signed in ({notSignedIn.length})</TabsTrigger>
          <TabsTrigger value="password_pending">
            Password pending ({passwordPending.length})
          </TabsTrigger>
          <TabsTrigger value="done">Fully set up ({done.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="not_signed_in" className="mt-6">
          {renderTable(filter(notSignedIn))}
        </TabsContent>
        <TabsContent value="password_pending" className="mt-6">
          {renderTable(filter(passwordPending))}
        </TabsContent>
        <TabsContent value="done" className="mt-6">
          {renderTable(filter(done))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/admin/inbox")({
  component: AdminInbox,
});

const SEGMENTS = ["all", "members", "volunteers", "alumni", "new"] as const;

function AdminInbox() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({ subject: "", body: "", segment: "all", scheduled_for: "" });

  const { data } = useQuery({
    queryKey: ["admin-inbox"],
    queryFn: async () => {
      const [messages, newsletters, subs] = await Promise.all([
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
        supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
      ]);
      return {
        messages: messages.data ?? [],
        newsletters: newsletters.data ?? [],
        subs: subs.data ?? [],
      };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-inbox"] });

  const setStatus = async (id: string, status: string) => {
    await supabase.from("contact_messages").update({ status }).eq("id", id);
    void refresh();
  };

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("newsletters").insert({
      subject: draft.subject,
      body: draft.body,
      segment: draft.segment,
      status: draft.scheduled_for ? "scheduled" : "draft",
      scheduled_for: draft.scheduled_for ? new Date(draft.scheduled_for).toISOString() : null,
    });
    if (error) {
      toast.error("Could not save the newsletter.");
      return;
    }
    setDraft({ subject: "", body: "", segment: "all", scheduled_for: "" });
    toast.success("Newsletter saved.");
    void refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Inbox & newsletter</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enquiries from the website, and the weekly newsletter.
        </p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Enquiries</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers ({data?.subs.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6 space-y-4">
          {(data?.messages ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            (data?.messages ?? []).map((m) => (
              <article key={m.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.subject ?? "No subject"}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.name} · {m.email} · {formatDate(m.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{m.status}</Badge>
                    {m.status !== "resolved" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(m.id, "resolved")}>
                        Mark resolved
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm">{m.message}</p>
                <Button asChild size="sm" variant="ghost" className="mt-3 px-0">
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "Your message to SCAUI")}`}>
                    Reply by email
                  </a>
                </Button>
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="newsletter" className="mt-6 space-y-6">
          <form onSubmit={saveDraft} className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">New issue</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required value={draft.subject}
                  onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment">Who gets it</Label>
                <select
                  id="segment"
                  value={draft.segment}
                  onChange={(e) => setDraft((d) => ({ ...d, segment: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {SEGMENTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="scheduled_for">Send at (leave empty to keep as a draft)</Label>
                <Input id="scheduled_for" type="datetime-local" value={draft.scheduled_for}
                  onChange={(e) => setDraft((d) => ({ ...d, scheduled_for: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Content</Label>
              <Textarea id="body" rows={8} value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
            </div>
            <Button type="submit">Save issue</Button>
          </form>

          <div className="space-y-3">
            {(data?.newsletters ?? []).map((n) => (
              <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                <div>
                  <p className="font-semibold">{n.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {n.segment} · {n.scheduled_for ? formatDate(n.scheduled_for) : "not scheduled"}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">{n.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="mt-6">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Segment</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.subs ?? []).map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.segment}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.subscribed ? "default" : "secondary"}>
                        {s.subscribed ? "Subscribed" : "Unsubscribed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

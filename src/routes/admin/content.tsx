import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Content | SCAUI Admin" }] }),
  component: AdminContent,
});

function AdminContent() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const [teams, ann] = await Promise.all([
        supabase.from("teams").select("*").order("name"),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      ]);
      return { teams: teams.data ?? [], announcements: ann.data ?? [] };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-content"] });
  const [links, setLinks] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const saveLink = async (id: string, value: string) => {
    const { error } = await supabase.from("teams").update({ whatsapp_url: value || null }).eq("id", id);
    if (error) { toast.error("Could not save that link."); return; }
    toast.success("WhatsApp link saved.");
    void refresh();
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("announcements")
      .insert({ title, body: body || null, audience: "public", status: "published" });
    if (error) { toast.error("Could not post announcement."); return; }
    setTitle("");
    setBody("");
    void refresh();
  };

  const toggle = async (id: string, status: string) => {
    await supabase.from("announcements").update({ status: status === "published" ? "draft" : "published" }).eq("id", id);
    void refresh();
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Content</h1>
        <p className="mt-2 text-sm text-muted-foreground">Team WhatsApp groups and announcements.</p>
      </div>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Volunteer team WhatsApp groups</h2>
        {(data?.teams ?? []).map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-2">
            <span className="w-48 text-sm font-medium">{t.name}</span>
            <Input
              className="max-w-md flex-1"
              placeholder="https://chat.whatsapp.com/…"
              value={links[t.id] ?? t.whatsapp_url ?? ""}
              onChange={(e) => setLinks((l) => ({ ...l, [t.id]: e.target.value }))}
            />
            <Button size="sm" variant="outline" onClick={() => saveLink(t.id, links[t.id] ?? t.whatsapp_url ?? "")}>
              Save
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Announcements</h2>
        <form onSubmit={addAnnouncement} className="space-y-3">
          <Input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={3} placeholder="Details" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button type="submit" size="sm">Post announcement</Button>
        </form>
        <ul className="space-y-2">
          {(data?.announcements ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/70 px-4 py-2.5 text-sm">
              <span>{a.title} <Badge variant="outline" className="ml-2 capitalize">{a.status}</Badge></span>
              <Button size="sm" variant="ghost" onClick={() => toggle(a.id, a.status)}>
                {a.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

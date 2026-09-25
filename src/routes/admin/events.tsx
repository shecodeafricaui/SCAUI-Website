import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EVENT_CATEGORIES, formatDateTime } from "@/lib/constants";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

const EMPTY = {
  title: "",
  description: "",
  category: EVENT_CATEGORIES[0] ?? "workshop",
  location: "",
  starts_at: "",
  capacity: "",
  registration_url: "",
};

function AdminEvents() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const [events, regs, attendance, profiles] = await Promise.all([
        supabase.from("events").select("*").order("starts_at", { ascending: false }),
        supabase.from("event_registrations").select("*"),
        supabase.from("attendance").select("*"),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      return {
        events: events.data ?? [],
        regs: regs.data ?? [],
        attendance: attendance.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-events"] });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("events").insert({
      title: form.title,
      slug: `${slug}-${Date.now().toString(36)}`,
      description: form.description || null,
      category: form.category,
      location: form.location || null,
      registration_url: form.registration_url || null,
      is_online: false,
      starts_at: new Date(form.starts_at).toISOString(),
      capacity: form.capacity ? Number(form.capacity) : null,
      status: "draft",
      created_by: user?.id ?? null,
    });
    if (error) {
      toast.error("Could not create that event.");
      return;
    }
    setForm(EMPTY);
    toast.success("Event created as a draft.");
    void refresh();
  };

  const togglePublish = async (id: string, status: string) => {
    await supabase
      .from("events")
      .update({ status: status === "published" ? "draft" : "published" })
      .eq("id", id);
    void refresh();
  };

  const cancelEvent = async (id: string) => {
    await supabase.from("events").update({ status: "cancelled" }).eq("id", id);
    void refresh();
  };

  const markPresent = async (eventId: string, title: string, userId: string, method: string) => {
    const already = (data?.attendance ?? []).some(
      (a) => a.event_id === eventId && a.user_id === userId,
    );
    if (already) {
      toast.info("Already checked in.");
      return;
    }
    const { error } = await supabase.from("attendance").insert({
      user_id: userId,
      activity_type: "event",
      event_id: eventId,
      title,
      method,
      recorded_by: user?.id ?? null,
    });
    if (error) {
      toast.error("Could not record attendance.");
      return;
    }
    toast.success("Attendance recorded.");
    void refresh();
  };

  const checkInByCode = async (eventId: string, title: string) => {
    const reg = (data?.regs ?? []).find(
      (r) => r.event_id === eventId && r.qr_token === code.trim(),
    );
    if (!reg) {
      toast.error("No registration matches that code.");
      return;
    }
    await markPresent(eventId, title, reg.user_id, "qr");
    setCode("");
  };

  const nameOf = (id: string) =>
    (data?.profiles ?? []).find((p) => p.id === id)?.full_name ?? "Member";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Events & attendance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create events, publish them, and check members in on the day.
        </p>
      </div>

      <form onSubmit={create} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">New event</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="starts_at">Starts</Label>
            <Input id="starts_at" type="datetime-local" required value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (optional)</Label>
            <Input id="capacity" type="number" min="1" value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Venue</Label>
            <Input id="location" value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="registration_url">External registration link (optional)</Label>
            <Input id="registration_url" type="url" placeholder="https://…" value={form.registration_url}
              onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <Button type="submit">Create event</Button>
      </form>

      <div className="space-y-4">
        {(data?.events ?? []).map((e) => {
          const regs = (data?.regs ?? []).filter((r) => r.event_id === e.id);
          const present = (data?.attendance ?? []).filter((a) => a.event_id === e.id);
          const open = selected === e.id;
          return (
            <article key={e.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{e.status}</Badge>
                    <Badge variant="outline" className="capitalize">{e.category}</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDateTime(e.starts_at)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {regs.length} registered · {present.length} attended
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => togglePublish(e.id, e.status)}>
                    {e.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => cancelEvent(e.id)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => setSelected(open ? null : e.id)}>
                    {open ? "Close" : "Attendance"}
                  </Button>
                </div>
              </div>

              {open && (
                <div className="mt-6 space-y-4 border-t border-border pt-5">
                  <div className="flex flex-wrap gap-2">
                    <Input
                      className="max-w-xs"
                      placeholder="Scan or type the member's check-in code"
                      value={code}
                      onChange={(ev) => setCode(ev.target.value)}
                    />
                    <Button size="sm" onClick={() => checkInByCode(e.id, e.title)}>
                      Check in
                    </Button>
                  </div>

                  {regs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nobody has registered yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {regs.map((r) => {
                        const here = present.some((a) => a.user_id === r.user_id);
                        return (
                          <li
                            key={r.id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-secondary/70 px-4 py-2.5 text-sm"
                          >
                            <span>
                              {nameOf(r.user_id)}
                              <span className="ml-2 capitalize text-muted-foreground">{r.status}</span>
                            </span>
                            {here ? (
                              <Badge>Present</Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markPresent(e.id, e.title, r.user_id, "manual")}
                              >
                                Mark present
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

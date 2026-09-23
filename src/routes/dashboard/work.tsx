import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Github, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/work")({
  component: MyWorkPage,
});

const EMPTY = {
  title: "",
  role: "",
  description: "",
  tech: "",
  project_url: "",
  repo_url: "",
  is_public: true,
};

function MyWorkPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["my-work", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("member_projects")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || form.title.trim().length < 2) return;
    setBusy(true);
    const { error } = await supabase.from("member_projects").insert({
      user_id: user.id,
      title: form.title.trim(),
      role: form.role.trim() || null,
      description: form.description.trim() || null,
      tech_stack: form.tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      project_url: form.project_url.trim() || null,
      repo_url: form.repo_url.trim() || null,
      is_public: form.is_public,
    });
    setBusy(false);
    if (error) {
      toast.error("We couldn't save that project.");
      return;
    }
    setForm(EMPTY);
    toast.success("Project added to your page.");
    void qc.invalidateQueries({ queryKey: ["my-work"] });
  };

  const remove = async (id: string) => {
    await supabase.from("member_projects").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["my-work"] });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">My work</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the things you've built or worked on. This is how the chapter tracks and showcases
          what our members are doing.
        </p>
      </div>

      <form onSubmit={add} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Project title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Your role</Label>
            <Input
              id="role"
              placeholder="Frontend developer"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_url">Live link</Label>
            <Input
              id="project_url"
              placeholder="https://"
              value={form.project_url}
              onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo_url">Code or case study link</Label>
            <Input
              id="repo_url"
              placeholder="https://github.com/..."
              value={form.repo_url}
              onChange={(e) => setForm((f) => ({ ...f, repo_url: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tech">Tools used (comma separated)</Label>
          <Input
            id="tech"
            placeholder="Figma, React, Python"
            value={form.tech}
            onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">What is it?</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox
            checked={form.is_public}
            onCheckedChange={(v) => setForm((f) => ({ ...f, is_public: v === true }))}
          />
          Show this on my public member page
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add project"}
        </Button>
      </form>

      <div className="space-y-4">
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't added any work yet.</p>
        ) : (
          (data ?? []).map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  {p.role && <p className="text-sm text-muted-foreground">{p.role}</p>}
                </div>
                <button type="button" onClick={() => remove(p.id)} aria-label="Delete project">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {p.description && <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>}
              {p.tech_stack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech_stack.map((t: string) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {p.project_url && (
                  <a
                    href={p.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Live
                  </a>
                )}
                {p.repo_url && (
                  <a
                    href={p.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary"
                  >
                    <Github className="h-3.5 w-3.5" /> Code
                  </a>
                )}
                {!p.is_public && <span className="text-muted-foreground">Private</span>}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

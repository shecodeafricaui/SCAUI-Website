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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/support")({
  component: SupportPage,
});

const CATEGORIES = ["General", "Event", "Team or volunteering", "Conduct", "Platform issue", "Other"];

function SupportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["my-grievances", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("grievances")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || subject.trim().length < 3 || message.trim().length < 10) {
      return void toast.error("Please add a subject and a few details.");
    }
    setBusy(true);
    const { error } = await supabase.from("grievances").insert({
      user_id: user.id,
      category,
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
      anonymous,
    });
    setBusy(false);
    if (error) return void toast.error("We couldn't send that. Please try again.");
    toast.success("Sent. The chapter leads will look into it.");
    setSubject(""); setMessage(""); setAnonymous(false);
    void qc.invalidateQueries({ queryKey: ["my-grievances"] });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Complaints & concerns</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something wrong? Tell the chapter leads privately. Only admins can read this.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button key={c} type="button" size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}>
                {c}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">What happened?</Label>
          <Textarea id="message" rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={anonymous} onCheckedChange={(v) => setAnonymous(v === true)} />
          Hide my name from the leads reviewing this
        </label>
        <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send"}</Button>
      </form>

      {data && data.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">What I've sent</h2>
          {data.map((g) => (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{g.subject}</p>
                <Badge variant="secondary" className="capitalize">{g.status}</Badge>
              </div>
              {g.admin_note && <p className="mt-2 text-sm text-muted-foreground">Reply: {g.admin_note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

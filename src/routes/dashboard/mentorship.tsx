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

export const Route = createFileRoute("/dashboard/mentorship")({
  component: MentorshipPage,
});

function MentorshipPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [areas, setAreas] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState("");
  const [availability, setAvailability] = useState("");
  const [busy, setBusy] = useState(false);

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["my-mentorship", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("mentorship_applications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("mentorship_applications").insert({
      user_id: user.id,
      role,
      areas: areas.split(",").map((a) => a.trim()).filter(Boolean),
      experience: experience.trim() || null,
      goals: goals.trim() || null,
      availability: availability.trim() || null,
    });
    setBusy(false);
    if (error) return void toast.error("We couldn't send your application.");
    toast.success("Application sent. We'll match you soon.");
    setAreas(""); setExperience(""); setGoals(""); setAvailability("");
    void qc.invalidateQueries({ queryKey: ["my-mentorship"] });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Mentorship</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apply to be mentored, or to mentor other members.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-2">
          {(["mentee", "mentor"] as const).map((r) => (
            <Button key={r} type="button" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)}>
              {r === "mentee" ? "I want a mentor" : "I want to mentor"}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="areas">Areas (comma separated)</Label>
          <Input id="areas" required placeholder="UI/UX, Frontend" value={areas} onChange={(e) => setAreas(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp">{role === "mentor" ? "Your experience" : "Where you are now"}</Label>
          <Textarea id="exp" rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goals">{role === "mentor" ? "How you'd like to help" : "What you want to achieve"}</Label>
          <Textarea id="goals" rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avail">Availability</Label>
          <Input id="avail" placeholder="2 hours a week, weekends" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send application"}</Button>
      </form>

      {data && data.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">My applications</h2>
          {data.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="text-sm font-semibold capitalize">{a.role}</p>
                <p className="text-xs text-muted-foreground">{a.areas.join(", ")}</p>
              </div>
              <Badge variant="secondary" className="capitalize">{a.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

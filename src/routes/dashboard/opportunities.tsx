import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/opportunities")({
  component: MemberOpportunities,
});

function MemberOpportunities() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["member-opportunities", user?.id],
    queryFn: async () => {
      const [opps, marks] = await Promise.all([
        supabase.from("opportunities").select("*").eq("status", "published").order("deadline"),
        supabase.from("opportunity_bookmarks").select("*").eq("user_id", user!.id),
      ]);
      return { opps: opps.data ?? [], marks: marks.data ?? [] };
    },
  });

  const interests = profile?.interests ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const open = (data?.opps ?? []).filter((o) => !o.deadline || o.deadline >= today);
  const recommended = open.filter((o) =>
    o.tags.some((t: string) => interests.includes(t)) ||
    interests.some((i) => (o.description ?? "").toLowerCase().includes(i.toLowerCase())),
  );

  const toggle = async (id: string) => {
    if (!user) return;
    const existing = (data?.marks ?? []).find((m) => m.opportunity_id === id);
    if (existing) {
      await supabase.from("opportunity_bookmarks").delete().eq("id", existing.id);
    } else {
      await supabase.from("opportunity_bookmarks").insert({ opportunity_id: id, user_id: user.id });
      toast.success("Saved to your board.");
    }
    void qc.invalidateQueries({ queryKey: ["member-opportunities"] });
  };

  const list = recommended.length > 0 ? recommended : open;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Opportunities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {recommended.length > 0
            ? `Based on your interests, here are ${recommended.length} opportunities for you.`
            : "Everything currently open to the chapter."}
        </p>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing open right now.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((o) => {
            const saved = (data?.marks ?? []).some((m) => m.opportunity_id === o.id);
            return (
              <article key={o.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="secondary" className="capitalize">{o.category}</Badge>
                  <button type="button" onClick={() => toggle(o.id)} aria-label="Save opportunity">
                    {saved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold">{o.title}</h3>
                {o.organisation && (
                  <p className="text-sm font-medium text-muted-foreground">{o.organisation}</p>
                )}
                {o.description && (
                  <p className="mt-3 flex-1 line-clamp-4 text-sm text-muted-foreground">{o.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Deadline: {formatDate(o.deadline)}</p>
                  {o.apply_url && (
                    <Button size="sm" asChild>
                      <a href={o.apply_url} target="_blank" rel="noopener noreferrer">
                        Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

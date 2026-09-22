import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, OPPORTUNITY_CATEGORIES } from "@/lib/constants";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity board | She Code Africa UI Chapter" },
      {
        name: "description",
        content:
          "Internships, scholarships, fellowships, hackathons and grants curated for SCAUI members.",
      },
      { property: "og:title", content: "SCAUI Opportunity Board" },
      { property: "og:description", content: "Curated internships, scholarships and fellowships." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["public-opportunities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("deadline", { ascending: true });
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const items = (data ?? []).filter((o) => {
    if (o.deadline && o.deadline < today) return false;
    if (category !== "all" && o.category !== category) return false;
    if (search && !`${o.title} ${o.organisation ?? ""}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const trackClick = async (id: string, clicks: number, url: string | null) => {
    await supabase.from("opportunities").update({ clicks: clicks + 1 }).eq("id", id);
    if (url) window.open(url, "_blank", "noopener");
  };

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Grow"
        title="Opportunity board"
        description="Internships, scholarships, fellowships, hackathons and grants — curated weekly for the chapter."
      />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
          >
            <option value="all">All categories</option>
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No open opportunities match that. New ones are posted every week.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {items.map((o) => (
              <article key={o.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{o.category}</Badge>
                  {o.featured && <Badge>Featured</Badge>}
                  {o.is_remote && <Badge variant="outline">Remote</Badge>}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{o.title}</h3>
                {o.organisation && (
                  <p className="text-sm font-medium text-muted-foreground">{o.organisation}</p>
                )}
                {o.description && (
                  <p className="mt-3 flex-1 line-clamp-4 text-sm text-muted-foreground">{o.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Deadline: <strong>{formatDate(o.deadline)}</strong>
                  </p>
                  <Button size="sm" onClick={() => trackClick(o.id, o.clicks, o.apply_url)}>
                    Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

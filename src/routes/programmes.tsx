import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/programmes")({
  head: () => ({
    meta: [
      { title: "Programmes | She Code Africa UI Chapter" },
      {
        name: "description",
        content:
          "Intro to Tech, Career Pathways, AI Engineering, portfolio labs and mentorship programmes at SCAUI.",
      },
      { property: "og:title", content: "SCAUI Programmes" },
      { property: "og:description", content: "Structured learning programmes for women in tech at UI." },
    ],
  }),
  component: ProgrammesPage,
});

function ProgrammesPage() {
  const { data: programmes, isLoading } = useQuery({
    queryKey: ["public-programmes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("programmes")
        .select("*")
        .eq("status", "published")
        .order("starts_on", { ascending: false });
      return data ?? [];
    },
  });

  const { data: tracks } = useQuery({
    queryKey: ["public-tracks"],
    queryFn: async () => {
      const { data } = await supabase.from("tracks").select("*").order("cluster");
      return data ?? [];
    },
  });

  const clusters = [...new Set((tracks ?? []).map((t) => t.cluster))];

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Learn"
        title="Programmes & learning tracks"
        description="Structured cohorts and sessions that take you from curious to capable, with facilitators and clear completion criteria."
      />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-extrabold">Open programmes</h2>
        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (programmes ?? []).length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No programmes are open right now. Join the chapter to be notified when the next cohort opens.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(programmes ?? []).map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-card p-6">
                <Badge variant="secondary" className="capitalize">{p.category}</Badge>
                <h3 className="mt-4 font-display text-lg font-bold">{p.title}</h3>
                {p.description && (
                  <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">{p.description}</p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  {formatDate(p.starts_on)} – {formatDate(p.ends_on)}
                </p>
                <Button asChild size="sm" className="mt-5 w-full" disabled={!p.applications_open}>
                  <Link to="/dashboard">
                    {p.applications_open ? "Apply in your dashboard" : "Applications closed"}
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        )}

        <h2 className="mt-16 font-display text-2xl font-extrabold">Learning tracks</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <div key={cluster} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-bold text-primary">{cluster}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(tracks ?? [])
                  .filter((t) => t.cluster === cluster)
                  .map((t) => (
                    <li key={t.id}>
                      <span className="font-semibold text-foreground">{t.name}</span>
                      {t.description ? ` — ${t.description}` : ""}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

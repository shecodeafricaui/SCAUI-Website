import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects | She Code Africa UI Chapter" },
      {
        name: "description",
        content:
          "Real community projects built by SCAUI members — developers, designers, product managers and writers working together.",
      },
      { property: "og:title", content: "SCAUI Projects" },
      { property: "og:description", content: "Community projects built by She Code Africa UI members." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .neq("status", "draft")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Build"
        title="Community projects"
        description="We don't only teach tech — we help members build and demonstrate real skills. Every project has open roles for designers, developers, PMs, writers and analysts."
      />
      <div className="mx-auto max-w-6xl px-5 py-16">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The first community projects are being set up. Members will be able to apply for roles here.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <Badge variant="secondary" className="self-start capitalize">{p.status}</Badge>
                <h3 className="mt-4 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>
                {p.open_roles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.open_roles.map((r: string) => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>
                )}
                <Button asChild size="sm" className="mt-5">
                  <Link to="/dashboard">Apply for a role</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

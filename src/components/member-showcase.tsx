import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MemberShowcase() {
  const { data } = useQuery({
    queryKey: ["public-showcase"],
    queryFn: async () => {
      const { data } = await supabase.rpc("public_showcase", { _limit: 6 });
      return data ?? [];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <span className="eyebrow text-primary">Member spotlight</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">Built by our members</h2>
      <p className="mt-3 max-w-lg text-muted-foreground">
        Real projects from SCAUI members. Like what you see? Reach out and hire them.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => {
          const hire = p.linkedin_url || p.portfolio_url || p.behance_url || p.github_url;
          return (
            <article key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {p.member_name}
                {p.role ? ` · ${p.role}` : ""}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold">{p.title}</h3>
              {p.description && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              )}
              {p.tech_stack?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech_stack.slice(0, 5).map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Case study</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{p.title}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm font-semibold text-muted-foreground">by {p.member_name}</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {p.case_study || p.description || "Case study coming soon."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.project_url && (
                        <Button asChild size="sm" variant="outline">
                          <a href={p.project_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1.5 h-4 w-4" /> Live
                          </a>
                        </Button>
                      )}
                      {p.repo_url && (
                        <Button asChild size="sm" variant="outline">
                          <a href={p.repo_url} target="_blank" rel="noreferrer">
                            <Github className="mr-1.5 h-4 w-4" /> Code
                          </a>
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button asChild size="sm">
                  {hire ? (
                    <a href={hire} target="_blank" rel="noreferrer">Hire this person</a>
                  ) : (
                    <Link to="/contact">Hire this person</Link>
                  )}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

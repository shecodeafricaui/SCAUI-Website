import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/scholarships/datacamp")({
  head: () => ({
    meta: [
      { title: "DataCamp Scholarship | She Code Africa UI Chapter" },
      { name: "description", content: "50 free DataCamp licences for SCAUI members through DataCamp Donates. See the courses and apply." },
      { property: "og:title", content: "SCAUI x DataCamp Donates Scholarship" },
      { property: "og:description", content: "50 fully funded DataCamp licences for SCAUI members. Apply now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataCampPage,
});

const TRACKS: { area: string; courses: string[] }[] = [
  { area: "Data Analysis", courses: ["Data Analyst in Python", "Data Analyst in SQL", "Data Analyst in Power BI", "Tableau Fundamentals", "Excel Fundamentals"] },
  { area: "Data Science", courses: ["Data Scientist in Python", "Data Scientist in R", "Statistics Fundamentals", "Associate Data Scientist"] },
  { area: "AI & Machine Learning", courses: ["Machine Learning Scientist in Python", "AI Fundamentals", "Developing AI Applications", "Deep Learning in Python", "Generative AI & LLM Concepts"] },
  { area: "Programming", courses: ["Python Programming", "R Programming", "SQL Fundamentals", "Python Developer"] },
  { area: "Data Engineering & Cloud", courses: ["Data Engineer in Python", "Associate Data Engineer in SQL", "Cloud Computing (AWS, Azure, GCP)", "Git & Shell Fundamentals"] },
  { area: "Certifications", courses: ["Data Analyst Associate", "Data Scientist Associate", "Data Engineer Associate", "SQL Associate", "AI Engineer"] },
];

function DataCampPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [motivation, setMotivation] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);

  const { data } = useQuery({
    queryKey: ["datacamp", user?.id],
    queryFn: async () => {
      const { data: p } = await supabase.from("programmes").select("id, applications_open").eq("slug", "datacamp-scholarship").maybeSingle();
      let applied: string | null = null;
      if (p && user) {
        const { data: a } = await supabase.from("programme_applications").select("status").eq("programme_id", p.id).eq("user_id", user.id).maybeSingle();
        applied = a?.status ?? null;
      }
      return { programme: p, applied };
    },
  });

  const toggle = (c: string) => setChosen((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !data?.programme) return;
    const text = `Tracks of interest: ${chosen.join(", ") || "Not specified"}\n\n${motivation}`;
    const { error } = await supabase.from("programme_applications").insert({ programme_id: data.programme.id, user_id: user.id, motivation: text });
    if (error) { toast.error("Could not submit. You may have applied already."); return; }
    toast.success("Application received! We'll let you know if you get a licence.");
    void qc.invalidateQueries({ queryKey: ["datacamp"] });
  };

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Scholarship · DataCamp Donates"
        title="50 free DataCamp licences"
        description="Through our DataCamp Donates partnership, SCAUI members can learn data, AI and programming on DataCamp for free. Access starts 2 October 2026."
      />
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-extrabold">What you can learn</h2>
        <p className="mt-2 text-sm text-muted-foreground">A licence unlocks the full DataCamp library. Popular tracks include:</p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => (
            <div key={t.area} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-base font-bold text-primary">{t.area}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {t.courses.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl font-extrabold">Apply for a licence</h2>
          {!user ? (
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Only approved SCAUI members can apply. Sign in to continue.</p>
              <div className="flex gap-3">
                <Button asChild><Link to="/auth">Sign in</Link></Button>
                <Button asChild variant="outline"><Link to="/join">Join SCAUI</Link></Button>
              </div>
            </div>
          ) : data?.applied ? (
            <p className="mt-4 text-sm">Your application status: <Badge className="ml-1 capitalize">{data.applied}</Badge></p>
          ) : !data?.programme?.applications_open ? (
            <p className="mt-4 text-sm text-muted-foreground">Applications are closed.</p>
          ) : (
            <form onSubmit={apply} className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Which areas interest you?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRACKS.map((t) => (
                    <button type="button" key={t.area} onClick={() => toggle(t.area)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${chosen.includes(t.area) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                      {t.area}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea required rows={4} placeholder="Why do you want this scholarship, and what will you complete in 3 months?" value={motivation} onChange={(e) => setMotivation(e.target.value)} />
              <Button type="submit">Submit application</Button>
            </form>
          )}
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">Proudly supported by DataCamp Donates.</p>
      </div>
    </PublicLayout>
  );
}

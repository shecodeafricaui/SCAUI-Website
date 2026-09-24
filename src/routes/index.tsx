import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Sparkles,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "She Code Africa UI Chapter | Learn, build, belong" },
      {
        name: "description",
        content:
          "She Code Africa University of Ibadan Chapter: learning tracks, monthly events, real projects and a weekly opportunity board for women in tech.",
      },
      { property: "og:title", content: "She Code Africa — UI Chapter" },
      {
        property: "og:description",
        content: "Learn, build and demonstrate real tech skills with women at the University of Ibadan.",
      },
    ],
  }),
  component: Index,
});

const CLUSTERS = [
  { name: "Design", tracks: "Graphics Design · UI/UX", icon: Sparkles },
  { name: "Software Engineering", tracks: "Frontend · Backend · Mobile", icon: Hammer },
  { name: "Data & AI", tracks: "Data Analysis · Data Science · AI/ML", icon: Compass },
  { name: "Product & Business", tracks: "Product · Project · Marketing", icon: GraduationCap },
  { name: "Emerging Tech", tracks: "Cybersecurity · Blockchain", icon: Users },
];

const JOURNEY = [
  { n: "1", title: "Join", body: "Fill the membership form and get added to the chapter." },
  { n: "2", title: "Pick a track", body: "Choose the tech path you want to grow in." },
  { n: "3", title: "Show up", body: "Attend at least five SCAUI activities each session." },
  { n: "4", title: "Build", body: "Join a community project and ship something real." },
  { n: "5", title: "Grow", body: "Apply for opportunities with a portfolio behind you." },
];

function Index() {
  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [members, events, opportunities, projects] = await Promise.all([
        supabase.from("member_records").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("projects").select("id", { count: "exact", head: true }).neq("status", "draft"),
      ]);
      return {
        members: members.count ?? 0,
        events: events.count ?? 0,
        opportunities: opportunities.count ?? 0,
        projects: projects.count ?? 0,
      };
    },
  });

  const { data: spotlight } = useQuery({
    queryKey: ["home-spotlight"],
    queryFn: async () => {
      const { data } = await supabase
        .from("spotlights")
        .select("*")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: upcoming } = useQuery({
    queryKey: ["home-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="surface-ink relative overflow-hidden">
        <div className="glow-plum absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <Badge className="border border-primary/40 bg-primary/15 text-primary-foreground">
              University of Ibadan Chapter
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.08] md:text-6xl">
              Women who <span className="text-gradient-brand">learn, build</span> and belong.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
              SCAUI is where UI students turn curiosity about tech into skills, portfolios and
              opportunities with a community that shows up for each other.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/join">
                  Join SCAUI <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
              >
                <Link to="/programmes">See programmes</Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { label: "Members", value: 70 },
                { label: "Learning tracks", value: 13 },
                { label: "Open opportunities", value: 5 },
                // { label: "Members", value: stats?.members ?? 0 },
                // { label: "Learning tracks", value: 13 },
                // { label: "Open opportunities", value: stats?.opportunities ?? 0 },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-3xl font-black">{s.value}+</dd>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-widest text-ink-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/20 blur-3xl" />
            <img
              src={heroImage}
              alt="SCAUI members collaborating on laptops"
              width={1600}
              height={1104}
              className="relative rounded-3xl border border-white/10 object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="eyebrow text-primary">What we do</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
              More than a tech club.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We run structured learning tracks, monthly gatherings and real community projects, so
              every member leaves with proof of what she can do.
            </p>
            <Button asChild variant="link" className="mt-3 px-0">
              <Link to="/projects">
                Browse our projects <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: GraduationCap, title: "Guided learning tracks", body: "Thirteen tracks across five clusters, each with a lead and resources." },
              { icon: CalendarDays, title: "Monthly activities", body: "Hangouts, workshops and labs — attendance tracked for every member." },
              { icon: Hammer, title: "Community projects", body: "Build with designers, developers, PMs and writers on real products." },
              { icon: HeartHandshake, title: "Volunteer teams", body: "Programs, Design, Content, Publicity, Welfare and more." },
            ].map((v) => (
              <div
                key={v.title}
                className="flex items-start gap-4 rounded-2xl border-l-[3px] border-primary bg-secondary/70 px-5 py-4"
              >
                <v.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold">{v.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK CLUSTERS */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <span className="eyebrow text-primary">Learning tracks</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
              Find your path in tech
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Pick a cluster, join a track, and learn alongside members with the same goal.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CLUSTERS.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent">
                  <c.icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="mt-5 text-base font-bold">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.tracks}</p>
              </div>
            ))}
            <div className="flex flex-col justify-center rounded-2xl border border-dashed border-primary/40 bg-accent/40 p-7">
              <p className="font-display text-lg font-bold">Not sure yet?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with Intro to Tech and explore before you commit.
              </p>
              <Button asChild variant="link" className="mt-2 self-start px-0">
                <Link to="/programmes">See programmes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center">
          <span className="eyebrow text-primary">The member journey</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            Five steps, one session
          </h2>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {JOURNEY.map((s) => (
            <li key={s.n} className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-lg font-black text-primary-foreground shadow-lift">
                {s.n}
              </span>
              <h4 className="mt-4 text-sm font-bold">{s.title}</h4>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* UPCOMING EVENTS */}
      {upcoming && upcoming.length > 0 && (
        <section className="bg-secondary/60 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow text-primary">What's next</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold">Upcoming events</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/events">All events</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {upcoming.map((e) => (
                <Link
                  key={e.id}
                  to="/events"
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <Badge variant="secondary" className="capitalize">{e.category}</Badge>
                  <h3 className="mt-4 font-display text-lg font-bold">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPOTLIGHT */}
      {spotlight && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 rounded-3xl border border-border bg-card p-8 md:grid-cols-[auto_1fr] md:p-12">
            {spotlight.photo_url ? (
              <img
                src={spotlight.photo_url}
                alt={spotlight.name}
                loading="lazy"
                className="h-28 w-28 rounded-full border-4 border-primary object-cover"
              />
            ) : (
              <span className="grid h-28 w-28 place-items-center rounded-full bg-primary font-display text-3xl font-black text-primary-foreground">
                {spotlight.name.charAt(0)}
              </span>
            )}
            <div>
              <span className="eyebrow text-primary">Member spotlight</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold">{spotlight.title}</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">{spotlight.name}</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {spotlight.story}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MEMBER PORTAL CTA */}
      <section className="surface-ink relative overflow-hidden">
        <div className="glow-plum absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
          <span className="eyebrow text-primary">Member portal</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
            Your SCAUI page, your progress
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-muted">
            Every member gets a personal page: profile, tracks, event history, attendance count,
            projects and achievements all in one place.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Your profile", body: "Keep your details and interests current." },
              { title: "Your attendance", body: "Track progress toward five activities." },
              { title: "Your projects", body: "Apply for roles and show your work." },
              { title: "Your opportunities", body: "Save internships and scholarships." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                <p className="text-sm font-bold">{f.title}</p>
                <p className="mt-1.5 text-sm text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Member sign in</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            >
              <Link to="/join">Not a member yet?</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-ink-muted">
            First time signing in? Use your membership email and the password <strong>@scaui</strong>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}

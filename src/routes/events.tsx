import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/constants";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events | She Code Africa UI Chapter" },
      {
        name: "description",
        content: "Workshops, labs, hangouts and meetups from the She Code Africa UI Chapter.",
      },
      { property: "og:title", content: "SCAUI Events" },
      { property: "og:description", content: "See what's coming up at She Code Africa, UI Chapter." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("starts_at", { ascending: true });
      return data ?? [];
    },
  });

  const now = Date.now();
  const upcoming = (data ?? []).filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = (data ?? []).filter((e) => new Date(e.starts_at).getTime() < now).reverse();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Gather"
        title="SCAUI events"
        description="Every session we run workshops, labs and hangouts. Members register here and their attendance counts toward the five-activity goal."
      />
      <div className="mx-auto max-w-6xl space-y-16 px-5 py-16">
        <Section title="Upcoming" empty="No events scheduled yet — check back soon." loading={isLoading} items={upcoming} />
        <Section title="Past events" empty="Nothing here yet." loading={false} items={past} muted />
      </div>
    </PublicLayout>
  );
}

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  is_online: boolean;
  starts_at: string;
  capacity: number | null;
}

function Section({
  title,
  items,
  empty,
  loading,
  muted,
}: {
  title: string;
  items: EventRow[];
  empty: string;
  loading: boolean;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <article
              key={e.id}
              className={`rounded-2xl border border-border bg-card p-6 ${muted ? "opacity-80" : ""}`}
            >
              <Badge variant="secondary" className="capitalize">{e.category}</Badge>
              <h3 className="mt-4 font-display text-lg font-bold">{e.title}</h3>
              {e.description && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>
              )}
              <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {formatDateTime(e.starts_at)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {e.is_online ? "Online" : (e.location ?? "Venue to be announced")}
                </div>
                {e.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    {e.capacity} spaces
                  </div>
                )}
              </dl>
              {!muted && (
                <Button asChild size="sm" className="mt-5 w-full">
                  <Link to="/dashboard/events">Register</Link>
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

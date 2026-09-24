import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/community")({
  component: CommunityPage,
});

function CommunityPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["member-community", user?.id],
    queryFn: async () => {
      const uid = user!.id;
      const [tracks, myTracks, teams, myTeamApps, myTeams, projects, projApps, programmes, progApps] =
        await Promise.all([
          supabase.from("tracks").select("*").order("cluster"),
          supabase.from("track_members").select("*").eq("user_id", uid),
          supabase.from("teams").select("*").order("name"),
          supabase.from("team_applications").select("*").eq("user_id", uid),
          supabase.from("team_members").select("*").eq("user_id", uid),
          supabase.from("projects").select("*").neq("status", "draft"),
          supabase.from("project_applications").select("*").eq("user_id", uid),
          supabase.from("programmes").select("*").eq("status", "published"),
          supabase.from("programme_applications").select("*").eq("user_id", uid),
        ]);
      return {
        tracks: tracks.data ?? [],
        myTracks: myTracks.data ?? [],
        teams: teams.data ?? [],
        myTeamApps: myTeamApps.data ?? [],
        myTeams: myTeams.data ?? [],
        projects: projects.data ?? [],
        projApps: projApps.data ?? [],
        programmes: programmes.data ?? [],
        progApps: progApps.data ?? [],
      };
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["member-community"] });

  const joinTrack = async (trackId: string) => {
    if (!user) return;
    const existing = (data?.myTracks ?? []).find((t) => t.track_id === trackId);
    if (existing) {
      await supabase.from("track_members").delete().eq("id", existing.id);
    } else {
      await supabase.from("track_members").insert({ track_id: trackId, user_id: user.id });
      toast.success("You joined the track.");
    }
    void refresh();
  };

  const applyTeam = async (teamId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("team_applications")
      .insert({ team_id: teamId, user_id: user.id });
    if (error) {
      toast.error("You already applied to this team.");
      return;
    }
    toast.success("Application sent to the team lead.");
    void refresh();
  };

  const applyProject = async (projectId: string, role: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("project_applications")
      .insert({ project_id: projectId, user_id: user.id, role_applied: role });
    if (error) {
      toast.error("You already applied to this project.");
      return;
    }
    toast.success("Application sent.");
    void refresh();
  };

  const applyProgramme = async (programmeId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("programme_applications")
      .insert({ programme_id: programmeId, user_id: user.id });
    if (error) {
      toast.error("You already applied to this programme.");
      return;
    }
    toast.success("Application submitted.");
    void refresh();
  };

  const clusters = [...new Set((data?.tracks ?? []).map((t) => t.cluster))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Tracks, teams & projects</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick your learning path, volunteer for a team, and apply to build real things.
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList>
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-6 space-y-6">
          {clusters.map((cluster) => (
            <div key={cluster}>
              <h2 className="font-display text-lg font-bold text-primary">{cluster}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.tracks ?? [])
                  .filter((t) => t.cluster === cluster)
                  .map((t) => {
                    const joined = (data?.myTracks ?? []).some((m) => m.track_id === t.id);
                    return (
                      <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                        <p className="text-sm font-bold">{t.name}</p>
                        <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
                        <Button
                          size="sm"
                          variant={joined ? "outline" : "default"}
                          className="mt-4 w-full"
                          onClick={() => joinTrack(t.id)}
                        >
                          {joined ? "Leave track" : "Join track"}
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="teams" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.teams ?? []).map((t) => {
            const applied = (data?.myTeamApps ?? []).find((a) => a.team_id === t.id);
            const member = (data?.myTeams ?? []).some((m) => m.team_id === t.id);
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-bold">{t.name}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
                {member ? (
                  <Badge className="mt-4">You're on this team</Badge>
                ) : applied ? (
                  <Badge variant="secondary" className="mt-4 capitalize">{applied.status}</Badge>
                ) : (
                  <Button size="sm" className="mt-4 w-full" onClick={() => applyTeam(t.id)}>
                    Volunteer
                  </Button>
                )}
                {(member || applied) &&
                  (t.whatsapp_url ? (
                    <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                      <a href={t.whatsapp_url} target="_blank" rel="noopener noreferrer">
                        Join the WhatsApp group
                      </a>
                    </Button>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      The WhatsApp group link will appear here once the team lead adds it.
                    </p>
                  ))}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="projects" className="mt-6 grid gap-4 md:grid-cols-2">
          {(data?.projects ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No projects open yet.</p>
          )}
          {(data?.projects ?? []).map((p) => {
            const applied = (data?.projApps ?? []).find((a) => a.project_id === p.id);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                <p className="mt-3 font-display text-base font-bold">{p.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.summary}</p>
                {applied ? (
                  <Badge className="mt-4 capitalize">{applied.status}</Badge>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(p.open_roles.length > 0 ? p.open_roles : ["Contributor"]).map((r: string) => (
                      <Button key={r} size="sm" variant="outline" onClick={() => applyProject(p.id, r)}>
                        Apply: {r}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="programmes" className="mt-6 grid gap-4 md:grid-cols-2">
          {(data?.programmes ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No programmes open yet.</p>
          )}
          {(data?.programmes ?? []).map((p) => {
            const applied = (data?.progApps ?? []).find((a) => a.programme_id === p.id);
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-5">
                <Badge variant="secondary" className="capitalize">{p.category}</Badge>
                <p className="mt-3 font-display text-base font-bold">{p.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDate(p.starts_on)} – {formatDate(p.ends_on)}
                </p>
                {applied ? (
                  <Badge className="mt-4 capitalize">{applied.status}</Badge>
                ) : (
                  <Button
                    size="sm"
                    className="mt-4"
                    disabled={!p.applications_open}
                    onClick={() => applyProgramme(p.id)}
                  >
                    {p.applications_open ? "Apply" : "Applications closed"}
                  </Button>
                )}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

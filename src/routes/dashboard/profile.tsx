import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TRACK_OPTIONS } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, refresh, user } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    birthday: "",
    gender: "",
    faculty: "",
    department: "",
    level: "",
    bio: "",
    current_track: "",
    birthday_visible: true,
    willing_to_volunteer: false,
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      birthday: profile.birthday ?? "",
      gender: profile.gender ?? "",
      faculty: profile.faculty ?? "",
      department: profile.department ?? "",
      level: profile.level ?? "",
      bio: profile.bio ?? "",
      current_track: profile.current_track ?? "",
      birthday_visible: profile.birthday_visible,
      willing_to_volunteer: profile.willing_to_volunteer,
    });
    setInterests(profile.interests ?? []);
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        ...form,
        birthday: form.birthday || null,
        interests,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("We couldn't save your profile.");
      return;
    }
    await refresh();
    toast.success("Profile updated.");
  };

  const toggle = (t: string) =>
    setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold">My profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is what the chapter sees on your member page.
      </p>

      <form onSubmit={save} className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {([
            ["full_name", "Full name"],
            ["phone", "Phone number"],
            ["gender", "Gender"],
            ["level", "Level"],
            ["faculty", "Faculty"],
            ["department", "Department"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_track">Current track</Label>
            <select
              id="current_track"
              value={form.current_track}
              onChange={(e) => setForm((f) => ({ ...f, current_track: e.target.value }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Not decided yet</option>
              {TRACK_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea
            id="bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
        </div>

        <div className="space-y-3">
          <Label>Interests</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {TRACK_OPTIONS.map((t) => (
              <label key={t} className="flex items-center gap-2.5 text-sm">
                <Checkbox checked={interests.includes(t)} onCheckedChange={() => toggle(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              checked={form.birthday_visible}
              onCheckedChange={(v) => setForm((f) => ({ ...f, birthday_visible: v === true }))}
            />
            Show my birthday to the chapter
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              checked={form.willing_to_volunteer}
              onCheckedChange={(v) => setForm((f) => ({ ...f, willing_to_volunteer: v === true }))}
            />
            I'm willing to volunteer when needed
          </label>
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}

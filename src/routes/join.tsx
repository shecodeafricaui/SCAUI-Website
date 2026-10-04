import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { joinScaui } from "@/lib/scaui.functions";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TRACK_OPTIONS, TEAM_OPTIONS } from "@/lib/constants";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join SCAUI | She Code Africa UI Chapter" },
      {
        name: "description",
        content:
          "Become a member of the She Code Africa University of Ibadan chapter and join a learning track.",
      },
      { property: "og:title", content: "Join SCAUI" },
      { property: "og:description", content: "Become a member of She Code Africa, UI Chapter." },
    ],
  }),
  component: JoinPage,
});

const WHATSAPP_GROUP = "https://chat.whatsapp.com/D1pUHKbhxMGFNcmI7IQ99B";

function JoinPage() {
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [idCard, setIdCard] = useState<File | null>(null);

  const toggle = (t: string) =>
    setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);

    let idCardPayload: { name: string; type: string; data: string } | null = null;
    if (idCard) {
      if (idCard.size > 5 * 1024 * 1024) {
        setBusy(false);
        toast.error("ID card file must be under 5MB.");
        return;
      }
      const buf = await idCard.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      idCardPayload = { name: idCard.name, type: idCard.type, data: btoa(binary) };
    }

    const result = await joinScaui({
      data: {
        email: String(fd.get("email") ?? ""),
        full_name: String(fd.get("full_name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        birthday: String(fd.get("birthday") ?? ""),
        gender: String(fd.get("gender") ?? ""),
        faculty: String(fd.get("faculty") ?? ""),
        department: String(fd.get("department") ?? ""),
        level: String(fd.get("level") ?? ""),
        university: String(fd.get("university") ?? ""),
        id_card: idCardPayload,
        expectations: String(fd.get("expectations") ?? ""),
        preferred_team: String(fd.get("preferred_team") ?? ""),
        willing_to_volunteer: fd.get("volunteer") === "on",
        interests,
      },
    });
    setBusy(false);
    if (!result.ok) {
      if ("already" in result && result.already) {
        setAlready(result.error);
        return;
      }
      toast.error(result.error);
      return;
    }
    setDone(true);
  };

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Membership"
        title="Join She Code Africa, UI Chapter"
        description="Tell us a little about yourself. Once you're on the list you can activate your member page with the first-time password @scaui."
      />

      <div className="mx-auto max-w-2xl px-5 py-16">
        {already ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold">You're already with us 💜</h2>
            <p className="mt-3 text-muted-foreground">{already}</p>
            <Button asChild className="mt-6">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold">You're on the list 🎉</h2>
            <p className="mt-3 text-muted-foreground">
              Once your application is approved, activate your member page using your email and the
              first-time password <strong>@scaui</strong>.
            </p>
            <p className="mt-3 text-muted-foreground">
              Meanwhile, come say hello in our WhatsApp community — that's where everything happens
              first.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href={WHATSAPP_GROUP} target="_blank" rel="noreferrer">
                  Join the WhatsApp group
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth">Activate my account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="full_name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone number" name="phone" />
              <Field label="Birthday" name="birthday" type="date" />
              <Field label="Gender" name="gender" />
              <Field label="Level" name="level" placeholder="e.g. 300" />
              <Field
                label="University"
                name="university"
                placeholder="University of Ibadan"
                required
              />
              <Field label="Faculty" name="faculty" />
              <Field label="Department" name="department" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_card">Proof of studentship (school ID card)</Label>
              <Input
                id="id_card"
                name="id_card"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required
                onChange={(e) => setIdCard(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                A clear photo or PDF of your student ID card, under 5MB. Only admins can see it.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Tracks you're interested in</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {TRACK_OPTIONS.map((t) => (
                  <label key={t} className="flex items-center gap-2.5 text-sm">
                    <Checkbox checked={interests.includes(t)} onCheckedChange={() => toggle(t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectations">What do you expect from SCAUI?</Label>
              <Textarea id="expectations" name="expectations" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_team">Team you'd like to join</Label>
              <select
                id="preferred_team"
                name="preferred_team"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">No preference</option>
                {TEAM_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox name="volunteer" />
              I'm willing to volunteer when needed
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Submitting…" : "Join SCAUI"}
            </Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}

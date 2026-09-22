import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SCAUI | She Code Africa UI Chapter" },
      {
        name: "description",
        content: "Reach the She Code Africa UI Chapter team about partnerships, speaking or membership.",
      },
      { property: "og:title", content: "Contact SCAUI" },
      { property: "og:description", content: "Get in touch with the She Code Africa UI Chapter team." },
    ],
  }),
  component: ContactPage,
});

const CATEGORIES = ["general", "membership", "partnership", "speaking", "sponsorship"];

function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      category: String(fd.get("category") ?? "general"),
      message: String(fd.get("message") ?? ""),
    });
    setBusy(false);
    if (error) {
      toast.error("We couldn't send that. Please try again.");
      return;
    }
    setSent(true);
    toast.success("Message sent. We'll get back to you soon.");
  };

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Say hello"
        title="Contact SCAUI"
        description="Questions, partnership ideas or want to speak at a session? Send us a note and the team will respond."
      />
      <div className="mx-auto max-w-2xl px-5 py-16">
        {sent ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold">Thank you</h2>
            <p className="mt-3 text-muted-foreground">
              Your message reached the SCAUI team. We usually reply within a few days.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} required />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

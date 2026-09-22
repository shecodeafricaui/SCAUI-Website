import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("We couldn't subscribe you. Please try again.");
      return;
    }
    toast.success("You're subscribed. Watch your inbox each week.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={cn(
          "flex-1",
          variant === "dark" && "border-white/15 bg-white/10 text-ink-foreground placeholder:text-ink-muted",
        )}
      />
      <Button type="submit" disabled={busy}>
        {busy ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/security")({
  component: SecurityPage,
});

function SecurityPage() {
  const { profile, refresh, user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const mustChange = profile?.must_change_password ?? false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password.toLowerCase() === "@scaui") {
      toast.error("Please choose a password different from the first-time one.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    if (user) {
      await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    }
    await refresh();
    setBusy(false);
    setPassword("");
    setConfirm("");
    toast.success("Password updated.");
    if (mustChange) void navigate({ to: "/dashboard" });
  };

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl font-extrabold">
        {mustChange ? "Set your own password" : "Change password"}
      </h1>
      {mustChange && (
        <p className="mt-3 rounded-lg bg-accent/60 p-3 text-sm text-accent-foreground">
          You signed in with the shared first-time password. Choose a private password before you
          continue, everything else unlocks after this.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw2">Confirm new password</Label>
          <Input id="pw2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Save password"}
        </Button>
      </form>
    </div>
  );
}

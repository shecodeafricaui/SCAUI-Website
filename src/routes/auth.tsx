import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { activateAccount } from "@/lib/scaui.functions";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/public-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Member sign in | She Code Africa UI Chapter" },
      {
        name: "description",
        content: "Sign in to your SCAUI member page, or activate your account for the first time.",
      },
      { property: "og:title", content: "Member sign in | SCAUI" },
      { property: "og:description", content: "Access your SCAUI member dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setBusy(false);
    if (error) {
      toast.error("Email or password is not correct. First time here? Use the Activate tab.");
      return;
    }
    toast.success("Welcome back!");
    void navigate({ to: "/dashboard" });
  };

  const activate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const cleanEmail = email.trim().toLowerCase();
    const result = await activateAccount({ data: { email: cleanEmail, password } });
    if (!result.ok) {
      setBusy(false);
      toast.error(result.error);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: "@scaui",
    });
    setBusy(false);
    if (error) {
      toast.error("Account created. Please sign in now.");
      return;
    }
    toast.success("Account activated. Please set your own password.");
    void navigate({ to: "/dashboard/security" });
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20">
        <div className="text-center">
          <span className="eyebrow text-primary">Member portal</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Welcome to SCAUI</h1>
        </div>

        <Tabs defaultValue="signin" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="activate">First time</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="activate">
            <form onSubmit={activate} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
              <p className="rounded-lg bg-accent/60 p-3 text-sm text-accent-foreground">
                Already on the SCAUI member list? Enter your membership email and the first-time
                password <strong>@scaui</strong>. You'll set your own password right after.
              </p>
              <div className="space-y-2">
                <Label htmlFor="ac-email">Membership email</Label>
                <Input
                  id="ac-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ac-password">First-time password</Label>
                <Input
                  id="ac-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="@scaui"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Activating…" : "Activate my account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Not on the list yet? <Link to="/join" className="font-semibold text-primary">Join SCAUI</Link>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}

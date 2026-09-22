import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="surface-ink relative overflow-hidden">
      <div className="glow-plum absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-5 py-20">
        <span className="eyebrow text-primary">{eyebrow}</span>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{description}</p>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/newsletter-form";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="surface-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-11 w-11 bg-white p-0.5" />
            <span className="font-display text-base font-extrabold">She Code Africa</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            The University of Ibadan chapter. We help women learn, build and demonstrate real-world
            tech skills.
          </p>
        </div>

        <div>
          <h5 className="eyebrow mb-4 text-ink-foreground">Community</h5>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
            <li><Link to="/programmes" className="hover:text-primary">Programmes</Link></li>
            <li><Link to="/projects" className="hover:text-primary">Projects</Link></li>
            <li><Link to="/events" className="hover:text-primary">Events</Link></li>
            <li><Link to="/opportunities" className="hover:text-primary">Opportunities</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="eyebrow mb-4 text-ink-foreground">Members</h5>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
            <li><Link to="/join" className="hover:text-primary">Join SCAUI</Link></li>
            <li><Link to="/auth" className="hover:text-primary">Member sign in</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Member dashboard</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="eyebrow mb-4 text-ink-foreground">Weekly newsletter</h5>
          <p className="mb-4 text-sm text-ink-muted">
            Opportunities, events and community news, once a week.
          </p>
          <NewsletterForm variant="dark" />
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-ink-muted md:col-span-4">
          © {new Date().getFullYear()} She Code Africa — University of Ibadan Chapter.
        </div>
      </div>
    </footer>
  );
}

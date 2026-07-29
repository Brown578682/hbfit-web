import NewsletterForm from "@/components/NewsletterForm";
import Link from "next/link";
import Image from "next/image";
// Social icons as inline SVGs (lucide-react doesn't include brand icons)

// Hero Tree is only shown in footer during December (11) and January (0)
const month = new Date().getMonth();
const isHeroTreeSeason = month === 11 || month === 0;

const exploreLinks: [string, string][] = [
  ["/about", "About Us"],
  ["/schedule", "Schedule"],
  ["/membership", "Membership"],
  ["/events", "Events"],
  ["/core-values", "Core Values"],
  ...(isHeroTreeSeason ? [["/hero-tree", "Hero Tree"]] as [string, string][] : []),
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image src="/images/logo.png" alt="Honor Bound FIT" width={120} height={36} className="h-9 w-auto mb-4" />
            <p className="text-white/50 text-sm leading-relaxed">
              Veteran-owned strength &amp; conditioning. Fredericksburg, VA.
            </p>
            <p className="text-white/40 text-xs mt-2">45 Centreport Parkway, Suite 137</p>
            <p className="text-white/40 text-xs mt-1">
              <a href="tel:+15407378337" className="hover:text-white/70 transition-colors">(540) 737-8337</a>
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com/honorboundfit" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com/honorboundfit" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Explore</h4>
            <nav className="flex flex-col gap-2">
              {exploreLinks.map(([href, label]) => (
                <Link key={href} href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Programs</h4>
            <nav className="flex flex-col gap-2">
              {[
                ["/membership#gap", "GAP Program"],
                ["/membership#homeschool", "Homeschool Heroes"],
                ["/membership#tribal-elders", "Tribal Elders"],
                ["https://guidonfoundation.com", "The Guidon Foundation"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="text-white/50 hover:text-white text-sm transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Stay Updated */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-4">Stay Updated</h4>
            <p className="text-white/50 text-sm mb-3">Join our mission. No spam.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Honor Bound FIT. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-white/30 hover:text-white/60 text-xs transition-colors">Terms</Link>
            <Link href="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

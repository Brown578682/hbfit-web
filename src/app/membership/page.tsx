import type { Metadata } from "next";
import Link from "next/link";
import { calculateHouseholdBilling, MEMBERSHIP_PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Membership",
  description: "Join Honor Bound FIT. Simple, transparent pricing with no long-term contracts.",
};

const BASE_PLAN  = MEMBERSHIP_PLANS.find((p) => p.slug === "base")!;

const PLAN_DETAILS = [
  {
    slug: "base",
    badge: "Most Popular",
    featured: true,
    kicker: "Standard",
    cta: "Join Now",
    ctaHref: "/join?plan=base",
    features: [
      "Unlimited group class access",
      "Strength & Conditioning — all scheduled times",
      "Member portal — book classes, track progress",
      "No contracts — cancel anytime",
    ],
    note: null,
  },
  {
    slug: "gap",
    badge: null,
    featured: false,
    kicker: "Guardian Angel Program",
    cta: "Apply",
    ctaHref: "/join?plan=gap",
    features: [
      "Same full access as Base Membership",
      "Veterans, active duty & first responders",
      "Simple document upload at signup",
      "Approved within 24 hrs — billing starts then",
    ],
    note: "Requires verification — billing starts after approval",
  },
  {
    slug: "homeschool-heroes",
    badge: null,
    featured: false,
    kicker: "Tues & Thurs · 1:00 PM",
    cta: "Enroll",
    ctaHref: "/join?plan=homeschool-heroes",
    features: [
      "Structured PE for homeschool families",
      "Builds fitness, discipline & teamwork",
      "Attendance records for your portfolio",
      "No contracts — cancel anytime",
    ],
    note: null,
  },
  {
    slug: "tribal-elders",
    badge: null,
    featured: false,
    kicker: "Programming for Longevity",
    cta: "Join",
    ctaHref: "/join?plan=tribal-elders",
    features: [
      "Mobility, strength & longevity focus",
      "Programming designed for decades of fitness",
      "Member portal — book classes, track progress",
      "No contracts — cancel anytime",
    ],
    note: null,
  },
  {
    slug: "open-gym",
    badge: null,
    featured: false,
    kicker: "Open Access",
    cta: "Join",
    ctaHref: "/join?plan=open-gym",
    features: [
      "Access during scheduled Open Gym windows",
      "Use all equipment during open hours",
      "Family members also $35/4 wks each",
      "No contracts — cancel anytime",
    ],
    note: "Open Gym windows only — not group classes",
  },
];

const FAQ = [
  {
    q: "Is there a contract?",
    a: "No. Month-to-month. Cancel anytime through your member portal.",
  },
  {
    q: "When does billing start for GAP members?",
    a: "Not until your verification document is reviewed and approved by staff — typically within 24 hours.",
  },
  {
    q: "How does the family cap work?",
    a: "Your household is charged for the primary member's plan, plus $50 for each additional family member — capped at $200 per 4-week cycle, regardless of family size. Open Gym family members are $35 each with no cap.",
  },
  {
    q: "Can I try before I commit?",
    a: "Yes. Reach out to schedule a free intro class — no obligation.",
  },
  {
    q: "What qualifies for GAP?",
    a: "Active duty military, veterans, first responders, and other qualifying community members. A simple document upload at signup is all that's required. Staff reviews within 24 hours.",
  },
  {
    q: "What is Open Gym?",
    a: "Open Gym is unstructured access to the facility during designated open hours. You won't be in a coached class, but you'll have full use of the equipment. Perfect for people who prefer to train on their own schedule.",
  },
];

export default function MembershipPage() {
  return (
    <div className="pt-16 bg-black text-white">

      {/* ── Header ────────────────────────────────────────── */}
      <section
        className="relative border-b border-white/10 py-20 px-4 text-center overflow-hidden"
        style={{ backgroundImage: "url('/images/community-photo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10">
          <p className="text-white/60 uppercase tracking-widest text-xs font-medium mb-3">Join the Mission</p>
          <h1 className="font-montserrat text-5xl font-extrabold text-white uppercase">Membership</h1>
          <div className="w-12 h-0.5 bg-white mx-auto mt-5 mb-5" />
          <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
            No long-term contracts. No hidden fees. Simple pricing — because you have enough to worry about.
          </p>
        </div>
      </section>

      {/* ── All Plans ─────────────────────────────────────── */}
      <section className="py-16 px-4" id="plans">
        <div className="max-w-5xl mx-auto">

          {/* Featured: Base Membership — full width */}
          {(() => {
            const d = PLAN_DETAILS.find(p => p.slug === "base")!;
            const plan = MEMBERSHIP_PLANS.find(p => p.slug === "base")!;
            return (
              <div className="border border-white/30 p-8 md:p-12 mb-4 relative">
                <div className="absolute top-0 right-0 bg-white text-black text-xs font-montserrat font-extrabold uppercase tracking-widest px-3 py-1">
                  {d.badge}
                </div>
                <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-4">{d.kicker}</p>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="font-montserrat font-extrabold text-white text-6xl leading-none">
                        ${plan.price / 100}
                      </span>
                      <span className="text-white/40 text-sm mb-2">/ 4 wks</span>
                    </div>
                    <h2 className="font-montserrat font-extrabold text-white uppercase text-xl mb-6">
                      Base Membership
                    </h2>
                    <ul className="space-y-3 border-t border-white/10 pt-6">
                      {d.features.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                          <span className="text-white mt-0.5 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:w-56 shrink-0">
                    <Link
                      href={d.ctaHref}
                      className="block bg-white text-black font-montserrat font-extrabold text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors text-center"
                    >
                      {d.cta}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Other Plans — 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLAN_DETAILS.filter(d => d.slug !== "base").map((d) => {
              const plan = MEMBERSHIP_PLANS.find(p => p.slug === d.slug)!;
              return (
                <div
                  key={d.slug}
                  className="border border-white/10 p-7 flex flex-col hover:border-white/30 transition-colors"
                >
                  <p className="text-white/40 uppercase tracking-widest text-xs mb-3">{d.kicker}</p>

                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="font-montserrat font-extrabold text-white text-4xl leading-none">
                      ${plan.price / 100}
                    </span>
                    <span className="text-white/40 text-xs mb-1">/ 4 wks</span>
                  </div>

                  <h3 className="font-montserrat font-extrabold text-white uppercase text-base mb-4 leading-tight">
                    {plan.name}
                  </h3>

                  <ul className="space-y-2 border-t border-white/10 pt-4 mb-5 flex-1">
                    {d.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-white/60">
                        <span className="text-white/50 mt-0.5 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {d.note && (
                    <p className="text-white/30 text-xs mb-4 flex items-start gap-1.5">
                      <span className="shrink-0 mt-0.5">⚑</span>
                      {d.note}
                    </p>
                  )}

                  <Link
                    href={d.ctaHref}
                    className="block border border-white/30 text-white font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 hover:border-white hover:bg-white/5 transition-colors text-center mt-auto"
                  >
                    {d.cta} →
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Family Pricing ────────────────────────────────── */}
      <section id="family" className="bg-zinc-950 border-y border-white/10 py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <h3 className="font-montserrat text-xl font-bold text-white uppercase text-center mb-2">
            Family Plans
          </h3>
          <p className="text-white/40 text-sm text-center mb-8">
            Add family members at $50/4-wk each.
            Households are capped at <span className="text-white font-bold">$200/4 wks</span> — no matter how many people.
            Open Gym members are $35 each, no cap.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {[1, 2, 3, 4].map((count) => {
              const total = calculateHouseholdBilling(count, BASE_PLAN);
              const capped = total === 200_00;
              return (
                <div key={count} className="bg-zinc-950 py-7 px-4 text-center">
                  <div className="text-white/30 text-xs uppercase tracking-widest mb-2">
                    {count} {count === 1 ? "member" : "members"}
                  </div>
                  <div className="font-montserrat font-extrabold text-white text-3xl">
                    ${total / 100}
                  </div>
                  <div className="text-white/30 text-xs mt-1">/4 wks</div>
                  {capped && (
                    <div className="text-white/40 text-xs mt-1 uppercase tracking-wide">capped</div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-white/30 text-xs text-center mt-4">
            5+ members? Same $200 cap applies.
          </p>
        </div>
      </section>

      {/* ── GAP anchor (legacy links) ─────────────────────── */}
      <div id="gap" />
      <div id="homeschool" />
      <div id="tribal-elders" />

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="bg-zinc-950 border-t border-white/10 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-montserrat text-xl font-bold text-white uppercase text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-0 divide-y divide-white/10 border-t border-white/10">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-5">
                <h4 className="font-montserrat font-bold text-white text-sm mb-2">{q}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="py-16 px-4 text-center border-t border-white/10">
        <p className="text-white/40 uppercase tracking-widest text-xs mb-4">Ready?</p>
        <h2 className="font-montserrat font-extrabold text-white uppercase text-3xl mb-8">
          Join the Mission
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/join"
            className="bg-white text-black font-montserrat font-extrabold text-sm uppercase tracking-widest px-10 py-4 hover:bg-white/90 transition-colors"
          >
            Join Now
          </Link>
          <Link
            href="/contact"
            className="border border-white/30 text-white font-montserrat font-bold text-sm uppercase tracking-widest px-10 py-4 hover:border-white/60 hover:bg-white/5 transition-colors"
          >
            Questions? Contact Us
          </Link>
        </div>
      </section>

    </div>
  );
}

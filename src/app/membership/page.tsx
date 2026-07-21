import type { Metadata } from "next";
import Link from "next/link";
import { MEMBERSHIP_PLANS, calculateHouseholdBilling } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Membership",
  description: "Join Honor Bound FIT. Simple, transparent pricing with no long-term contracts.",
};

const GAP_PLANS = MEMBERSHIP_PLANS.filter((p) => p.isGap);
const SPECIAL_PLANS = MEMBERSHIP_PLANS.filter((p) => !p.isGap && p.slug !== "base");
const BASE_PLAN = MEMBERSHIP_PLANS.find((p) => p.slug === "base")!;

export default function MembershipPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-zinc-950 border-b border-white/10 py-20 px-4 text-center">
        <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">Join the Mission</p>
        <h1 className="font-montserrat text-5xl font-extrabold text-white uppercase">Membership</h1>
        <p className="text-white/60 mt-4 font-lora text-lg max-w-xl mx-auto">
          No long-term contracts. No hidden fees. Simple pricing — because you have enough to worry about.
        </p>
      </section>

      {/* Base Membership */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">Standard</p>
        <h2 className="font-montserrat text-3xl font-bold text-white uppercase mb-8">Base Membership</h2>
        <div className="border border-white/20 p-10 inline-block w-full max-w-md">
          <div className="text-6xl font-montserrat font-extrabold text-white mb-1">$100</div>
          <div className="text-white/40 text-sm mb-6">per month</div>
          <ul className="text-white/60 text-sm space-y-2 text-left mb-8">
            <li>✓ Unlimited class access</li>
            <li>✓ Strength & Conditioning, Small Group Training, Rucking</li>
            <li>✓ Member portal — book classes, track progress</li>
            <li>✓ No contracts — cancel anytime</li>
          </ul>
          <Link href="/join?plan=base" className="block bg-white text-black font-bold text-sm uppercase tracking-widest px-8 py-4 hover:bg-white/90 transition-colors w-full text-center">
            Join Now
          </Link>
        </div>
      </section>

      {/* Family Pricing */}
      <section className="bg-zinc-950 border-y border-white/10 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-montserrat text-2xl font-bold text-white uppercase mb-4">Family Plans</h3>
          <p className="text-white/60 font-lora mb-8">Add family members at $50/month each. Households are capped at <span className="text-white font-bold">$200/month</span> — no matter how many people.</p>
          <div className="grid grid-cols-3 gap-px bg-white/10 text-center">
            {[1, 2, 3, 4].map((count) => {
              const total = calculateHouseholdBilling(count, BASE_PLAN.price);
              return (
                <div key={count} className="bg-zinc-950 py-6 px-4">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1">{count} member{count > 1 ? "s" : ""}</div>
                  <div className="text-white text-2xl font-bold font-montserrat">${total / 100}</div>
                  <div className="text-white/30 text-xs">/month</div>
                  {total === 200_00 && <div className="text-white/40 text-xs mt-1">(capped)</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GAP Program */}
      <section id="gap" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">Grateful Appreciation Program</p>
          <h2 className="font-montserrat text-3xl font-bold text-white uppercase">GAP Program — $75/month</h2>
          <p className="text-white/60 mt-3 font-lora max-w-xl mx-auto">
            For those who serve or have served. Same household pricing — same $200 family cap. Requires verification at signup.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {GAP_PLANS.map((plan) => (
            <div key={plan.slug} className="border border-white/10 p-6 hover:border-white/30 transition-colors">
              <h3 className="font-montserrat font-bold text-white text-sm uppercase mb-2">{plan.name.replace("GAP Program — ", "")}</h3>
              <p className="text-white/50 text-sm mb-4">{plan.description}</p>
              <Link href={`/join?plan=${plan.slug}`} className="text-white/60 hover:text-white text-xs uppercase tracking-widest font-medium transition-colors">
                Apply →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-white/30 text-xs">
          Verification is a simple document upload at signup. Staff reviews within 24 hours. No billing until approved.
        </p>
      </section>

      {/* Special Programs */}
      <section className="bg-zinc-950 border-y border-white/10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-white/40 uppercase tracking-widest text-xs font-medium mb-3">Specialized Programs</p>
            <h2 className="font-montserrat text-3xl font-bold text-white uppercase">$75/month</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Homeschool Heroes */}
            <div id="homeschool" className="border border-white/10 p-8">
              <h3 className="font-montserrat font-bold text-white uppercase mb-2">Homeschool Heroes</h3>
              <p className="text-white/40 text-sm mb-1">Tuesday & Thursday · 1:00–2:00 PM</p>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Structured physical education for homeschool families. Builds fitness, discipline, and teamwork. Attendance records provided for your homeschool portfolio.
              </p>
              <Link href="/join?plan=homeschool-heroes" className="bg-white text-black font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-white/90 transition-colors inline-block">
                Enroll
              </Link>
            </div>
            {/* Tribal Elders */}
            <div id="tribal-elders" className="border border-white/10 p-8">
              <h3 className="font-montserrat font-bold text-white uppercase mb-2">Tribal Elders</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Programming built for longevity, mobility, and strength — designed for those who want to stay in the fight for decades to come. Stave off the nursing home. Prolong independent living.
              </p>
              <Link href="/join?plan=tribal-elders" className="bg-white text-black font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-white/90 transition-colors inline-block">
                Join
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <h2 className="font-montserrat text-2xl font-bold text-white uppercase text-center mb-10">Common Questions</h2>
        <div className="space-y-6">
          {[
            ["Is there a contract?", "No. Month-to-month. Cancel anytime through your member portal."],
            ["When does billing start for GAP members?", "Not until your verification document is reviewed and approved by staff — typically within 24 hours."],
            ["How does the family cap work?", "Your household is charged for the primary member's plan, plus $50 for each additional family member — capped at $200/month total, regardless of family size."],
            ["Can I try before I commit?", "Reach out to schedule a free intro class."],
          ].map(([q, a]) => (
            <div key={q as string} className="border-b border-white/10 pb-6">
              <h4 className="font-montserrat font-bold text-white mb-2">{q}</h4>
              <p className="text-white/60 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

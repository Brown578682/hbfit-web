import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Users, Dumbbell, Trophy, BarChart3, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Corporate Wellness | Honor Bound FIT',
  description:
    'Bring coach-led group fitness to your workplace. Honor Bound FIT corporate wellness programs build stronger, more connected teams through shared training — starting with a 90-day pilot.',
}

const benefits = [
  {
    icon: Users,
    text: 'Sponsored memberships for all employees on your team',
  },
  {
    icon: Dumbbell,
    text: 'Coach-led group strength and conditioning at Honor Bound FIT',
  },
  {
    icon: CheckCircle2,
    text: 'New-member onboarding and an introductory fitness assessment',
  },
  {
    icon: BarChart3,
    text: 'Optional progress reassessments throughout the program',
  },
  {
    icon: Trophy,
    text: 'Quarterly team-building kickoff and 12-week company competition, with team recognition and monthly participation updates',
  },
]

const pricingTiers = [
  {
    label: 'Up to 5 Employees',
    price: '$250',
    period: '/month',
  },
  {
    label: 'Up to 15 Employees',
    price: '$750',
    period: '/month',
    featured: true,
  },
  {
    label: 'Up to 50 Employees',
    price: '$2,500',
    period: '/month',
  },
]

export default function CorporateWellnessPage() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        {/* subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
        {/* red accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-28">
          <p className="font-montserrat text-sm tracking-[0.25em] uppercase text-zinc-400 mb-4">
            Corporate Wellness at Honor Bound FIT
          </p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-8 leading-none">
            BUILD A STRONGER{' '}
            <span className="text-red-600">TEAM,</span>{' '}
            TOGETHER
          </h1>
          <p className="font-lora text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto italic mb-10">
            A coach-led fitness program designed to unite your workforce, boost engagement, and build
            lasting habits — starting with a 90-day pilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/corporate-wellness/enroll"
              className="font-montserrat font-black uppercase tracking-widest text-sm bg-red-600 text-white px-10 py-4 inline-flex items-center gap-2 hover:bg-red-700 transition-colors duration-200"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/corporate-wellness-brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat uppercase tracking-widest text-sm border border-zinc-500 text-zinc-300 px-10 py-4 inline-flex items-center gap-2 hover:border-white hover:text-white transition-colors duration-200"
            >
              Download Brochure
            </Link>
          </div>
        </div>
      </section>

      {/* ── Group Fitness ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              Why Group Training Works
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              A Shared Experience Outside the Office
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto" />
          </div>

          <div className="space-y-6">
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Honor Bound FIT gives employees a shared experience outside the usual work environment.
              Training together can create natural opportunities for encouragement, accountability, and
              connection across roles and departments.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Coach-led training also removes much of the guesswork. Employees do not have to design
              their own program or already know how to use a gym. Work can be adjusted to the individual,
              allowing beginners and experienced participants to train alongside one another.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              For employers, the result is a wellness benefit that is active, social, and built around
              participation. A 90-day pilot gives your company a practical way to introduce the program,
              observe engagement, and decide how it fits your team.
            </p>
          </div>
        </div>
      </section>

      {/* ── What You Get (WIIFM) ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              What's Included
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              What Your Team Gets
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-7 hover:border-red-600 transition-colors duration-200 flex flex-col gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="font-lora text-zinc-300 text-base leading-relaxed">{benefit.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              Simple, Scalable Pricing
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-4">
              A Simple Pilot Structure
            </h2>
            <p className="font-lora text-lg text-zinc-400 max-w-2xl mx-auto">
              Start with a 90-day pilot at easy to follow pricing tiers. Your bill adjusts when your
              team size changes.
            </p>
            <div className="w-16 h-1 bg-red-600 mx-auto mt-8" />
          </div>

          <p className="font-montserrat font-black text-sm tracking-[0.2em] uppercase text-zinc-400 text-center mb-10">
            How Pricing Scales
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-lg border p-8 flex flex-col items-center text-center gap-6 transition-colors duration-200 ${
                  tier.featured
                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/40'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <p
                  className={`font-montserrat font-black text-xs uppercase tracking-widest ${
                    tier.featured ? 'text-red-100' : 'text-zinc-400'
                  }`}
                >
                  {tier.label}
                </p>
                <div>
                  <span
                    className={`font-montserrat font-black text-5xl ${
                      tier.featured ? 'text-white' : 'text-white'
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`font-montserrat text-sm uppercase tracking-wider ml-1 ${
                      tier.featured ? 'text-red-200' : 'text-zinc-500'
                    }`}
                  >
                    {tier.period}
                  </span>
                </div>
                <Link
                  href="/corporate-wellness/enroll"
                  className={`font-montserrat font-black uppercase tracking-widest text-xs px-8 py-3 inline-flex items-center gap-1 transition-colors duration-200 ${
                    tier.featured
                      ? 'bg-white text-red-600 hover:bg-zinc-100'
                      : 'border border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
                  }`}
                >
                  Get Started <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why It Works ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              The Case for Corporate Fitness
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              Why It Works
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto" />
          </div>

          <div className="space-y-6">
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Healthy employees are an important part of a healthy organization. Regular physical
              activity can support energy, strength, mobility, stress management, and overall
              well-being, while a shared fitness experience gives employees another opportunity to
              connect with and encourage one another.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              A team that feels better physically and has a positive outlet for stress can be better
              positioned to show up focused, engaged, and ready to contribute. Group training also
              creates opportunities for accountability and camaraderie that can extend beyond the gym
              and into the workplace.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Honor Bound FIT gives employers a practical way to invest in their people. With
              coach-led training, employee onboarding, and a shared community, your company can make
              fitness accessible without requiring employees to already know how to train. Start with a
              90-day pilot and give your team a place to get stronger, move better, build
              relationships, and keep showing up.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-1 bg-red-600 mx-auto mb-10" />
          <h2 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight mb-8 leading-none">
            BRING WELLNESS TO YOUR TEAM
          </h2>
          <Link
            href="/corporate-wellness/enroll"
            className="font-montserrat font-black uppercase tracking-widest text-base bg-red-600 text-white px-14 py-5 inline-flex items-center gap-2 hover:bg-red-700 transition-colors duration-200 mb-14"
          >
            Enroll Your Team <ChevronRight className="w-5 h-5" />
          </Link>

          <div className="border-t border-zinc-800 pt-10 space-y-3">
            <div className="flex flex-col sm:flex-row justify-center gap-6 font-montserrat text-sm uppercase tracking-widest text-zinc-400">
              <span>
                <span className="text-white font-black">Heather</span>&nbsp;|&nbsp;703-965-4184
              </span>
              <span className="hidden sm:block text-zinc-700">·</span>
              <span>
                <span className="text-white font-black">Rich</span>&nbsp;|&nbsp;571-494-8069
              </span>
            </div>
            <p className="font-montserrat text-xs tracking-widest uppercase text-zinc-500">
              📍 45 Centreport Pkwy, Suite 113 · Fredericksburg, VA 22406
            </p>
            <p className="font-montserrat text-xs tracking-widest uppercase text-zinc-500">
              www.HonorBoundFIT.com
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}

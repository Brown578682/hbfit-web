import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Users, Dumbbell, Heart, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Free for Foster Families (F3) | Honor Bound FIT',
  description:
    'Honor Bound FIT offers free memberships to foster families through the F3 program. Because the people who show up for kids deserve a community that shows up for them.',
}

const benefits = [
  {
    icon: Users,
    text: 'Full gym membership for the entire foster family (no cost, no catch)',
  },
  {
    icon: Dumbbell,
    text: 'Access to all coach-led group classes',
  },
  {
    icon: CheckCircle2,
    text: 'New-member onboarding and fitness assessment',
  },
  {
    icon: Heart,
    text: 'A community that holds you accountable and shows up for you',
  },
]

const steps = [
  {
    number: '01',
    title: 'Apply',
    description:
      'Submit a short application. We review and verify foster family status.',
  },
  {
    number: '02',
    title: 'Get Approved',
    description:
      "We'll reach out within 48 hours to confirm your enrollment.",
  },
  {
    number: '03',
    title: 'Show Up',
    description:
      'Walk in on day one as a full member of the tribe. No asterisks.',
  },
]

export default function F3Page() {
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
            Honor Bound FIT Families
          </p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-8 leading-none">
            FREE MEMBERSHIPS FOR{' '}
            <span className="text-red-600">FOSTER FAMILIES</span>
          </h1>
          <p className="font-lora text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto italic mb-10">
            Because the people who show up for kids deserve a community that shows up for them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/f3/apply"
              className="font-montserrat font-black uppercase tracking-widest text-sm bg-red-600 text-white px-10 py-4 inline-flex items-center gap-2 hover:bg-red-700 transition-colors duration-200"
            >
              Apply Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              Why F3 Exists
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              Built on What We Believe
            </h2>
            <div className="w-16 h-1 bg-white mx-auto" />
          </div>

          <div className="space-y-6">
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              At Honor Bound FIT, Core Value #3 is foundational: a man&apos;s most sacred duty is to protect women and
              children. Foster families live that value every single day. They open their homes to children who have
              been removed from unsafe environments — absorbing the chaos, the trauma, the sleepless nights, and the
              emotional weight that comes with caring for kids who didn&apos;t choose their circumstances. They are
              protectors in the most literal sense. The least we can do is make sure they have a place to build their
              own strength.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Core Value #4 tells us that growth is found in suffering — that the obstacle is the way. Foster families
              know this better than most. The children in their care have faced obstacles no child should face, and the
              families who take them in don&apos;t run from that difficulty. They run toward it. F3 exists because we
              believe physical health is part of that resilience. A foster parent who is stronger, healthier, and
              supported by a community of people who hold them accountable — to their values, their goals, their
              commitments (Core Value #8) — is a better foster parent. We want to be part of that equation.
            </p>
            <p className="font-lora text-lg text-zinc-300 leading-relaxed">
              Finally, Core Value #14 drives everything about how this program will operate: we treat people as
              individuals, not objectives. Every foster family that walks through our doors has a story. They are not a
              metric, not a PR opportunity, not a checkbox. They are people doing some of the hardest, most selfless
              work in our community — and they will be treated with the full respect and dignity that work deserves
              (Core Value #11). F3 is our commitment to showing up for the people who show up for kids who need them
              most.
            </p>
          </div>
        </div>
      </section>

      {/* ── What's Included ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              Membership Benefits
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              What&apos;s Included
            </h2>
            <div className="w-16 h-1 bg-white mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-red-600 mb-3">
              Simple Process
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
              How It Works
            </h2>
            <div className="w-16 h-1 bg-white mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-4 hover:border-zinc-600 transition-colors duration-200"
              >
                <span className="font-montserrat font-black text-4xl text-red-600 leading-none">{step.number}</span>
                <h3 className="font-montserrat font-black text-xl uppercase tracking-wide">{step.title}</h3>
                <p className="font-lora text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Values Callout ───────────────────────────────────────── */}
      <section className="py-16 px-6 bg-black border-t border-zinc-900 border-b border-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-lora text-lg text-zinc-400 leading-relaxed italic mb-6">
            This program is built on what we believe.
          </p>
          <Link
            href="/core-values"
            className="font-montserrat font-black uppercase tracking-widest text-sm text-red-600 hover:text-red-500 transition-colors duration-200 inline-flex items-center gap-2"
          >
            Read Our 14 Core Values <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-1 bg-red-600 mx-auto mb-10" />
          <h2 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight mb-6 leading-none">
            READY TO JOIN THE TRIBE?
          </h2>
          <p className="font-lora text-lg text-zinc-400 italic mb-10">
            Apply today. No cost. No catch. Just community.
          </p>
          <Link
            href="/f3/apply"
            className="font-montserrat font-black uppercase tracking-widest text-base bg-red-600 text-white px-14 py-5 inline-flex items-center gap-2 hover:bg-red-700 transition-colors duration-200"
          >
            Apply Now <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fredericksburg Free Press – Honor Bound FIT | Honor Bound FIT',
  description:
    'Inside Honor Bound FIT: Rucking, Resilience, and Community — as featured in the Fredericksburg Free Press.',
  openGraph: {
    title: 'Fredericksburg Free Press – Honor Bound FIT',
    description:
      'Inside Honor Bound FIT: Rucking, Resilience, and Community — as featured in the Fredericksburg Free Press.',
    url: 'https://honorboundfit.com/media/fredericksburg-free-press',
  },
}

export default function FredericksburgFreePressPage() {
  return (
    <main className="bg-black text-white min-h-screen">

      {/* Hero header */}
      <section className="py-24 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <Link
          href="/media"
          className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 hover:text-white transition-colors mb-6 inline-block"
        >
          ← Media
        </Link>
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4 mt-4">
          Fredericksburg Free Press
        </p>
        <h1 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Inside Honor Bound FIT: Rucking, Resilience, and Community
        </h1>
        <div className="w-16 h-1 bg-white mx-auto mb-8" />
        <div className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 flex flex-wrap justify-center gap-6">
          <span>📍 45 Centreport Pkwy · Suite 137 · Stafford County, VA</span>
          <span>🎥 Featured in: Fredericksburg Free Press</span>
          <span>🎙 Interview with: Rich Brown</span>
        </div>
      </section>

      {/* YouTube embed */}
      <section className="py-12 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/sZXyLkKr0kM?si=EuGk18jhaCYufsk1"
              title="Honor Bound FIT — Fredericksburg Free Press Feature"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-600 mt-4 text-center">
            Video produced in partnership with Shore United Bank
          </p>
        </div>
      </section>

      {/* Article body */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              What Is Honor Bound FIT?
            </h2>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed mb-6">
              Honor Bound FIT is a veteran-owned strength and conditioning facility rooted in Marine Corps
              values and dedicated to building capable, mission-ready individuals. More than just a gym,
              they emphasize <strong className="text-white">"brilliance in the basics"</strong>—training in
              foundational movements, mobility, and lifelong fitness. Their approach is grounded in:
            </p>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li><strong className="text-white">Faith</strong> – In yourself, the program, and God</li>
              <li><strong className="text-white">Integrity</strong> – Doing what's right even when no one's watching</li>
              <li><strong className="text-white">Tenacity</strong> – Taking action and staying the course</li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Meet the Founders
            </h2>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed">
              Keith and Rich met while instructing at The Basic School in Quantico, teaching physical fitness,
              leadership, hand-to-hand combat, and moral development to new Marine lieutenants. Their shared
              experience and values inspired them to create a facility that trains not just the body, but the
              whole person.
            </p>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              What is Rucking?
            </h2>
            <blockquote className="border-l-4 border-zinc-600 pl-6 mb-6">
              <p className="font-lora italic text-xl text-zinc-200 leading-relaxed">
                "Rucking is as simple as putting weight in a backpack and walking for time or distance."
              </p>
            </blockquote>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed mb-6">
              Rucking is a low-impact, high-return form of exercise that mimics military training.
              It's safer on joints than running and easier to sustain while still delivering significant
              health benefits, including:
            </p>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li>Full-body strength and endurance</li>
              <li>Cardiovascular health (zone 2 cardio)</li>
              <li>Community and connection</li>
            </ul>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed mt-6">
              Honor Bound FIT runs a <strong className="text-white">progressive ruck training program</strong>,
              starting with 6 miles and gradually building toward a 22-mile charity ruck in December.
            </p>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Upcoming Event: Food Drive Ruck for a Cause
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 font-montserrat text-sm uppercase tracking-widest space-y-3 mb-6">
              <div><span className="text-zinc-500">Date:</span> <span className="text-white">Saturday, May 17</span></div>
              <div><span className="text-zinc-500">Time:</span> <span className="text-white">0600–1800</span></div>
              <div><span className="text-zinc-500">Start Point:</span> <span className="text-white">5.11 Tactical, Central Park, Fredericksburg</span></div>
              <div><span className="text-zinc-500">Prizes:</span> <span className="text-white">$1,000 to the top team!</span></div>
            </div>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed mb-4">
              <strong className="text-white">How it works:</strong>
            </p>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3 mb-6">
              <li>Bring food items you'd donate to a food drive—but carry them 3 miles in a ruck to the delivery point.</li>
              <li>Repeat as many times as you'd like in 12 hours.</li>
              <li>Team competition (up to 10 people) with prizes for most weight moved.</li>
              <li>Last year raised over 3,000 lbs. of food; this year's goal is 5,000 lbs.</li>
            </ul>
            <p className="font-lora text-zinc-500 text-base italic">
              Note: Participants bring their own rucks, though a limited number are available to borrow.
            </p>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Why It Matters
            </h2>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed">
              From building better humans to supporting the local food bank, Honor Bound FIT is turning
              fitness into service and camaraderie into purpose. Whether you're training for life, building
              resilience, or looking to make a difference—this is a mission worth joining.
            </p>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-lora text-zinc-400 text-lg italic mb-8">
            For more local spotlights and event coverage, subscribe to{' '}
            <a
              href="https://fredericksburgfreepress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 hover:text-zinc-300 transition-colors"
            >
              Fredericksburg Free Press
            </a>
            .
          </p>
          <Link
            href="/media"
            className="font-montserrat uppercase tracking-widest text-sm border border-zinc-700 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
          >
            ← Back to Media
          </Link>
        </div>
      </section>

    </main>
  )
}

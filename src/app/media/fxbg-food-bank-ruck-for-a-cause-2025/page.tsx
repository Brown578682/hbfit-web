import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FXBG Food Bank – Ruck For A Cause 2025 Live Q&A | Honor Bound FIT',
  description:
    'Honor Bound FIT joins the Fredericksburg Area Food Bank for a live Q&A around the Ruck Hunger charity event.',
  openGraph: {
    title: 'FXBG Food Bank – Ruck For A Cause 2025 Live Q&A',
    description:
      'Honor Bound FIT joins the Fredericksburg Area Food Bank for a live Q&A around the Ruck Hunger charity event.',
    url: 'https://honorboundfit.com/media/fxbg-food-bank-ruck-for-a-cause-2025',
  },
}

export default function FxbgFoodBankPage() {
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
          FXBG Food Bank · Live Q&amp;A · 2025
        </p>
        <h1 className="font-montserrat font-black text-4xl md:text-6xl uppercase tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Ruck For A Cause
        </h1>
        <div className="w-16 h-1 bg-white mx-auto mb-8" />
        <p className="font-lora text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
          Honor Bound FIT partners with the Fredericksburg Area Food Bank — a live Q&A on rucking, community, and service.
        </p>
      </section>

      {/* YouTube embed */}
      <section className="py-12 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/E2eldp2NvHs?si=JlUGI6pngNB3q7Xs"
              title="Honor Bound FIT — Ruck For A Cause Q&A"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Event Overview
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 font-montserrat text-sm uppercase tracking-widest space-y-3">
              <div><span className="text-zinc-500">Event Type:</span> <span className="text-white">Charity Ruck March</span></div>
              <div><span className="text-zinc-500">Purpose:</span> <span className="text-white">Collect food donations for the Fredericksburg Regional Food Bank</span></div>
              <div><span className="text-zinc-500">Cost:</span> <span className="text-white">Free — donate non-perishable food</span></div>
              <div><span className="text-zinc-500">Reward:</span> <span className="text-white">Custom dog tags for completing rucks; special 22-mile, 22-lb ruck for veterans</span></div>
            </div>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Who Can Join?
            </h2>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li><strong className="text-white">Open to all fitness levels</strong></li>
              <li><strong className="text-white">Ages:</strong> Youth (13+) to Seniors (63+)</li>
              <li><strong className="text-white">No military background required</strong> — Honor Bound FIT is welcoming to everyone, especially families.</li>
              <li><strong className="text-white">Kids, strollers, and leashed dogs</strong> are allowed at most rucks (pets must be well-behaved and heat-capable).</li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              New to Rucking? Here's What You Need
            </h2>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li><strong className="text-white">Shoes:</strong> Comfortable, broken-in walking or running shoes. Avoid sandals or cowboy boots.</li>
              <li><strong className="text-white">Backpack:</strong> Any backpack works (Jansport, Under Armour, old military ALICE packs). Food <em>must</em> be carried on your back to count.</li>
              <li><strong className="text-white">Clothing:</strong> Non-chafing shorts, high-quality socks (plus extras).</li>
              <li><strong className="text-white">Weights:</strong> Start with 10–20 lbs. More experienced ruckers may carry 40–60 lbs or more.</li>
              <li><strong className="text-white">Try it first:</strong> Walk 1 mile with your setup before the event to avoid discomfort or injury.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Why Ruck Instead of Run?
            </h2>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li><strong className="text-white">Low-impact on joints</strong></li>
              <li><strong className="text-white">Zone 2 cardio benefits</strong> (fat-burning)</li>
              <li><strong className="text-white">Strengthens legs, shoulders, and core</strong></li>
              <li><strong className="text-white">More social and safer for beginners</strong></li>
              <li><strong className="text-white">Mimics human ancestral fitness patterns</strong></li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Will the Gym Help Me Prepare?
            </h2>
            <p className="font-lora text-zinc-300 text-lg leading-relaxed mb-4">
              Yes. Honor Bound FIT's training program:
            </p>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li>Improves endurance, strength, and VO2 max</li>
              <li>Encourages supplemental rucking outside the gym</li>
              <li>Progresses over time from 6-mile to 22-mile rucks</li>
              <li>Adjusts programming seasonally (bulk in winter, lean in summer)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Safety, Support & Logistics
            </h2>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li><strong className="text-white">First aid:</strong> Medical personnel on-site or in support vehicles</li>
              <li><strong className="text-white">Logistics vehicle:</strong> Available if you cannot complete your distance</li>
              <li><strong className="text-white">Supplies:</strong> Water, snacks, and drinks often provided by community partners (e.g., Black Rifle Coffee, 5.11 Tactical)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-montserrat font-black text-xl uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
              Certified Coaching
            </h2>
            <ul className="font-lora text-zinc-300 text-lg leading-relaxed space-y-3">
              <li>Trainers are <strong className="text-white">certified personal trainers</strong>, <strong className="text-white">CrossFit L1</strong>, and <strong className="text-white">Marine Corps Combat Conditioning</strong> certified.</li>
              <li>Programming blends <strong className="text-white">classic strength training</strong> with <strong className="text-white">functional fitness</strong>, avoiding the high-injury risks of traditional CrossFit.</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-lora text-zinc-400 text-lg italic mb-8">
            Want to get involved? Check out our upcoming ruck events or join Honor Bound FIT today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/events"
              className="font-montserrat uppercase tracking-widest text-sm bg-white text-black px-8 py-3 inline-block hover:bg-zinc-200 transition-colors duration-200"
            >
              View Events →
            </Link>
            <Link
              href="/media"
              className="font-montserrat uppercase tracking-widest text-sm border border-zinc-700 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
            >
              ← Back to Media
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}

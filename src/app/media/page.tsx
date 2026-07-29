import type { Metadata } from 'next'
import Link from 'next/link'
// Article cards use Link for internal routes

export const metadata: Metadata = {
  title: 'Media | Honor Bound FIT',
  description:
    'Press coverage, media appearances, and news featuring Honor Bound FIT in Fredericksburg, VA.',
}

const articles = [
  {
    outlet: 'Fredericksburg Free Lance–Star / Free Press',
    title: 'Inside Honor Bound FIT: Rucking, Resilience, and Community',
    description:
      'An in-depth look at the veteran-founded gym at 45 Centreport Parkway, Suite 137, Fredericksburg, VA—exploring how Honor Bound FIT is building a community around rucking, strength, and shared values.',
    location: '45 Centreport Parkway, Suite 137 · Fredericksburg, VA',
    tag: 'Feature Article',
    href: '/media/fredericksburg-free-press',
  },
  {
    outlet: 'FXBG Food Bank',
    title: 'Ruck For A Cause — 2025 — Live Q&A',
    description:
      'Honor Bound FIT joins the Fredericksburg Area Food Bank for a live Q&A around the Ruck Hunger charity event, discussing community impact, the power of rucking, and how fitness can serve a greater purpose.',
    location: 'Fredericksburg, VA',
    tag: 'Live Q&A · 2025',
    href: '/media/fxbg-food-bank-ruck-for-a-cause-2025',
  },
]

export default function MediaPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-28 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Honor Bound FIT
        </p>
        <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-6">
          In the Media
        </h1>
        <div className="w-16 h-1 bg-white mx-auto mb-8" />
        <p className="font-lora text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
          Press coverage, features, and community conversations about Honor Bound FIT.
        </p>
      </section>

      {/* Articles */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {articles.map((article, i) => (
            <Link
              key={i}
              href={article.href}
              className="group bg-zinc-900 border border-zinc-800 rounded-lg p-8 md:p-10 hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-200 flex flex-col gap-4"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500">
                  {article.outlet}
                </span>
                <span className="font-montserrat text-xs uppercase tracking-widest border border-zinc-700 text-zinc-400 px-3 py-1 rounded group-hover:border-zinc-500 transition-colors">
                  {article.tag}
                </span>
              </div>

              <h2 className="font-montserrat font-black text-2xl md:text-3xl leading-snug group-hover:text-zinc-100 transition-colors">
                {article.title}
              </h2>

              <p className="font-lora text-zinc-400 text-base leading-relaxed">
                {article.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800">
                <p className="font-montserrat text-xs uppercase tracking-wide text-zinc-600">
                  📍 {article.location}
                </p>
                <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                  Read Article ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Press Inquiry */}
      <section className="py-20 px-6 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl uppercase tracking-wide mb-4">
            Press & Media Inquiries
          </h2>
          <div className="w-12 h-px bg-zinc-700 mx-auto mb-8" />
          <p className="font-lora text-zinc-400 text-lg leading-relaxed mb-8">
            For media inquiries, interview requests, or press kit access, reach out directly.
          </p>
          <a
            href="mailto:rich@honorboundfit.com"
            className="font-montserrat font-bold text-lg tracking-widest text-white border-b border-zinc-500 hover:border-white transition-colors pb-1"
          >
            rich@honorboundfit.com
          </a>
          <div className="mt-10">
            <Link
              href="/contact"
              className="font-montserrat uppercase tracking-widest text-sm border border-zinc-700 text-zinc-400 px-8 py-3 inline-block hover:border-white hover:text-white transition-colors duration-200"
            >
              Send a Message →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

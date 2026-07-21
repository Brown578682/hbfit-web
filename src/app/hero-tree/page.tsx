import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Hero Tree | Honor Bound FIT',
  description:
    'In memory of those who gave everything. Honor Bound FIT pays tribute to the fallen heroes who sacrificed their lives in service to others.',
}

const honorees = [
  {
    name: 'John Basilone',
    rank: 'GySgt, USMC',
    detail: 'Medal of Honor · World War II',
    slug: 'john-basilone',
  },
  {
    name: 'Mitchell Paige',
    rank: 'Col, USMC',
    detail: 'Medal of Honor · World War II',
    slug: 'mitchell-paige',
  },
  {
    name: 'William G. Leftwich',
    rank: 'LtCol, USMC',
    detail: 'United States Marine Corps',
    slug: 'william-g-leftwich',
  },
  {
    name: 'Daniel B. Chaires',
    rank: 'LCpl, USMC',
    detail: 'Operation Enduring Freedom',
    slug: 'daniel-b-chaires',
  },
  {
    name: 'Kevin B. Joyce',
    rank: 'LCpl, USMC',
    detail: 'Navajo Nation · United States Marine Corps',
    slug: 'kevin-b-joyce',
  },
  {
    name: 'Steven A. Valdez',
    rank: 'LCpl, USMC',
    detail: 'United States Marine Corps',
    slug: 'steven-a-valdez',
  },
  {
    name: 'Anthony Capra',
    rank: 'TSgt, USAF',
    detail: 'United States Air Force',
    slug: 'anthony-capra',
  },
  {
    name: "Ford Tyson 'Toby' Humphrey Jr.",
    rank: 'Deputy Sheriff',
    detail: 'Stafford County, Virginia',
    slug: 'toby-humphrey',
  },
  {
    name: 'Jason Mooney',
    rank: 'Deputy Sheriff',
    detail: 'Stafford County, Virginia',
    slug: 'jason-mooney',
  },
  {
    name: 'Jessica Cheney',
    rank: 'Trooper II',
    detail: 'Virginia State Police',
    slug: 'jessica-cheney',
  },
  {
    name: 'Mia Ethridge',
    rank: 'Firefighter / EMT',
    detail: 'Louisa County & Stafford, Virginia',
    slug: 'mia-ethridge',
  },
  {
    name: 'The 17 Victims of the USS Cole Bombing',
    rank: 'United States Navy',
    detail: 'October 12, 2000',
    slug: 'uss-cole-victims',
  },
]

export default function HeroTreePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Solemn Header */}
      <section className="py-28 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Honor Bound FIT
        </p>
        <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-4">
          The Hero Tree
        </h1>
        <p className="font-lora text-xl text-zinc-400 italic mb-10">
          In memory of those who gave everything.
        </p>
        <div className="w-16 h-px bg-zinc-700 mx-auto mb-10" />
        {/* Coolidge Quote */}
        <blockquote className="max-w-2xl mx-auto">
          <p className="font-lora text-lg md:text-xl text-zinc-300 italic leading-relaxed mb-3">
            "The nation which forgets its defenders will be itself forgotten."
          </p>
          <cite className="font-montserrat text-xs tracking-widest uppercase text-zinc-500 not-italic">
            — Calvin Coolidge
          </cite>
        </blockquote>
      </section>

      {/* Honorees Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {honorees.map((h) => (
              <Link
                key={h.slug}
                href={`/hero-tree/${h.slug}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-200 flex flex-col gap-2"
              >
                {/* Star accent */}
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors text-lg mb-1 select-none">
                  ✦
                </span>
                <h2 className="font-montserrat font-bold text-base leading-snug group-hover:text-zinc-100 transition-colors">
                  {h.name}
                </h2>
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-400">
                  {h.rank}
                </p>
                <p className="font-lora text-sm text-zinc-500 italic">{h.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nomination CTA */}
      <section className="py-20 px-6 bg-zinc-950 border-t border-zinc-800 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-montserrat font-black text-2xl md:text-3xl uppercase tracking-wide mb-4">
            Nominate a Hero
          </h2>
          <p className="font-lora text-zinc-400 text-lg leading-relaxed mb-8">
            Know someone who should be honored? Contact us.
          </p>
          <Link
            href="/contact"
            className="font-montserrat uppercase tracking-widest text-sm bg-white text-black px-8 py-3 inline-block hover:bg-zinc-200 transition-colors duration-200"
          >
            Contact Us →
          </Link>
        </div>
      </section>
    </main>
  )
}

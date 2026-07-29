import type { Metadata } from 'next'
import Image from 'next/image'
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
      {/* Hero Tree Photo */}
      <section className="relative w-full h-[50vh] min-h-[320px] max-h-[560px] overflow-hidden">
        <Image
          src="/images/hero-tree-photo.avif"
          alt="The Honor Bound FIT Hero Tree"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay so header text reads over photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-400 mb-3">
            Honor Bound FIT
          </p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight drop-shadow-lg">
            The Hero Tree
          </h1>
          <p className="font-lora text-xl text-zinc-300 italic mt-4 drop-shadow">
            In memory of those who gave everything.
          </p>
        </div>
      </section>

      {/* Coolidge Quote */}
      <section className="py-12 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <blockquote className="max-w-2xl mx-auto">
          <p className="font-lora text-lg md:text-xl text-zinc-300 italic leading-relaxed mb-3">
            &ldquo;The nation which forgets its defenders will be itself forgotten.&rdquo;
          </p>
          <cite className="font-montserrat text-xs tracking-widest uppercase text-zinc-500 not-italic">
            — Calvin Coolidge
          </cite>
        </blockquote>

        <div className="w-16 h-px bg-zinc-700 mx-auto mt-10 mb-6" />

        <p className="max-w-2xl mx-auto font-lora text-zinc-400 text-base leading-relaxed">
          The Hero Tree honors the men and women whose service has shaped our lives, our families,
          and our community. Every ornament represents a story of duty, sacrifice, or loss — a
          permanent place of honor for those we stand for, and why we train.
        </p>
      </section>

      {/* Ornament Grid */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8">
            {honorees.map((h) => (
              <Link
                key={h.slug}
                href={`/hero-tree/${h.slug}`}
                className="group flex flex-col items-center"
                style={{ width: '160px' }}
              >
                {/* Ornament cap + string */}
                <div className="flex flex-col items-center mb-0">
                  <div className="w-4 h-3 rounded-t-sm bg-zinc-600 group-hover:bg-zinc-400 transition-colors" />
                  <div className="w-px h-4 bg-zinc-600 group-hover:bg-zinc-400 transition-colors" />
                </div>

                {/* Ornament body — circle shape */}
                <div
                  className="relative flex flex-col items-center justify-center text-center
                    w-[140px] h-[140px] rounded-full
                    bg-gradient-to-br from-zinc-800 via-zinc-900 to-black
                    border-2 border-zinc-700
                    group-hover:border-red-700 group-hover:from-red-950 group-hover:via-zinc-900 group-hover:to-black
                    shadow-lg group-hover:shadow-red-900/40
                    transition-all duration-300
                    px-3 py-3"
                >
                  {/* Glint */}
                  <span className="absolute top-5 left-8 w-3 h-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors blur-sm" />

                  {/* Star */}
                  <span className="text-zinc-500 group-hover:text-red-400 transition-colors text-base mb-1 select-none leading-none">
                    ✦
                  </span>

                  <h2 className="font-montserrat font-bold text-[11px] leading-tight group-hover:text-white transition-colors text-zinc-200">
                    {h.name}
                  </h2>
                  <p className="font-montserrat text-[9px] uppercase tracking-wider text-zinc-500 mt-1 group-hover:text-red-400 transition-colors">
                    {h.rank}
                  </p>
                </div>

                {/* Name below ornament */}
                <p className="font-lora text-xs text-zinc-500 italic mt-2 text-center leading-snug group-hover:text-zinc-300 transition-colors">
                  {h.detail}
                </p>
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
            Know someone whose story belongs on the Hero Tree? Contact us.
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

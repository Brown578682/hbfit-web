import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Honor Bound FIT',
  description:
    'Founded by U.S. Marine Corps combat veterans, Honor Bound FIT forges capable, mission-ready individuals—physically, mentally, and morally.',
}

const coreValues = [
  'It is the duty of all nations to acknowledge, obey, and be grateful to almighty God.',
  'The United States Constitution is the greatest political document ever written.',
  'A man\'s most sacred duty is to protect women and children.',
  'The obstacle is the way. Growth is found in suffering.',
  'Children belong to their parents.',
  'Good Friends have hard conversations.',
  'Regardless of environment, circumstances, and opposition: individuals are responsible for their own attitudes, behavior, and outcomes.',
  'Surround yourself with good people who hold you accountable to your values, goals, and commitments.',
  'Relentlessly pursue the things you suck at until today\'s challenges are tomorrow\'s warm-ups.',
  'Compare yourself to who you were yesterday, not to who someone else is today.',
  'Respect is given before it is earned.',
  'Be useful.',
  'Treat others not as you wish to be treated, but how they wish to be treated.',
  'Treat all people like individuals, not obstacles or objectives.',
]

export default function AboutPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/Rich-Keith-Square.jpg"
          alt="Rich and Keith — Honor Bound FIT founders"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="font-montserrat text-sm tracking-[0.25em] uppercase text-zinc-400 mb-3">
            Honor Bound FIT
          </p>
          <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-6">
            About Us
          </h1>
          <p className="font-lora text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto italic">
            Founded by U.S. Marine Corps combat veterans, our mission is to forge capable,
            mission-ready individuals—physically, mentally, and morally.
          </p>
        </div>
      </section>

      {/* Mission + Address */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-1 bg-white mx-auto mb-8" />
          <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide mb-6">
            Our Mission
          </h2>
          <p className="font-lora text-lg md:text-xl text-zinc-300 leading-relaxed mb-10 max-w-3xl mx-auto">
            Founded by U.S. Marine Corps combat veterans, our mission is to forge capable,
            mission-ready individuals—physically, mentally, and morally.
          </p>
          <p className="font-montserrat text-sm tracking-widest uppercase text-zinc-500">
            📍 45 Centreport Parkway, Suite 137 · Fredericksburg, VA
          </p>
        </div>
      </section>

      {/* Coaches */}
      <section className="py-20 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide text-center mb-16">
            Meet the Coaches
          </h2>

          {/* Keith Linde */}
          <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src="/images/Coach-Keith.jpg"
                  alt="Coach Keith Linde"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-zinc-500 mb-2">
                Co-Founder & Head Coach
              </p>
              <h3 className="font-montserrat font-black text-3xl md:text-4xl uppercase mb-4">
                Keith Linde
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Strength & Conditioning', 'Mobility & Agility', 'Hypertrophy', 'CrossFit'].map(
                  (s) => (
                    <span
                      key={s}
                      className="font-montserrat text-xs uppercase tracking-widest border border-zinc-600 text-zinc-300 px-3 py-1 rounded"
                    >
                      {s}
                    </span>
                  )
                )}
              </div>
              <blockquote className="font-lora text-xl italic text-zinc-300 border-l-4 border-white pl-5 mb-6 leading-relaxed">
                "I want to provide the tools to stave off the nursing home and prolong independent
                living."
              </blockquote>
              <p className="font-lora text-zinc-400 leading-relaxed">
                With over 20 years of expertise in the transformation industry, Coach Keith brings
                a deep, science-backed approach to fitness that emphasizes long-term health, functional
                strength, and sustainable results. His programming is designed to meet athletes where
                they are and push them further than they thought possible.
              </p>
            </div>
          </div>

          {/* Rich Brown */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-start">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src="/images/Coach-Rich.jpg"
                  alt="Coach Rich Brown"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-zinc-500 mb-2">
                Co-Founder & Head Coach
              </p>
              <h3 className="font-montserrat font-black text-3xl md:text-4xl uppercase mb-4">
                Rich Brown
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Strength & Conditioning', 'Rucking'].map((s) => (
                  <span
                    key={s}
                    className="font-montserrat text-xs uppercase tracking-widest border border-zinc-600 text-zinc-300 px-3 py-1 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="font-lora text-zinc-400 leading-relaxed">
                Rich served 8 years on active duty with the United States Marine Corps, leading
                troops in combat overseas and advising foreign military and police forces. He taught
                Marine Corps officers hand-to-hand combat, heavy weapon systems, leadership, and
                tactics. That operational mindset—earned under fire—now drives every program and
                event at Honor Bound FIT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-zinc-500 mb-3">
              What We Stand For
            </p>
            <h2 className="font-montserrat font-black text-3xl md:text-4xl uppercase tracking-wide">
              Our 14 Core Values
            </h2>
            <div className="w-16 h-1 bg-white mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coreValues.map((value, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors duration-200"
              >
                <span className="font-montserrat font-black text-4xl text-zinc-700 leading-none block mb-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-lora text-zinc-300 text-sm leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/core-values"
              className="font-montserrat uppercase tracking-widest text-sm border border-white text-white px-8 py-3 inline-block hover:bg-white hover:text-black transition-colors duration-200"
            >
              Explore Core Values in Depth →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

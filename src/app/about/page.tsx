import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CORE_VALUES } from '@/lib/coreValues'

export const metadata: Metadata = {
  title: 'About Us | Honor Bound FIT',
  description:
    'Founded by U.S. Marine Corps combat veterans, Honor Bound FIT forges capable, mission-ready individuals—physically, mentally, and morally.',
}

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

          {/* Heather Traves */}
          <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src="/images/Coach-Heather.jpg"
                  alt="Coach Heather Traves"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-zinc-500 mb-2">
                Coach
              </p>
              <h3 className="font-montserrat font-black text-3xl md:text-4xl uppercase mb-4">
                Heather Traves
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Nutrition & Behavior Change', 'Strength & Conditioning', 'Physique Competition'].map((s) => (
                  <span
                    key={s}
                    className="font-montserrat text-xs uppercase tracking-widest border border-zinc-600 text-zinc-300 px-3 py-1 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="font-lora text-zinc-400 leading-relaxed mb-4">
                Heather Traves is a U.S. Marine Corps veteran and health and wellness coach with more than
                30 years of experience in the fitness industry. Throughout her career, she has remained
                passionate about studying human performance and helping people become stronger, healthier,
                and more confident by building habits that create lasting change.
              </p>
              <p className="font-lora text-zinc-400 leading-relaxed mb-4">
                Heather holds a Master of Science in Nutrition and is a NASM Certified Personal Trainer,
                NASM Certified Behavior Change Specialist, and Certified Integrative Nutrition Health Coach.
                She also earned her professional status in natural physique competitions and has an extensive
                background in martial arts — giving her a deep appreciation for the connection between
                physical strength, mental resilience, and lifelong health.
              </p>
              <p className="font-lora text-zinc-400 leading-relaxed">
                Whether working with someone just beginning their fitness journey or an experienced athlete
                pursuing new goals, Heather focuses on practical, sustainable strategies that fit real life.
                Great coaching isn't about demanding perfection — it's about helping people build confidence,
                develop resilience, and create habits they can maintain long after a program ends.
              </p>
            </div>
          </div>

          {/* Randy Franklin */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-start mb-20">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700">
                <Image
                  src="/images/Coach-Randy.jpg"
                  alt="Coach Randy Franklin"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-zinc-500 mb-2">
                Coach
              </p>
              <h3 className="font-montserrat font-black text-3xl md:text-4xl uppercase mb-4">
                Randy Franklin
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Resistance Training', 'Athletic Performance', 'Corrective Exercise', 'Youth & Senior Fitness', 'Flexibility & Mobility'].map((s) => (
                  <span
                    key={s}
                    className="font-montserrat text-xs uppercase tracking-widest border border-zinc-600 text-zinc-300 px-3 py-1 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="font-lora text-zinc-400 leading-relaxed">
                With over 15 years of experience in the fitness industry, Randy Franklin holds multiple
                certifications, including NASM Certified Personal Trainer (CPT), NASM Corrective Exercise
                Specialist (CES), and NASM Performance Enhancement Specialist (PES). His diverse clientele
                ranges from youth and professional athletes to seniors with limited mobility. In both group
                classes and personal training sessions, he emphasizes resistance training across all planes
                of motion, tailoring each program to help clients perform at their highest level. His
                commitment to client success is reflected in the personalized approach he brings to every
                training program, ensuring each individual receives the guidance and support needed to
                achieve their goals.
              </p>
            </div>
          </div>

          {/* Rich Brown */}
          <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
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
            {CORE_VALUES.map((value, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors duration-200"
              >
                <span className="font-montserrat font-black text-4xl text-zinc-700 leading-none block mb-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-lora text-zinc-300 text-sm leading-relaxed">{value.title}</p>
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

'use client'

import { useState } from 'react'
import Link from 'next/link'

type Category = 'All' | 'Charity' | 'Competition' | 'Ruck Progression'

interface Event {
  title: string
  slug: string
  description: string
  date?: string
  location?: string
  entry?: string
  beneficiary?: string
  category: Category
}

const events: Event[] = [
  {
    title: 'Ruck Hunger 2026',
    slug: 'ruck-hunger-2026',
    description:
      'Team charity ruck benefiting the Fredericksburg Regional Food Bank. Lace up, load your ruck, and fight hunger in your community.',
    category: 'Charity',
  },
  {
    title: 'Ruck with Pups — 5K Canine Festival',
    slug: 'ruck-with-pups',
    description:
      'Ruck with your dog at this 5K canine festival. A fun, community event celebrating the bond between athletes and their four-legged training partners.',
    category: 'Charity',
  },
  {
    title: 'Whiskey Valor',
    slug: 'whiskey-valor',
    description:
      'A Warrior Workout event combining grit, camaraderie, and competition. Push your limits in honor of those who served.',
    category: 'Competition',
  },
  {
    title: 'Field Meet: Honor Bound FIT & VA National Guard',
    slug: 'field-meet-va-national-guard',
    description:
      'A Combat Conditioning Field Meet hosted in partnership with the Virginia National Guard. Athletes compete in military-inspired physical tasks.',
    category: 'Competition',
  },
  {
    title: 'GUIDON22',
    slug: 'guidon22',
    description:
      'A 22-mile ruck event on November 22 starting at 5.11 Tactical Fredericksburg. $22 entry fee. All proceeds benefit Hero\'s Bridge.',
    date: 'November 22, 2025',
    location: '5.11 Tactical, Fredericksburg, VA',
    entry: '$22',
    beneficiary: "Hero's Bridge",
    category: 'Charity',
  },
  {
    title: 'Monthly Ruck Progression: 18 Mile Costume Ruck',
    slug: 'monthly-ruck-18-mile-costume',
    description:
      'Halloween-themed 18-mile ruck. Dress up, load up, and move out. Part of the ongoing Monthly Ruck Progression series.',
    date: 'November 1',
    category: 'Ruck Progression',
  },
  {
    title: 'Monthly Ruck Progression: 15 Mile Ruck',
    slug: 'monthly-ruck-15-mile',
    description:
      'A standard 15-mile ruck progression event. Build your base, push your endurance, and share the grind with the Honor Bound community.',
    category: 'Ruck Progression',
  },
  {
    title: 'Monthly Ruck Progression: 15 Miles Overnight',
    slug: 'monthly-ruck-15-mile-overnight',
    description:
      'A 15-mile overnight ruck through historic downtown Fredericksburg. Experience the city under the stars while you earn your miles.',
    location: 'Historic Downtown Fredericksburg, VA',
    category: 'Ruck Progression',
  },
]

const categories: Category[] = ['All', 'Charity', 'Competition', 'Ruck Progression']

const categoryColors: Record<Category, string> = {
  All: 'border-zinc-600 text-zinc-400 hover:border-white hover:text-white',
  Charity: 'border-emerald-700 text-emerald-400 hover:border-emerald-400',
  Competition: 'border-red-800 text-red-400 hover:border-red-400',
  'Ruck Progression': 'border-blue-800 text-blue-400 hover:border-blue-400',
}

const categoryBadgeColors: Record<Category, string> = {
  All: 'bg-zinc-800 text-zinc-300',
  Charity: 'bg-emerald-900/60 text-emerald-300',
  Competition: 'bg-red-900/60 text-red-300',
  'Ruck Progression': 'bg-blue-900/60 text-blue-300',
}

export default function EventsPage() {
  const [active, setActive] = useState<Category>('All')

  const filtered = active === 'All' ? events : events.filter((e) => e.category === active)

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-28 px-6 bg-zinc-950 border-b border-zinc-800 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-zinc-500 mb-4">
          Honor Bound FIT
        </p>
        <h1 className="font-montserrat font-black text-5xl md:text-7xl uppercase tracking-tight mb-6">
          Events
        </h1>
        <div className="w-16 h-1 bg-white mx-auto mb-8" />
        <p className="font-lora text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed italic">
          Rucks, competitions, and community events built for those who choose hard.
        </p>
      </section>

      {/* Filter Bar */}
      <section className="py-10 px-6 border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur-sm z-20">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-montserrat text-xs uppercase tracking-widest px-5 py-2 border rounded transition-all duration-200 ${
                active === cat
                  ? 'bg-white text-black border-white'
                  : categoryColors[cat]
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <p className="font-lora text-zinc-500 text-center italic py-12">
              No events in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((event) => (
                <div
                  key={event.slug}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-7 flex flex-col hover:border-zinc-600 transition-all duration-200"
                >
                  {/* Category badge */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <span
                      className={`font-montserrat text-xs uppercase tracking-widest px-3 py-1 rounded ${
                        categoryBadgeColors[event.category]
                      }`}
                    >
                      {event.category}
                    </span>
                    {event.date && (
                      <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 text-right">
                        {event.date}
                      </span>
                    )}
                  </div>

                  <h2 className="font-montserrat font-bold text-xl leading-snug mb-3">
                    {event.title}
                  </h2>

                  <p className="font-lora text-zinc-400 text-sm leading-relaxed flex-1 mb-4">
                    {event.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-1 mb-6">
                    {event.location && (
                      <p className="font-montserrat text-xs text-zinc-500 uppercase tracking-wide">
                        📍 {event.location}
                      </p>
                    )}
                    {event.entry && (
                      <p className="font-montserrat text-xs text-zinc-500 uppercase tracking-wide">
                        Entry: {event.entry}
                      </p>
                    )}
                    {event.beneficiary && (
                      <p className="font-montserrat text-xs text-emerald-600 uppercase tracking-wide">
                        Benefits: {event.beneficiary}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mt-auto"
                  >
                    Read More →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

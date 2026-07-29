'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, DollarSign, Heart, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { events, type EventCategory, type HBFITEvent } from '@/lib/events-data'

type Filter = 'All' | EventCategory

const FILTERS: Filter[] = ['All', 'Charity', 'Ruck Progression', 'Community']

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function EventCard({ event, dimmed }: { event: HBFITEvent; dimmed?: boolean }) {
  const categoryColor: Record<EventCategory, string> = {
    Charity:            'text-emerald-400',
    Competition:        'text-red-400',
    'Ruck Progression': 'text-blue-400',
    Community:          'text-sky-400',
  }

  return (
    <div className={cn(
      'border flex flex-col transition-colors group',
      dimmed
        ? 'border-white/5 bg-zinc-950/50 opacity-50 hover:opacity-70'
        : 'border-white/10 bg-zinc-950 hover:border-white/30'
    )}>
      {/* Top bar — category + date */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-white/10">
        <span className={cn(
          'font-montserrat font-bold text-xs uppercase tracking-widest',
          categoryColor[event.category]
        )}>
          {event.category}
        </span>
        <span className="font-montserrat text-xs text-white/30 uppercase tracking-wide">
          {event.date ? formatDate(event.date) : 'Date TBD'}
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex-1 flex flex-col gap-4">
        <h2 className="font-montserrat font-extrabold text-lg uppercase leading-snug text-white">
          {event.title}
        </h2>

        <p className="text-white/50 text-sm leading-relaxed flex-1">
          {event.description}
        </p>

        {/* Meta */}
        {(event.time || event.location || event.entry || event.beneficiary) && (
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            {event.time && (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Clock size={11} className="shrink-0" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <MapPin size={11} className="shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
            {event.entry && (
              <div className="flex items-center gap-2 text-xs text-white/40">
                <DollarSign size={11} className="shrink-0" />
                <span>Entry: {event.entry}</span>
              </div>
            )}
            {event.beneficiary && (
              <div className="flex items-center gap-2 text-xs text-emerald-400/80">
                <Heart size={11} className="shrink-0" />
                <span>Benefits: {event.beneficiary}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
        <Link
          href={`/events/${event.slug}`}
          className="flex items-center gap-2 text-xs font-montserrat font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors group/link"
        >
          Learn More
          <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
        {event.runsignupUrl && !event.past && (
          <a
            href={event.runsignupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs font-montserrat font-bold uppercase tracking-widest px-3 py-1.5 border border-white/20 text-white/60 hover:border-white hover:text-white transition-colors"
          >
            Register ↗
          </a>
        )}
        {event.past && (
          <span className="ml-auto text-xs font-montserrat uppercase tracking-widest text-white/20">
            Past event
          </span>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [active, setActive] = useState<Filter>('All')
  const [showPast, setShowPast] = useState(false)

  const upcoming = events.filter(e => !e.past)
  const past     = events.filter(e => e.past)

  const filterFn = (list: HBFITEvent[]) =>
    active === 'All' ? list : list.filter(e => e.category === active)

  const sortFn = (list: HBFITEvent[]) => {
    const dated   = list.filter(e => e.date).sort((a, b) => a.date!.localeCompare(b.date!))
    const undated = list.filter(e => !e.date)
    return [...dated, ...undated]
  }

  const upcomingFiltered = sortFn(filterFn(upcoming))
  const pastFiltered     = sortFn(filterFn(past)).reverse() // most recent first

  return (
    <main className="bg-black text-white min-h-screen">
      {/* Header */}
      <section className="py-16 px-6 bg-zinc-950 border-b border-white/10 text-center">
        <p className="font-montserrat text-xs tracking-[0.3em] uppercase text-white/40 mb-3">
          Honor Bound FIT
        </p>
        <h1 className="font-montserrat font-black text-5xl md:text-6xl uppercase tracking-tight mb-4">
          Events
        </h1>
        <div className="w-12 h-0.5 bg-white mx-auto mb-5" />
        <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
          Rucks, charity events, and community workouts built for those who choose hard.
        </p>
      </section>

      {/* Filter bar */}
      <section className="border-b border-white/10 bg-black sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                'font-montserrat text-xs uppercase tracking-widest px-4 py-2 border transition-colors',
                active === f
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/50 border-white/20 hover:border-white/50 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-white/20 font-montserrat">
            {upcomingFiltered.length} upcoming
          </span>
        </div>
      </section>

      {/* Upcoming grid */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {upcomingFiltered.length === 0 ? (
            <p className="text-white/30 text-center text-sm py-20 font-montserrat uppercase tracking-widest">
              No upcoming events in this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingFiltered.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past events toggle */}
      {pastFiltered.length > 0 && (
        <section className="pb-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="border-t border-white/10 pt-8">
              <button
                onClick={() => setShowPast(v => !v)}
                className="flex items-center gap-3 text-xs font-montserrat uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-6"
              >
                {showPast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showPast ? 'Hide' : 'View'} Past Events ({pastFiltered.length})
              </button>

              {showPast && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pastFiltered.map((event) => (
                    <EventCard key={event.slug} event={event} dimmed />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

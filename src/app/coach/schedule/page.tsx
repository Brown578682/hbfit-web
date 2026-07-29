'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CoachSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay())
    d.setHours(0,0,0,0)
    return d
  })
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/coach/sessions?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then(r => r.json())
      .then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weekStart.toISOString()])

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d) }

  // Group sessions by day
  const byDay: Record<number, any[]> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]}
  for (const s of sessions) {
    const day = new Date(s.startTime).getDay()
    byDay[day].push(s)
  }

  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
          <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Schedule</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevWeek} className="p-2 border border-zinc-700 hover:border-white hover:text-white text-zinc-400 transition-colors rounded">
            <ChevronLeft size={18} />
          </button>
          <span className="font-montserrat text-sm text-white min-w-[160px] text-center">
            {MONTHS[weekStart.getMonth()]} {weekStart.getDate()} – {MONTHS[weekEnd.getMonth()]} {weekEnd.getDate()}, {weekEnd.getFullYear()}
          </span>
          <button onClick={nextWeek} className="p-2 border border-zinc-700 hover:border-white hover:text-white text-zinc-400 transition-colors rounded">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 font-lora italic text-center py-20">Loading schedule...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={i} className="min-h-[200px]">
                <div className={`text-center py-2 mb-2 rounded font-montserrat text-xs uppercase tracking-wider ${
                  isToday ? 'bg-white text-black font-bold' : 'text-zinc-500'
                }`}>
                  <div>{DAYS[day.getDay()]}</div>
                  <div className="text-lg font-bold leading-none mt-0.5">{day.getDate()}</div>
                </div>
                <div className="space-y-1.5">
                  {(byDay[day.getDay()] || []).map((s: any) => (
                    <Link key={s.id} href={`/coach/session/${s.id}`}
                      className="block bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 rounded p-2 transition-colors">
                      <div className="font-montserrat text-xs font-bold text-white truncate">{s.classType?.name}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{fmt(new Date(s.startTime))}</div>
                      <div className="text-zinc-600 text-xs">{s._count?.bookings ?? 0}/{s.capacity}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

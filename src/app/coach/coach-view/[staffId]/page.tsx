'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffInfo {
  id: string
  firstName: string
  lastName: string
  title: string | null
}

interface Session {
  id: string
  startTime: string
  endTime: string
  classType: { name: string }
  _count: { bookings: number }
  capacity: number | null
}

const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

export default function CoachViewPage() {
  const { staffId } = useParams<{ staffId: string }>()
  const [coach, setCoach] = useState<StaffInfo | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/coach/staff').then(r => r.json()),
      fetch(`/api/coach/sessions?staffId=${staffId}`).then(r => r.json()),
    ]).then(([staffList, sessData]) => {
      const found = Array.isArray(staffList) ? staffList.find((s: StaffInfo) => s.id === staffId) : null
      setCoach(found ?? null)
      setSessions(Array.isArray(sessData) ? sessData : (sessData.sessions ?? []))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [staffId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-600 font-montserrat text-sm uppercase tracking-widest">Loading…</div>
      </div>
    )
  }

  const today = new Date()
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.startTime)
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate()
  })

  const nextSession = sessions
    .filter(s => new Date(s.startTime) > today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]

  const totalBooked = todaySessions.reduce((a, s) => a + (s._count?.bookings ?? 0), 0)

  const stats = [
    { label: "Today's Classes", value: todaySessions.length, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Total Booked',    value: totalBooked,           icon: Users,    color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Next Class',      value: nextSession ? fmt(new Date(nextSession.startTime)) : '—', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Date',            value: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-6 bg-purple-400" />
          <h1 className="font-montserrat font-black text-2xl uppercase tracking-widest">
            {coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown Coach'}
          </h1>
        </div>
        {coach?.title && (
          <p className="font-montserrat text-sm text-zinc-500 uppercase tracking-widest ml-4">{coach.title}</p>
        )}
        <p className="font-montserrat text-xs text-purple-400/60 uppercase tracking-widest mt-1 ml-4">
          Admin preview — coach portal view
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn('border border-zinc-800 p-5', bg)}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <div className={cn('font-montserrat font-black text-3xl', color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* Today's sessions */}
      <div className="border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-widest">Today's Sessions</h2>
          <span className="text-zinc-600 text-xs font-montserrat">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        {todaySessions.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-600 font-montserrat text-sm">No classes scheduled today.</div>
        ) : (
          todaySessions.map(s => {
            const start = new Date(s.startTime)
            const end = new Date(s.endTime)
            const booked = s._count?.bookings ?? 0
            const cap = s.capacity
            return (
              <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900 transition-colors">
                <div>
                  <p className="font-montserrat font-bold text-sm text-white">{s.classType.name}</p>
                  <p className="font-montserrat text-xs text-zinc-500 mt-0.5">{fmt(start)} – {fmt(end)}</p>
                </div>
                <div className="text-right">
                  <p className="font-montserrat font-bold text-sm text-white">
                    {booked}{cap ? `/${cap}` : ''} <span className="text-zinc-500 font-normal">booked</span>
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

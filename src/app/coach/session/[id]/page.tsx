'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react'

function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/coach/sessions/${id}`)
      .then(r => r.json())
      .then(d => { setSession(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const toggleAttendance = async (bookingId: string, current: boolean) => {
    setToggling(bookingId)
    await fetch(`/api/coach/sessions/${id}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, checkedIn: !current }),
    })
    setSession((prev: any) => ({
      ...prev,
      bookings: prev.bookings.map((b: any) =>
        b.id === bookingId ? { ...b, checkedIn: !current } : b
      ),
    }))
    setToggling(null)
  }

  if (loading) return <div className="p-8 text-zinc-500 font-lora italic">Loading session...</div>
  if (!session) return <div className="p-8 text-red-400 font-montserrat">Session not found.</div>

  const checkedIn = session.bookings?.filter((b: any) => b.checkedIn).length ?? 0

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/coach/schedule" className="flex items-center gap-2 text-zinc-500 hover:text-white font-montserrat text-xs uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Schedule
      </Link>

      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">{fmtDate(new Date(session.startTime))}</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight mb-2">
          {session.classType?.name}
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>{fmt(new Date(session.startTime))} – {fmt(new Date(session.endTime))}</span>
          {session.instructor && <span>{session.instructor.firstName} {session.instructor.lastName}</span>}
          {session.location && <span>{session.location}</span>}
        </div>
      </div>

      {/* Attendance summary */}
      <div className="flex items-center gap-6 bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-8">
        <div className="text-center">
          <div className="font-montserrat font-black text-3xl text-white">{session.bookings?.length ?? 0}</div>
          <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500">Booked</div>
        </div>
        <div className="w-px h-12 bg-zinc-700" />
        <div className="text-center">
          <div className="font-montserrat font-black text-3xl text-green-400">{checkedIn}</div>
          <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500">Present</div>
        </div>
        <div className="w-px h-12 bg-zinc-700" />
        <div className="text-center">
          <div className="font-montserrat font-black text-3xl text-zinc-500">{session.capacity}</div>
          <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500">Capacity</div>
        </div>
      </div>

      {/* Roster */}
      <h2 className="font-montserrat font-bold text-lg uppercase tracking-wide mb-4">Roster</h2>
      {!session.bookings?.length ? (
        <p className="text-zinc-500 font-lora italic">No bookings yet.</p>
      ) : (
        <div className="space-y-2">
          {session.bookings.map((booking: any) => (
            <div key={booking.id}
              className={`flex items-center justify-between rounded-lg p-4 border transition-colors ${
                booking.checkedIn ? 'bg-green-950/20 border-green-800/40' : 'bg-zinc-900 border-zinc-800'
              }`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAttendance(booking.id, booking.checkedIn)}
                  disabled={toggling === booking.id}
                  className="transition-colors"
                >
                  {booking.checkedIn
                    ? <CheckCircle2 size={24} className="text-green-400" />
                    : <Circle size={24} className="text-zinc-600 hover:text-zinc-400" />}
                </button>
                <div>
                  <Link href={`/coach/members/${booking.member?.id}`}
                    className="font-montserrat font-bold text-white hover:text-amber-400 transition-colors">
                    {booking.member?.firstName} {booking.member?.lastName}
                  </Link>
                  {booking.member?.phone && (
                    <div className="text-zinc-500 text-xs mt-0.5">{booking.member.phone}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {booking.member?.gapEligible && (
                  <span className="text-xs font-montserrat uppercase tracking-wider bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded">GAP</span>
                )}
                <span className={`text-xs font-montserrat uppercase tracking-wider px-2 py-0.5 rounded ${
                  booking.status === 'CONFIRMED' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-800 text-zinc-600'
                }`}>{booking.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {session.notes && (
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h3 className="font-montserrat font-bold text-sm uppercase tracking-wide text-zinc-400 mb-2">Session Notes</h3>
          <p className="font-lora text-zinc-300">{session.notes}</p>
        </div>
      )}
    </div>
  )
}

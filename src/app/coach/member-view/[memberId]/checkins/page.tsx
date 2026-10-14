'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface CheckIn {
  id: string
  type: string
  scheduledDate: string
  memberCompletedAt: string | null
  coachCompletedAt: string | null
}

const TYPE_LABEL: Record<string, string> = {
  DAY1: 'Day 1', DAY30: 'Day 30', DAY60: 'Day 60', DAY90: 'Day 90',
}

export default function MemberViewCheckinsPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const [memberName, setMemberName] = useState('')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) return
    fetch(`/api/coach/members/${memberId}`)
      .then(r => r.json())
      .then(m => {
        setMemberName(`${m.firstName} ${m.lastName}`)
        // journeyCheckIns come from the member detail endpoint
        const cis = m.journeyCheckIns ?? m.checkIns ?? []
        setCheckIns(Array.isArray(cis) ? cis : [])
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [memberId])

  if (loading) return <div className="p-8 text-zinc-500 text-sm font-montserrat">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3 bg-green-400/5 border border-green-400/20 px-4 py-3">
        <AlertCircle size={15} className="text-green-400 shrink-0" />
        <p className="text-green-400 text-xs font-montserrat font-bold uppercase tracking-wide">
          Coach View — {memberName}
        </p>
      </div>

      <h1 className="font-montserrat font-black text-2xl uppercase tracking-tight flex items-center gap-3 mb-6">
        <ClipboardList size={22} className="text-red-500" /> 90-Day Check-ins
      </h1>

      {checkIns.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-montserrat text-sm">No check-ins scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {checkIns.map(ci => {
            const isComplete = !!ci.memberCompletedAt
            const isPast = new Date(ci.scheduledDate) <= new Date()
            return (
              <div key={ci.id} className={`border p-5 ${
                isComplete
                  ? 'bg-emerald-900/10 border-emerald-700/30'
                  : isPast
                  ? 'bg-amber-900/10 border-amber-700/30'
                  : 'bg-zinc-900 border-zinc-800'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-montserrat font-black text-lg uppercase">
                    {TYPE_LABEL[ci.type] ?? ci.type}
                  </span>
                  {isComplete
                    ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    : isPast
                    ? <Clock size={18} className="text-amber-400 shrink-0" />
                    : <Clock size={18} className="text-zinc-600 shrink-0" />
                  }
                </div>
                <p className="text-zinc-500 text-xs">
                  Scheduled: {new Date(ci.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {isComplete && ci.memberCompletedAt && (
                  <p className="text-emerald-400 text-xs mt-1 font-bold">
                    ✓ Member completed {new Date(ci.memberCompletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
                {!isComplete && isPast && (
                  <p className="text-amber-400 text-xs mt-1 font-bold">⏳ Overdue</p>
                )}
                {!isComplete && !isPast && (
                  <p className="text-zinc-600 text-xs mt-1">Upcoming</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

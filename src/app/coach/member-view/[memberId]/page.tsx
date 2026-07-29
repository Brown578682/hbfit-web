'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  CalendarDays, CheckCircle2, CreditCard, Dumbbell,
  History, Trophy, ClipboardList, AlertCircle,
} from 'lucide-react'

// Mirrors the member dashboard but fetches data for a specific member (via coach API)
export default function MemberViewPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const [member, setMember] = useState<any>(null)
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) return
    Promise.all([
      fetch(`/api/coach/members/${memberId}`).then(r => r.json()),
      fetch(`/api/coach/members/${memberId}/checkins`).then(r => r.json()).catch(() => []),
    ]).then(([m, ci]) => {
      setMember(m)
      setCheckIns(Array.isArray(ci) ? ci : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [memberId])

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-500 font-montserrat text-sm">Loading member data...</div>
    )
  }

  if (!member || member.error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-zinc-400 font-montserrat text-sm">Could not load member data.</p>
      </div>
    )
  }

  const firstName = member.firstName ?? 'Member'
  const plan = member.currentPlan?.name ?? 'No active plan'
  const status = member.status ?? '—'
  const joinedAt = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE:    'text-green-400 bg-green-400/10 border-green-400/20',
    PENDING:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
    INACTIVE:  'text-red-400   bg-red-400/10   border-red-400/20',
    LEAD:      'text-amber-400 bg-amber-400/10 border-amber-400/20',
    SUSPENDED: 'text-red-400   bg-red-400/10   border-red-400/20',
  }

  const TYPE_LABEL: Record<string, string> = {
    DAY1: 'Day 1', DAY30: 'Day 30', DAY60: 'Day 60', DAY90: 'Day 90',
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Coach overlay banner */}
      <div className="mb-6 flex items-center gap-3 bg-green-400/5 border border-green-400/20 px-4 py-3">
        <AlertCircle size={15} className="text-green-400 shrink-0" />
        <p className="text-green-400 text-xs font-montserrat font-bold uppercase tracking-wide">
          Coach Preview — viewing portal as {member.firstName} {member.lastName}
        </p>
      </div>

      {/* Member header */}
      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-green-400/70 mb-1">Member Dashboard</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">
          Welcome back, {firstName}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className={`font-montserrat text-xs uppercase tracking-wider px-2 py-0.5 border ${STATUS_COLORS[status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
            {status}
          </span>
          <span className="text-zinc-500 text-sm">{plan}</span>
          <span className="text-zinc-600 text-xs">· Joined {joinedAt}</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Check-ins',     value: member.checkInCount ?? 0,                              icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-400/10'  },
          { label: 'Current Plan',  value: plan.replace(' Program', '').replace(' Membership',''), icon: CreditCard,   color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
          { label: 'Member Since',  value: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—', icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <div className={`inline-flex p-2 mb-3 ${bg}`}><Icon size={16} className={color} /></div>
            <div className={`font-montserrat font-black text-xl ${color}`}>{value}</div>
            <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Journey check-ins */}
      {checkIns.length > 0 && (
        <div className="mb-8">
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <ClipboardList size={15} className="text-zinc-400" /> Journey Check-ins
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
            {checkIns.map((ci: any) => (
              <div key={ci.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-montserrat font-bold text-white text-sm">{TYPE_LABEL[ci.type] ?? ci.type}</div>
                  <div className="text-zinc-500 text-xs">
                    Scheduled: {new Date(ci.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ci.memberCompletedAt
                    ? <span className="text-green-400 text-xs font-montserrat uppercase tracking-wide">Complete</span>
                    : <span className="text-amber-400 text-xs font-montserrat uppercase tracking-wide">Pending</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member details */}
      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="font-montserrat font-bold text-sm uppercase tracking-wide mb-4">Member Details</h2>
        <dl className="space-y-3 text-sm">
          {[
            ['Email',      member.user?.email ?? member.email ?? '—'],
            ['Phone',      member.phone ?? '—'],
            ['Address',    [member.address, member.city, member.state, member.zip].filter(Boolean).join(', ') || '—'],
            ['Referred by', member.referredBy ? `${member.referredBy.firstName} ${member.referredBy.lastName}` : '—'],
            ['Preferred Coach', member.preferredCoach ? `${member.preferredCoach.firstName} ${member.preferredCoach.lastName}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4">
              <dt className="text-zinc-500 font-montserrat uppercase tracking-wider text-xs w-32 shrink-0 pt-0.5">{label}</dt>
              <dd className="text-zinc-300">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Settings, AlertCircle } from 'lucide-react'

export default function MemberViewSettingsPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) return
    fetch(`/api/coach/members/${memberId}`)
      .then(r => r.json())
      .then(m => { setMember(m); setLoading(false) })
      .catch(() => setLoading(false))
  }, [memberId])

  if (loading) return <div className="p-8 text-zinc-500 text-sm font-montserrat">Loading...</div>
  if (!member) return null

  const rows = [
    ['First Name',       member.firstName ?? '—'],
    ['Last Name',        member.lastName  ?? '—'],
    ['Email',            member.user?.email ?? '—'],
    ['Phone',            member.phone  ?? '—'],
    ['Secondary Phone',  member.phone2 ?? '—'],
    ['Secondary Email',  member.email2 ?? '—'],
    ['Date of Birth',    member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('en-US') : '—'],
    ['Address',          [member.address, member.city, member.state, member.zip].filter(Boolean).join(', ') || '—'],
    ['Gender',           member.gender ?? '—'],
    ['GAP Eligible',     member.gapEligible ? 'Yes' : 'No'],
    ['GAP Category',     member.gapCategory ?? '—'],
    ['Member Code',      member.memberCode ?? '—'],
    ['Status',           member.status ?? '—'],
    ['Joined',           member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
    ['Billing Start',    member.billingStartDate ? new Date(member.billingStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
    ['Preferred Coach',  member.preferredCoach ? `${member.preferredCoach.firstName} ${member.preferredCoach.lastName}` : '—'],
    ['Source',           member.source ?? '—'],
    ['Notes',            member.notes ?? '—'],
  ]

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6 flex items-center gap-3 bg-green-400/5 border border-green-400/20 px-4 py-3">
        <AlertCircle size={15} className="text-green-400 shrink-0" />
        <p className="text-green-400 text-xs font-montserrat font-bold uppercase tracking-wide">
          Coach View — {member.firstName} {member.lastName}
        </p>
      </div>

      <h1 className="font-montserrat font-black text-2xl uppercase tracking-tight flex items-center gap-3 mb-6">
        <Settings size={22} className="text-red-500" /> Member Details
      </h1>

      <div className="bg-zinc-900 border border-zinc-800">
        <dl className="divide-y divide-zinc-800">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start gap-4 px-5 py-3">
              <dt className="text-zinc-500 font-montserrat text-xs uppercase tracking-widest w-40 shrink-0 pt-0.5">{label}</dt>
              <dd className="text-zinc-200 text-sm break-words flex-1">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

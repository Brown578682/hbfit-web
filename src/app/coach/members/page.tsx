'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, UserCircle } from 'lucide-react'
import { useView } from '../view-context'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'VISITOR', label: 'Visitor' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10',
  LEAD: 'text-amber-400 bg-amber-400/10',
  VISITOR: 'text-amber-400 bg-amber-400/10',
  PENDING: 'text-amber-400 bg-amber-400/10',
  INACTIVE: 'text-red-400 bg-red-400/10',
  SUSPENDED: 'text-red-400 bg-red-400/10',
}

export default function CoachMembersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const { impersonateMember } = useView()
  const router = useRouter()

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    fetch(`/api/coach/members?${params}`)
      .then(r => r.json())
      .then(d => { setMembers(d.members || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, status])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Members</h1>
        <p className="text-zinc-400 text-sm mt-1">{total} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full bg-zinc-900 border border-zinc-700 text-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 font-montserrat"
          />
        </div>
        <select
          value={status} onChange={e => setStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 font-montserrat"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Name', 'Email', 'Status', 'Plan', 'Check-ins', 'Joined', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-montserrat text-xs uppercase tracking-wider text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-lora italic">Loading...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500 font-lora italic">No members found.</td></tr>
            ) : members.map((m: any) => (
              <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/coach/members/${m.id}`} className="font-montserrat font-semibold text-white hover:text-amber-400 transition-colors">
                    {m.firstName} {m.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-400 font-lora">{m.email}</td>
                <td className="px-4 py-3">
                  <span className={`font-montserrat text-xs uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLORS[m.status] ?? 'text-zinc-400 bg-zinc-800'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs font-montserrat">{m.currentPlan?.name ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400 text-center">{m.checkInCount}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs font-lora">
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'2-digit'}) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/coach/members/${m.id}`} className="text-xs font-montserrat uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">View →</Link>
                    <button
                      onClick={() => {
                        impersonateMember(m.id, `${m.firstName} ${m.lastName}`)
                        router.push(`/coach/member-view/${m.id}`)
                      }}
                      className="flex items-center gap-1 text-xs font-montserrat uppercase tracking-wider text-green-500/60 hover:text-green-400 transition-colors"
                      title="View portal as this member"
                    >
                      <UserCircle size={12} /> Member View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  UserCircle, Users, ChevronUp,
} from 'lucide-react'
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

type SortKey = 'name' | 'status' | 'plan' | 'checkIns' | 'joined'
type SortDir = 'asc' | 'desc'

function sortValue(m: any, key: SortKey): string | number {
  switch (key) {
    case 'name':     return `${m.lastName} ${m.firstName}`.toLowerCase()
    case 'status':   return m.status ?? ''
    case 'plan':     return m.currentPlan?.name ?? ''
    case 'checkIns': return m.checkInCount ?? 0
    case 'joined':   return m.joinedAt ? new Date(m.joinedAt).getTime() : 0
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`font-montserrat text-xs uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLORS[status] ?? 'text-zinc-400 bg-zinc-800'}`}>
      {status}
    </span>
  )
}

// ─── Mobile card ─────────────────────────────────────────────────────────────
function MemberCard({ m, impersonateMember, router, selectedIds, toggleId }: {
  m: any
  impersonateMember: (id: string, name: string) => void
  router: any
  selectedIds: Set<string>
  toggleId: (id: string, checked: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const hasKids = m.dependents?.length > 0

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Primary row */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/coach/members/${m.id}`}
              className="font-montserrat font-bold text-white text-base hover:text-amber-400 transition-colors"
            >
              {m.firstName} {m.lastName}
            </Link>
            {hasKids && (
              <span className="flex items-center gap-0.5 text-[10px] font-montserrat uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                <Users size={9} /> {m.dependents.length + 1}
              </span>
            )}
            {m.isMinor && (
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-sky-400/60 bg-sky-400/10 px-1.5 py-0.5 rounded">Minor</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={m.status} />
            <span className="text-zinc-500 text-xs font-montserrat">{m.currentPlan?.name ?? '—'}</span>
            {m.checkInCount > 0 && (
              <span className="text-zinc-600 text-xs font-montserrat">{m.checkInCount} check-ins</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="checkbox"
            className="rounded border-zinc-600 bg-zinc-800 accent-red-600 cursor-pointer"
            checked={selectedIds.has(m.id)}
            onChange={e => toggleId(m.id, e.target.checked)}
            onClick={e => e.stopPropagation()}
          />
          {hasKids && (
            <button
              onClick={() => setOpen(o => !o)}
              className="text-zinc-500 hover:text-white transition-colors p-1"
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="px-4 py-2 border-t border-zinc-800/60 flex items-center gap-4 bg-zinc-950/40">
        <Link
          href={`/coach/members/${m.id}`}
          className="text-xs font-montserrat uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
        >
          View Profile →
        </Link>
        <button
          onClick={() => {
            impersonateMember(m.id, `${m.firstName} ${m.lastName}`)
            router.push(`/coach/member-view/${m.id}`)
          }}
          className="flex items-center gap-1 text-xs font-montserrat uppercase tracking-wider text-green-500/60 hover:text-green-400 transition-colors"
        >
          <UserCircle size={12} /> Member View
        </button>
      </div>

      {/* Dependents */}
      {hasKids && open && (
        <div className="border-t border-zinc-800">
          {m.dependents.map((dep: any) => (
            <div key={dep.id} className="px-4 py-2.5 flex items-center gap-3 border-b border-zinc-800/40 last:border-0 bg-zinc-950/60">
              <span className="text-zinc-700 text-sm shrink-0">└</span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/coach/members/${dep.id}`}
                  className="font-montserrat font-semibold text-sm text-zinc-300 hover:text-white transition-colors"
                >
                  {dep.firstName} {dep.lastName}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={dep.status} />
                  {dep.isMinor && (
                    <span className="text-[10px] font-montserrat uppercase tracking-wider text-sky-400/60">Minor</span>
                  )}
                  <span className="text-zinc-600 text-xs font-montserrat italic">{dep.currentPlan?.name ?? 'add-on'}</span>
                </div>
              </div>
              <Link
                href={`/coach/members/${dep.id}`}
                className="text-xs font-montserrat text-zinc-600 hover:text-white transition-colors shrink-0"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Desktop table row ────────────────────────────────────────────────────────
function MemberRow({ m, depth = 0, impersonateMember, router, selectedIds, toggleId }: {
  m: any
  depth?: number
  impersonateMember: (id: string, name: string) => void
  router: any
  selectedIds: Set<string>
  toggleId: (id: string, checked: boolean) => void
}) {
  const [open, setOpen] = useState(true)
  const hasKids = m.dependents?.length > 0
  const indent = depth > 0

  return (
    <>
      <tr className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${indent ? 'bg-zinc-950/60' : ''}`}>
        <td className="px-3 py-3 w-8">
          <input
            type="checkbox"
            className="rounded border-zinc-600 bg-zinc-800 accent-red-600 cursor-pointer"
            checked={selectedIds.has(m.id)}
            onChange={e => toggleId(m.id, e.target.checked)}
            onClick={e => e.stopPropagation()}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: indent ? '1.5rem' : undefined }}>
            {hasKids && (
              <button onClick={() => setOpen(o => !o)} className="text-zinc-500 hover:text-white transition-colors shrink-0">
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            {!hasKids && indent && <span className="text-zinc-700 shrink-0">└</span>}
            {!hasKids && !indent && <span className="w-[14px] shrink-0" />}
            <Link href={`/coach/members/${m.id}`} className="font-montserrat font-semibold text-white hover:text-amber-400 transition-colors">
              {m.firstName} {m.lastName}
            </Link>
            {m.isHouseholdPrimary && hasKids && (
              <span className="flex items-center gap-0.5 text-[10px] font-montserrat uppercase tracking-wider text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                <Users size={9} /> {m.dependents.length + 1}
              </span>
            )}
            {m.isMinor && (
              <span className="text-[10px] font-montserrat uppercase tracking-wider text-sky-400/60 bg-sky-400/10 px-1.5 py-0.5 rounded">Minor</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-zinc-400 font-lora text-sm">
          {indent ? <span className="text-zinc-600 text-xs">{m.email || '—'}</span> : (m.email || '—')}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={m.status} />
        </td>
        <td className="px-4 py-3 text-zinc-400 text-xs font-montserrat">
          {indent ? <span className="text-zinc-600 italic">{m.currentPlan?.name ?? 'add-on'}</span> : (m.currentPlan?.name ?? '—')}
        </td>
        <td className="px-4 py-3 text-zinc-400 text-center font-montserrat text-sm">{m.checkInCount ?? 0}</td>
        <td className="px-4 py-3 text-zinc-500 text-xs font-lora">
          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/coach/members/${m.id}`} className="text-xs font-montserrat uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
              View →
            </Link>
            <button
              onClick={() => { impersonateMember(m.id, `${m.firstName} ${m.lastName}`); router.push(`/coach/member-view/${m.id}`) }}
              className="flex items-center gap-1 text-xs font-montserrat uppercase tracking-wider text-green-500/60 hover:text-green-400 transition-colors"
            >
              <UserCircle size={12} /> Member View
            </button>
          </div>
        </td>
      </tr>
      {hasKids && open && m.dependents.map((dep: any) => (
        <MemberRow key={dep.id} m={dep} depth={depth + 1} impersonateMember={impersonateMember} router={router} selectedIds={selectedIds} toggleId={toggleId} />
      ))}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachMembersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')
  const [members, setMembers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { impersonateMember } = useView()
  const router = useRouter()

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (plan) params.set('plan', plan)
    fetch(`/api/coach/members?${params}`)
      .then(r => r.json())
      .then(d => {
        setMembers(d.members || [])
        setTotal(d.total || 0)
        if (d.plans?.length) setPlans(d.plans)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, status, plan])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [members, sortKey, sortDir])

  const toggleId = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id); else next.delete(id)
      return next
    })
  }, [])

  const allVisibleIds = useMemo(() => {
    const ids: string[] = []
    for (const m of sorted) {
      ids.push(m.id)
      for (const d of (m.dependents ?? [])) ids.push(d.id)
    }
    return ids
  }, [sorted])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} member(s)? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/members/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      })
      if (!res.ok) throw new Error('Delete failed')
      setMembers(prev => prev.filter(m =>
        !selectedIds.has(m.id) && !(m.dependents ?? []).every((d: any) => selectedIds.has(d.id))
      ))
      setSelectedIds(new Set())
      load()
    } catch {
      setDeleteError('Failed to delete. Please try again.')
      setTimeout(() => setDeleteError(null), 3000)
    } finally {
      setDeleting(false)
    }
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ArrowUpDown size={11} className="ml-1 text-zinc-600 inline" />
    return sortDir === 'asc'
      ? <ArrowUp size={11} className="ml-1 text-amber-400 inline" />
      : <ArrowDown size={11} className="ml-1 text-amber-400 inline" />
  }

  function ColHeader({ label, col }: { label: string; col: SortKey }) {
    return (
      <th
        className="text-left px-4 py-3 font-montserrat text-xs uppercase tracking-wider text-zinc-500 cursor-pointer select-none hover:text-white transition-colors whitespace-nowrap"
        onClick={() => handleSort(col)}
      >
        {label}<SortIcon col={col} />
      </th>
    )
  }

  const displayTotal = sorted.reduce((n, m) => n + 1 + (m.dependents?.length ?? 0), 0)

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'plan', label: 'Plan' },
    { value: 'checkIns', label: 'Check-ins' },
    { value: 'joined', label: 'Joined' },
  ]

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Coach Portal</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Members</h1>
        <p className="text-zinc-400 text-sm mt-1">{displayTotal} total</p>
        {selectedIds.size > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-montserrat text-sm font-bold transition-colors rounded"
            >
              {deleting ? 'Deleting…' : `Delete (${selectedIds.size})`}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-zinc-500 hover:text-white font-montserrat text-xs uppercase tracking-wider transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full bg-zinc-900 border border-zinc-700 text-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/50 font-montserrat"
          />
        </div>

        {/* Status + Plan filters on one row for mobile */}
        <div className="flex gap-2">
          <select
            value={status} onChange={e => setStatus(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white/50 font-montserrat"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={plan} onChange={e => setPlan(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white/50 font-montserrat"
          >
            <option value="">All Plans</option>
            {plans.map((p: any) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>

        {/* Mobile sort dropdown */}
        <div className="flex gap-2 sm:hidden">
          <select
            value={sortKey}
            onChange={e => { setSortKey(e.target.value as SortKey); setSortDir('asc') }}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 text-sm focus:outline-none font-montserrat"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
          </select>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="bg-zinc-900 border border-zinc-700 text-white px-3 py-2.5 text-sm font-montserrat flex items-center gap-1"
          >
            {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </button>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <p className="text-center text-zinc-500 font-lora italic py-12">Loading...</p>
        ) : sorted.length === 0 ? (
          <p className="text-center text-zinc-500 font-lora italic py-12">No members found.</p>
        ) : sorted.map((m: any) => (
          <MemberCard key={m.id} m={m} impersonateMember={impersonateMember} router={router} selectedIds={selectedIds} toggleId={toggleId} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  className="rounded border-zinc-600 bg-zinc-800 accent-red-600 cursor-pointer"
                  checked={allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.has(id))}
                  onChange={e => {
                    if (e.target.checked) setSelectedIds(new Set(allVisibleIds))
                    else setSelectedIds(new Set())
                  }}
                />
              </th>
              <ColHeader label="Name" col="name" />
              <th className="text-left px-4 py-3 font-montserrat text-xs uppercase tracking-wider text-zinc-500">Email</th>
              <ColHeader label="Status" col="status" />
              <ColHeader label="Plan" col="plan" />
              <ColHeader label="Check-ins" col="checkIns" />
              <ColHeader label="Joined" col="joined" />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500 font-lora italic">Loading...</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500 font-lora italic">No members found.</td></tr>
            ) : sorted.map((m: any) => (
              <MemberRow key={m.id} m={m} impersonateMember={impersonateMember} router={router} selectedIds={selectedIds} toggleId={toggleId} />
            ))}
          </tbody>
        </table>
      </div>
      {deleteError && (
        <div className="fixed bottom-6 right-6 bg-red-700 text-white font-montserrat text-sm font-semibold px-5 py-3 rounded-lg shadow-xl z-50">
          {deleteError}
        </div>
      )}
    </div>
  )
}

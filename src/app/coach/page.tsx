'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, DollarSign, TrendingDown, UserPlus, GitBranch,
  Calendar, Clock, TrendingUp, AlertCircle, ChevronRight,
} from 'lucide-react'
import { useView } from './view-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function currency(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Manager Dashboard ──────────────────────────────────────────────────────────
function ManagerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const today = new Date()

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {})
    const start = new Date(); start.setHours(0,0,0,0)
    const end   = new Date(); end.setHours(23,59,59,999)
    fetch(`/api/coach/sessions?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const revenue = stats?.revenue ?? {}

  const revenueRows = [
    { label: 'Membership Dues — Paid',    value: revenue.membershipPaid    ?? 0, text: 'text-green-400',  dot: 'bg-green-400',  bar: 'bg-green-400'  },
    { label: 'Membership Dues — Pending', value: revenue.membershipPending ?? 0, text: 'text-amber-400',  dot: 'bg-amber-400',  bar: 'bg-amber-400'  },
    { label: 'Merchandise',               value: revenue.merchandise       ?? 0, text: 'text-blue-400',   dot: 'bg-blue-400',   bar: 'bg-blue-400'   },
    { label: 'Services',                  value: revenue.services          ?? 0, text: 'text-purple-400', dot: 'bg-purple-400', bar: 'bg-purple-400' },
  ]
  const revenueTotal = revenueRows.reduce((a, r) => a + r.value, 0)

  const topStats = [
    {
      label: 'Total Members',
      value: stats?.memberCount ?? '—',
      sub: `${stats?.activeCount ?? '—'} active`,
      icon: Users,
      color: 'text-white',
      bg: 'bg-white/5',
    },
    {
      label: 'Leads',
      value: stats?.leadCount ?? '—',
      sub: 'not yet converted',
      icon: UserPlus,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Referrals',
      value: stats?.referralCount ?? '—',
      sub: 'this cycle',
      icon: GitBranch,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Churn Rate',
      value: stats?.churnRate != null ? `${stats.churnRate}%` : '—',
      sub: 'last 4-week cycle',
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
    },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-amber-400/70 mb-1">Manager View</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">{fmtDate(today)}</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {topStats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <div className={cn('inline-flex p-2 mb-3', bg)}>
              <Icon size={18} className={color} />
            </div>
            <div className={cn('font-montserrat font-black text-3xl', color)}>{value}</div>
            <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500 mt-1">{label}</div>
            <div className="text-zinc-600 text-xs mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-montserrat font-bold text-base uppercase tracking-wide">Revenue</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {stats?.revenue?.month ?? 'This Month'} &mdash; calendar month view
              <span className="ml-2 text-zinc-600">· Dues billed on individual 4-week cycles</span>
            </p>
          </div>
          <div className="text-right">
            <div className="font-montserrat font-black text-2xl text-white">{currency(revenueTotal)}</div>
            <div className="text-zinc-500 text-xs">total collected</div>
          </div>
        </div>
        <div className="space-y-0 divide-y divide-zinc-800 mt-5">
          {revenueRows.map(({ label, value, text, dot, bar }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
                <span className="text-zinc-300 text-sm font-montserrat">{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-zinc-800 overflow-hidden">
                  <div
                    className={cn('h-full', bar)}
                    style={{ width: revenueTotal > 0 ? `${(value / revenueTotal) * 100}%` : '0%' }}
                  />
                </div>
                <span className={cn('font-montserrat font-bold text-sm w-16 text-right', text)}>
                  {currency(value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's sessions + quick links side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's classes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-montserrat font-bold text-sm uppercase tracking-wide">Today's Classes</h2>
            <Link href="/coach/schedule" className="text-xs font-montserrat uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Full Schedule →
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-6 text-center text-zinc-500 text-sm font-montserrat italic">
              No sessions today
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <div key={s.id} className="bg-zinc-900 border border-zinc-800 flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-montserrat font-bold text-white text-sm">{s.classType?.name ?? 'Class'}</div>
                    <div className="text-zinc-500 text-xs">{fmt(new Date(s.startTime))}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-montserrat font-bold text-white text-sm">{s._count?.bookings ?? 0}/{s.capacity}</div>
                    <div className="text-zinc-500 text-xs">booked</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-montserrat font-bold text-sm uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'View All Members',  href: '/coach/members',   desc: 'Search, filter, manage member profiles' },
              { label: 'Member Map',        href: '/coach/map',        desc: 'See where your community lives' },
              { label: 'Referral Tree',     href: '/coach/referrals', desc: 'Who brought who through the door' },
              { label: 'Admin Panel',       href: '/admin',            desc: 'Billing, GAP approvals, check-ins' },
            ].map(({ label, href, desc }) => (
              <Link key={href} href={href}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-3 transition-colors group">
                <div>
                  <div className="font-montserrat font-bold text-white text-sm">{label}</div>
                  <div className="text-zinc-500 text-xs">{desc}</div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Coach Dashboard ────────────────────────────────────────────────────────────
function CoachDashboard() {
  const [sessions, setSessions] = useState<any[]>([])
  const today = new Date()

  useEffect(() => {
    const start = new Date(); start.setHours(0,0,0,0)
    const end   = new Date(); end.setHours(23,59,59,999)
    fetch(`/api/coach/sessions?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const stats = [
    { label: "Today's Classes", value: sessions.length, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Total Booked',    value: sessions.reduce((a: number, s: any) => a + (s._count?.bookings ?? 0), 0), icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Next Class',      value: sessions[0] ? fmt(new Date(sessions[0].startTime)) : '—', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Date',            value: today.toLocaleDateString('en-US', { month:'short', day:'numeric' }), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-montserrat text-xs uppercase tracking-[0.3em] text-blue-400/70 mb-1">Coach View</p>
        <h1 className="font-montserrat font-black text-3xl uppercase tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">{fmtDate(today)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <div className={cn('inline-flex p-2 mb-3', bg)}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-montserrat font-black text-2xl text-white">{value}</div>
            <div className="font-montserrat text-xs uppercase tracking-wider text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-montserrat font-bold text-lg uppercase tracking-wide">Today&apos;s Sessions</h2>
          <Link href="/coach/schedule" className="text-xs font-montserrat uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Full Schedule →
          </Link>
        </div>
        {sessions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-8 text-center">
            <p className="text-zinc-500 font-montserrat text-sm">No sessions scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <Link key={s.id} href={`/coach/session/${s.id}`}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="font-montserrat font-bold text-white text-sm">{fmt(new Date(s.startTime))}</div>
                    <div className="text-zinc-500 text-xs">{fmt(new Date(s.endTime))}</div>
                  </div>
                  <div className="w-px h-10 bg-zinc-700" />
                  <div>
                    <div className="font-montserrat font-bold text-white">{s.classType?.name}</div>
                    <div className="text-zinc-400 text-sm">
                      {s.instructor ? `${s.instructor.firstName} ${s.instructor.lastName}` : 'Unassigned'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-montserrat font-bold text-white">{s._count?.bookings ?? 0} / {s.capacity}</div>
                  <div className="text-zinc-500 text-xs">booked</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'View All Members', href: '/coach/members',   desc: 'Search, filter, and review member profiles' },
          { label: 'Member Map',       href: '/coach/map',        desc: 'See where your community lives' },
          { label: 'Referral Tree',    href: '/coach/referrals', desc: 'Who brought who through the door' },
        ].map(({ label, href, desc }) => (
          <Link key={href} href={href}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 transition-colors">
            <div className="font-montserrat font-bold text-white text-sm mb-1">{label}</div>
            <div className="text-zinc-500 text-xs">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Member View redirect ───────────────────────────────────────────────────────
function MemberViewPrompt() {
  const { impersonatedMemberId, impersonatedMemberName } = useView()
  const router = useRouter()

  useEffect(() => {
    if (impersonatedMemberId) {
      router.push(`/coach/member-view/${impersonatedMemberId}`)
    }
  }, [impersonatedMemberId, router])

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle size={40} className="text-green-400 mb-4" />
      <h1 className="font-montserrat font-black text-2xl uppercase tracking-tight mb-2">Select a Member</h1>
      <p className="text-zinc-400 text-sm max-w-sm mb-6">
        Choose a member from the Members list to view the portal exactly as they see it.
      </p>
      <Link href="/coach/members"
        className="bg-white text-black font-montserrat font-bold text-sm uppercase tracking-widest px-8 py-3 hover:bg-white/90 transition-colors">
        Browse Members →
      </Link>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CoachDashboardPage() {
  const { mode } = useView()
  if (mode === 'manager') return <ManagerDashboard />
  if (mode === 'member')  return <MemberViewPrompt />
  return <CoachDashboard />
}

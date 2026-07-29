'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, Users, Map, GitBranch,
  ChevronLeft, ShieldCheck, Dumbbell, UserCircle, X, UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewProvider, useView, type ViewMode } from './view-context'

const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/coach',           icon: LayoutDashboard },
  { label: 'Schedule',   href: '/coach/schedule',  icon: Calendar },
  { label: 'Members',    href: '/coach/members',   icon: Users },
  { label: 'Member Map', href: '/coach/map',        icon: Map },
  { label: 'Referrals',  href: '/coach/referrals', icon: GitBranch },
]

type ModeConfig = { label: string; icon: typeof ShieldCheck; color: string; bg: string; border: string; adminOnly?: boolean }

const MODE_CONFIG: Record<ViewMode, ModeConfig> = {
  manager:    { label: 'Manager',     icon: ShieldCheck, color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/30' },
  coach:      { label: 'Coach',       icon: Dumbbell,    color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30'  },
  member:     { label: 'Member',      icon: UserCircle,  color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'coach-view': { label: 'View as Coach', icon: UserCog, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', adminOnly: true },
}

function SidebarInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isAdmin = process.env.NODE_ENV === 'development' || (session?.user as any)?.role === 'ADMIN'

  const {
    mode, setMode,
    impersonatedMemberId, impersonatedMemberName, impersonateMember,
    impersonatedCoachId, impersonatedCoachName, impersonateCoach,
    clearImpersonation,
  } = useView()

  const pathname = usePathname()
  const router = useRouter()
  const cfg = MODE_CONFIG[mode]

  // Staff list for coach picker (admin only)
  const [staffList, setStaffList] = useState<{ id: string; firstName: string; lastName: string; title: string | null }[]>([])
  const [showCoachPicker, setShowCoachPicker] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/coach/staff').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setStaffList(data)
      })
    }
  }, [isAdmin])

  const handleModeChange = (m: ViewMode) => {
    if (m === 'member' && !impersonatedMemberId) {
      router.push('/coach/members')
      return
    }
    if (m === 'coach-view') {
      if (!impersonatedCoachId) {
        setShowCoachPicker(true)
        return
      }
      setMode('coach-view')
      router.push(`/coach/coach-view/${impersonatedCoachId}`)
      return
    }
    setShowCoachPicker(false)
    setMode(m)
    if (m !== 'member') router.push('/coach')
  }

  const selectCoach = (id: string, name: string) => {
    impersonateCoach(id, name)
    setShowCoachPicker(false)
    router.push(`/coach/coach-view/${id}`)
  }

  const visibleModes = (Object.entries(MODE_CONFIG) as [ViewMode, ModeConfig][])
    .filter(([, c]) => !c.adminOnly || isAdmin)

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">

        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
          <span className="font-montserrat font-bold text-sm tracking-widest uppercase">
            HB<span className="text-amber-400">FIT</span>
          </span>
          <span className="font-montserrat text-xs text-zinc-500 tracking-widest uppercase ml-1">Portal</span>
        </div>

        {/* View switcher */}
        <div className="px-3 pt-4 pb-3 border-b border-zinc-800">
          <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-600 mb-2 px-1">View As</p>
          <div className="space-y-1">
            {visibleModes.map(([m, c]) => {
              const Icon = c.icon
              const active = mode === m
              return (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm font-montserrat font-semibold tracking-wide transition-colors border',
                    active
                      ? `${c.bg} ${c.color} ${c.border}`
                      : 'bg-transparent text-zinc-500 border-transparent hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <Icon size={15} />
                  {c.label}
                  {m === 'member' && impersonatedMemberId && active && (
                    <span className="ml-auto text-xs text-green-300/70 font-normal truncate max-w-[80px]">
                      {impersonatedMemberName?.split(' ')[0]}
                    </span>
                  )}
                  {m === 'coach-view' && impersonatedCoachId && active && (
                    <span className="ml-auto text-xs text-purple-300/70 font-normal truncate max-w-[80px]">
                      {impersonatedCoachName?.split(' ')[0]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Coach picker dropdown (admin only) */}
          {showCoachPicker && isAdmin && (
            <div className="mt-2 border border-purple-400/30 bg-zinc-900">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                <span className="text-purple-400 text-xs font-montserrat font-bold uppercase tracking-wide">Select a Coach</span>
                <button onClick={() => setShowCoachPicker(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
              {staffList.length === 0 ? (
                <p className="text-zinc-600 text-xs px-3 py-3 font-montserrat">No active coaches found.</p>
              ) : (
                staffList.map(s => (
                  <button
                    key={s.id}
                    onClick={() => selectCoach(s.id, `${s.firstName} ${s.lastName}`)}
                    className="w-full text-left px-3 py-2 text-xs font-montserrat text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-between"
                  >
                    <span>{s.firstName} {s.lastName}</span>
                    {s.title && <span className="text-zinc-600 text-[10px]">{s.title}</span>}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Member impersonation banner */}
          {mode === 'member' && impersonatedMemberId && (
            <div className="mt-2 flex items-center justify-between bg-green-400/5 border border-green-400/20 px-3 py-2">
              <div>
                <p className="text-green-400 text-xs font-montserrat font-bold uppercase tracking-wide">Viewing as</p>
                <p className="text-white text-xs font-montserrat">{impersonatedMemberName}</p>
              </div>
              <button onClick={clearImpersonation} className="text-zinc-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Coach impersonation banner */}
          {mode === 'coach-view' && impersonatedCoachId && (
            <div className="mt-2 flex items-center justify-between bg-purple-400/5 border border-purple-400/20 px-3 py-2">
              <div>
                <p className="text-purple-400 text-xs font-montserrat font-bold uppercase tracking-wide">Viewing as Coach</p>
                <p className="text-white text-xs font-montserrat">{impersonatedCoachName}</p>
              </div>
              <button onClick={clearImpersonation} className="text-zinc-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Nav — standard coach/manager nav */}
        {(mode === 'manager' || mode === 'coach') && (
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/coach' && pathname.startsWith(href))
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                    active
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  )}>
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Member view nav */}
        {mode === 'member' && (
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {[
              { label: 'Dashboard',   href: `/coach/member-view/${impersonatedMemberId}` },
              { label: 'Check-ins',   href: `/coach/member-view/${impersonatedMemberId}/checkins` },
              { label: 'Goals',       href: `/coach/member-view/${impersonatedMemberId}/goals` },
              { label: 'Settings',    href: `/coach/member-view/${impersonatedMemberId}/settings` },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                  pathname === href ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                )}>
                {label}
              </Link>
            ))}
            <div className="pt-3">
              <button onClick={clearImpersonation}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-montserrat uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                <ChevronLeft size={12} /> Back to Coach View
              </button>
            </div>
          </nav>
        )}

        {/* Coach-view nav — mirrors the real coach portal nav */}
        {mode === 'coach-view' && (
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {[
              { label: 'Dashboard',  href: `/coach/coach-view/${impersonatedCoachId}` },
              { label: 'Schedule',   href: `/coach/coach-view/${impersonatedCoachId}/schedule` },
              { label: 'Members',    href: `/coach/coach-view/${impersonatedCoachId}/members` },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                  pathname === href ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                )}>
                {label}
              </Link>
            ))}
            <div className="pt-3">
              <button onClick={clearImpersonation}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-montserrat uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                <ChevronLeft size={12} /> Back to My View
              </button>
            </div>
          </nav>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 space-y-2">
          <Link href="/admin" className="text-xs text-zinc-600 hover:text-zinc-400 font-montserrat transition-colors block">
            Admin Panel
          </Link>
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 font-montserrat transition-colors flex items-center gap-1">
            <ChevronLeft size={11} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-black">{children}</main>
    </div>
  )
}

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewProvider>
      <SidebarInner>{children}</SidebarInner>
    </ViewProvider>
  )
}

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Calendar, Users, Map, GitBranch,
  ChevronLeft, ShieldCheck, Dumbbell, UserCircle, X, UserCog, CalendarDays, MessageSquare,
  ScanLine, CreditCard, BarChart3, Menu, Crosshair,
} from 'lucide-react'
import { HBFITMark } from '@/components/HBFITMark'
import { cn } from '@/lib/utils'
import { ViewProvider, useView, type ViewMode } from './view-context'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/coach',              icon: LayoutDashboard },
  { label: 'Schedule',     href: '/coach/schedule',     icon: Calendar },
  { label: 'Events',       href: '/coach/events',       icon: CalendarDays },
  { label: 'Members',      href: '/coach/members',      icon: Users },
  { label: 'Member Map',   href: '/coach/map',          icon: Map },
  { label: 'Referrals',    href: '/coach/referrals',    icon: GitBranch },
  { label: 'Messages',     href: '/coach/messages',     icon: MessageSquare },
  { label: 'Event Leads',  href: '/coach/event-leads',  icon: Crosshair },
  { label: 'Billing',      href: '/admin/billing',      icon: CreditCard },
]

const ADMIN_NAV_ITEMS = [
  { label: 'Check-in',      href: '/admin/checkin',  icon: ScanLine },
  { label: 'GAP Approvals', href: '/admin/gap',       icon: ShieldCheck },
  { label: 'Reports',       href: '/admin/reports',  icon: BarChart3 },
]

type ModeConfig = { label: string; icon: typeof ShieldCheck; color: string; bg: string; border: string; adminOnly?: boolean }

const MODE_CONFIG: Record<ViewMode, ModeConfig> = {
  manager:      { label: 'Manager',        icon: ShieldCheck, color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/30' },
  coach:        { label: 'Coach',          icon: Dumbbell,    color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30'  },
  member:       { label: 'Member',         icon: UserCircle,  color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'coach-view': { label: 'View as Coach',  icon: UserCog,     color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', adminOnly: true },
}

function SidebarInner({ children }: { children: React.ReactNode }) {
  const [myRole, setMyRole] = useState<string | null>(null)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setMyRole(d?.user?.role ?? null)).catch(() => {})
  }, [])

  useEffect(() => {
    const load = () => {
      Promise.all([
        fetch('/api/coach/messages').then(r => r.json()).catch(() => ({ unreadCount: 0 })),
        fetch('/api/admin/messages/contact').then(r => r.json()).catch(() => ({ unreadCount: 0 })),
      ]).then(([threads, contacts]) => {
        setUnreadMessages((threads?.unreadCount ?? 0) + (contacts?.unreadCount ?? 0));
      });
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    navigator.serviceWorker.ready.then(async reg => {
      try {
        const existing = await reg.pushManager.getSubscription()
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, keys: { p256dh: sub.toJSON().keys?.p256dh, auth: sub.toJSON().keys?.auth } }),
        })
      } catch { /* denied or unsupported */ }
    }).catch(() => {})
  }, [])

  const isAdmin = myRole === 'ADMIN'

  const {
    mode, setMode,
    impersonatedMemberId, impersonatedMemberName, impersonateMember,
    impersonatedCoachId, impersonatedCoachName, impersonateCoach,
    clearImpersonation,
  } = useView()

  const pathname = usePathname()
  const router = useRouter()
  const cfg = MODE_CONFIG[mode]

  const [staffList, setStaffList] = useState<{ id: string; firstName: string; lastName: string; title: string | null }[]>([])
  const [showCoachPicker, setShowCoachPicker] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/coach/staff').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setStaffList(data)
      })
    }
  }, [isAdmin])

  const closeSidebar = () => setSidebarOpen(false)

  const handleModeChange = (m: ViewMode) => {
    if (m === 'member' && !impersonatedMemberId) {
      router.push('/coach/members')
      closeSidebar()
      return
    }
    if (m === 'coach-view') {
      if (!impersonatedCoachId) {
        setShowCoachPicker(true)
        return
      }
      setMode('coach-view')
      router.push(`/coach/coach-view/${impersonatedCoachId}`)
      closeSidebar()
      return
    }
    setShowCoachPicker(false)
    setMode(m)
    if (m !== 'member') router.push('/coach')
    closeSidebar()
  }

  const selectCoach = (id: string, name: string) => {
    impersonateCoach(id, name)
    setShowCoachPicker(false)
    router.push(`/coach/coach-view/${id}`)
    closeSidebar()
  }

  const visibleModes = (Object.entries(MODE_CONFIG) as [ViewMode, ModeConfig][])
    .filter(([, c]) => !c.adminOnly || isAdmin)

  const sidebarContent = (
    <aside className={cn(
      'w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col',
      // On mobile: fixed full-height drawer; on desktop: normal sidebar
      'fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
        <HBFITMark className="font-montserrat font-bold text-sm tracking-widest uppercase" suffix=" Portal" />
        {/* Close button — mobile only */}
        <button onClick={closeSidebar} className="lg:hidden text-zinc-500 hover:text-white transition-colors p-1">
          <X size={18} />
        </button>
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

        {/* Coach picker */}
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

      {/* Nav */}
      {(mode === 'manager' || mode === 'coach') && (
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.filter(item => item.href !== '/coach/map' || mode === 'manager').map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/coach' && pathname.startsWith(href))
            const badge = label === 'Messages' && unreadMessages > 0 ? unreadMessages : 0
            return (
              <Link key={href} href={href} onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                  active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                )}>
                <Icon size={16} />
                {label}
                {badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            )
          })}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-600">Admin</p>
              </div>
              {ADMIN_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link key={href} href={href} onClick={closeSidebar}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                      active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    )}>
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      )}

      {/* Member view nav */}
      {mode === 'member' && (
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { label: 'Dashboard', href: `/coach/member-view/${impersonatedMemberId}` },
            { label: 'Check-ins', href: `/coach/member-view/${impersonatedMemberId}/checkins` },
            { label: 'Goals',     href: `/coach/member-view/${impersonatedMemberId}/goals` },
            { label: 'Settings',  href: `/coach/member-view/${impersonatedMemberId}/settings` },
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                pathname === href ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              )}>
              {label}
            </Link>
          ))}
          <div className="pt-3">
            <button onClick={() => { clearImpersonation(); closeSidebar() }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-montserrat uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
              <ChevronLeft size={12} /> Back to Coach View
            </button>
          </div>
        </nav>
      )}

      {/* Coach-view nav */}
      {mode === 'coach-view' && (
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { label: 'Dashboard', href: `/coach/coach-view/${impersonatedCoachId}` },
            { label: 'Schedule',  href: `/coach/schedule` },
            { label: 'Members',   href: `/coach/members` },
          ].map(({ label, href }) => (
            <Link key={label} href={href} onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-montserrat font-semibold tracking-wide transition-colors',
                pathname === href ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              )}>
              {label}
            </Link>
          ))}
          <div className="pt-3">
            <button onClick={() => { clearImpersonation(); closeSidebar() }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-montserrat uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
              <ChevronLeft size={12} /> Back to My View
            </button>
          </div>
        </nav>
      )}

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-800 space-y-2">
        <Link href="/" onClick={closeSidebar} className="text-xs text-zinc-600 hover:text-zinc-400 font-montserrat transition-colors flex items-center gap-1">
          <ChevronLeft size={11} /> Back to Site
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-black text-white">
      {sidebarContent}

      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-black min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <HBFITMark className="font-montserrat font-bold text-sm tracking-widest uppercase" suffix=" Portal" />
          {unreadMessages > 0 && (
            <Link href="/coach/messages" className="ml-auto relative">
              <MessageSquare size={20} className="text-zinc-400" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            </Link>
          )}
        </div>

        {/* Unread messages banner — desktop */}
        {unreadMessages > 0 && pathname !== '/coach/messages' && (
          <Link href="/coach/messages"
            className="hidden lg:flex items-center gap-3 px-6 py-3 bg-blue-600/20 border-b border-blue-500/30 hover:bg-blue-600/30 transition-colors group">
            <MessageSquare size={16} className="text-blue-400 shrink-0" />
            <span className="font-montserrat text-sm text-blue-300 font-semibold">
              You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''} from members
            </span>
            <span className="ml-auto font-montserrat text-xs text-blue-400 group-hover:text-white transition-colors">View →</span>
          </Link>
        )}

        {children}
      </main>
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

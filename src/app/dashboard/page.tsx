'use client';

import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  History,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MEMBER = {
  firstName:  'Randy',
  lastName:   'Franklin',
  plan:       'Individual Membership',
  status:     'Active',
  lastCheckIn: 'Jul 20, 2026 — 6:14 AM',
};

const UPCOMING_CLASSES = [
  { id: 1, name: 'Power Hour HIIT',        day: 'Mon, Jul 21', time: '6:00 AM', instructor: 'Coach Dre'     },
  { id: 2, name: 'Strength & Conditioning', day: 'Wed, Jul 23', time: '5:30 AM', instructor: 'Coach Keisha' },
  { id: 3, name: 'Weekend Warrior',         day: 'Sat, Jul 26', time: '8:00 AM', instructor: 'Coach Marcus' },
];

const RECENT_ACTIVITY = [
  { id: 1, label: 'Checked in — Power Hour HIIT',         date: 'Jul 20, 2026 6:14 AM'  },
  { id: 2, label: 'Checked in — Strength & Conditioning', date: 'Jul 18, 2026 5:35 AM'  },
  { id: 3, label: 'Logged progress entry',                date: 'Jul 17, 2026 7:02 AM'  },
  { id: 4, label: 'Checked in — Weekend Warrior',         date: 'Jul 14, 2026 8:05 AM'  },
  { id: 5, label: 'Checked in — Power Hour HIIT',         date: 'Jul 13, 2026 6:18 AM'  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Top nav ── */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat text-xl font-black tracking-widest uppercase text-white">
          Honor Bound <span className="text-red-500">FIT</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Member Portal</span>
          <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center font-montserrat font-bold text-sm">
            {MEMBER.firstName[0]}{MEMBER.lastName[0]}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        {/* ── Welcome heading ── */}
        <div>
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
            Welcome back, {MEMBER.firstName}.
          </h1>
          <p className="mt-1 text-zinc-400 text-sm">Here&apos;s your fitness summary.</p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Membership */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <CreditCard size={14} />
              Membership
            </div>
            <p className="font-montserrat font-bold text-lg">{MEMBER.plan}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={12} /> {MEMBER.status}
            </span>
          </div>

          {/* Last check-in */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <CheckCircle2 size={14} />
              Last Check‑In
            </div>
            <p className="font-montserrat font-bold text-lg leading-tight">{MEMBER.lastCheckIn}</p>
          </div>

          {/* Classes this month */}
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <Dumbbell size={14} />
              Classes This Month
            </div>
            <p className="font-montserrat font-bold text-4xl">14</p>
            <p className="text-zinc-500 text-xs">Personal best: 18 (Mar)</p>
          </div>
        </div>

        {/* ── Upcoming bookings ── */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-red-500" />
            Upcoming Classes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {UPCOMING_CLASSES.map((cls) => (
              <div key={cls.id} className="rounded-xl bg-zinc-900 border border-zinc-700 p-5">
                <p className="font-montserrat font-bold">{cls.name}</p>
                <p className="text-zinc-400 text-sm mt-1">{cls.day}</p>
                <p className="text-zinc-400 text-sm">{cls.time}</p>
                <p className="text-zinc-500 text-xs mt-2">{cls.instructor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider"
            >
              <CalendarDays size={16} />
              Book a Class
            </Link>
            <Link
              href="/dashboard/progress"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider"
            >
              <TrendingUp size={16} />
              Log Progress
            </Link>
            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider"
            >
              <History size={16} />
              View History
            </Link>
          </div>
        </section>

        {/* ── Recent activity ── */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={18} className="text-red-500" />
            Recent Activity
          </h2>
          <ul className="divide-y divide-zinc-800 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden">
            {RECENT_ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-white">{item.label}</span>
                <span className="text-xs text-zinc-500 ml-4 whitespace-nowrap">{item.date}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays, CheckCircle2, CreditCard, Dumbbell,
  History, TrendingUp, Trophy, Bell, BellOff, ClipboardList, Settings,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface JourneyCheckIn {
  id: string;
  type: string;
  scheduledDate: string;
  memberCompletedAt: string | null;
  coachCompletedAt: string | null;
}

interface Milestone {
  id: string;
  title: string;
  type: string;
  achievedAt: string;
  unit: string | null;
  targetValue: number | null;
}

const TYPE_LABEL: Record<string, string> = {
  DAY1: "Day 1", DAY30: "Day 30", DAY60: "Day 60", DAY90: "Day 90",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { permission, subscribed, loading: pushLoading, subscribe, unsubscribe } = usePushNotifications();

  const [checkIns, setCheckIns] = useState<JourneyCheckIn[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [baselinePending, setBaselinePending] = useState(false);
  const [hasPin, setHasPin] = useState(true);

  const firstName = session?.user?.name?.split(" ")[0] ?? "Soldier";

  useEffect(() => {
    // Check onboarding status
    fetch("/api/member/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.completedAt) setOnboardingDone(false);
      })
      .catch(() => {});

    // Check PIN status
    fetch("/api/member/pin")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.hasPin === false) setHasPin(false);
      })
      .catch(() => {});

    // Load check-ins
    fetch("/api/member/checkins")
      .then((r) => r.json())
      .then((data: JourneyCheckIn[]) => {
        if (Array.isArray(data)) setCheckIns(data);
      })
      .catch(() => {});

    // Load milestones
    fetch("/api/member/milestones")
      .then((r) => r.json())
      .then((data: Milestone[]) => {
        if (Array.isArray(data)) setMilestones(data.slice(0, 5));
      })
      .catch(() => {});

    // Check if baseline assessment exists
    fetch("/api/member/core-metrics?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length === 0) setBaselinePending(true);
      })
      .catch(() => {});
  }, []);

  // Pending = scheduled, not yet member-completed, date is today or past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingCheckIns = checkIns.filter(
    (ci) => !ci.memberCompletedAt && new Date(ci.scheduledDate) <= new Date()
  );
  const nextCheckIn = checkIns.find((ci) => !ci.memberCompletedAt && new Date(ci.scheduledDate) > new Date());

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat text-xl font-black tracking-widest uppercase text-white">
          Honor Bound <span className="text-red-500">FIT</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Member Portal</span>
          {session?.user?.name && (
            <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center font-montserrat font-bold text-sm">
              {session.user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">

        {/* Welcome */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-1 text-zinc-400 text-sm">Here&apos;s your mission status.</p>
          </div>

          {/* Push notification toggle */}
          {permission !== "unsupported" && permission !== "denied" && (
            <button
              onClick={subscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-montserrat font-bold transition-colors disabled:opacity-50 ${
                subscribed
                  ? "border-emerald-700 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40"
                  : "border-zinc-700 text-zinc-400 bg-zinc-900 hover:border-zinc-500"
              }`}
            >
              {subscribed ? <Bell size={14} /> : <BellOff size={14} />}
              {subscribed ? "Notifications On" : "Enable Notifications"}
            </button>
          )}
        </div>

        {/* Onboarding banner */}
        {!onboardingDone && (
          <div className="bg-red-950/40 border border-red-800 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-red-400 uppercase tracking-wider text-sm">
                Complete Your Briefing
              </p>
              <p className="text-zinc-400 text-sm mt-1">
                Finish your 90-day onboarding so your coaches know how to best support you.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Start Briefing
            </Link>
          </div>
        )}

        {/* PIN setup banner */}
        {!hasPin && onboardingDone && (
          <div className="bg-zinc-900 border border-zinc-600 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-zinc-300 uppercase tracking-wider text-sm">
                Set Up Your Kiosk PIN
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Set up your kiosk PIN to check in and shop at the front desk.
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Set PIN →
            </Link>
          </div>
        )}

        {/* Baseline assessment pending */}
        {baselinePending && onboardingDone && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-zinc-300 uppercase tracking-wider text-sm">
                Baseline Assessment Pending
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Your coach will schedule your baseline metrics session once you&apos;ve learned the movements — usually within your first 1–2 weeks.
              </p>
            </div>
            <Link
              href="/dashboard/progress"
              className="shrink-0 text-zinc-400 hover:text-white text-xs font-montserrat font-bold transition-colors whitespace-nowrap"
            >
              View Progress →
            </Link>
          </div>
        )}

        {/* Pending check-ins */}
        {pendingCheckIns.length > 0 && (
          <section>
            <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
              <ClipboardList size={14} className="text-red-500" /> Action Required
            </h2>
            <div className="space-y-3">
              {pendingCheckIns.map((ci) => (
                <div key={ci.id} className="bg-zinc-900 border border-yellow-700/60 rounded-xl px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-montserrat font-bold text-yellow-400">
                      {TYPE_LABEL[ci.type] ?? ci.type} Check‑In Ready
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Scheduled {new Date(ci.scheduledDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/checkin/${ci.id}`}
                    className="shrink-0 bg-yellow-600 hover:bg-yellow-500 text-white font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Complete
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <CreditCard size={14} /> Membership
            </div>
            <p className="font-montserrat font-bold text-lg">Active</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={12} /> In Good Standing
            </span>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <CalendarDays size={14} /> Next Check‑In
            </div>
            {nextCheckIn ? (
              <>
                <p className="font-montserrat font-bold text-lg">
                  {TYPE_LABEL[nextCheckIn.type]}
                </p>
                <p className="text-zinc-500 text-xs">
                  {new Date(nextCheckIn.scheduledDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })}
                </p>
              </>
            ) : (
              <p className="text-zinc-500 text-sm">All check-ins complete 🎖️</p>
            )}
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest font-montserrat">
              <Trophy size={14} /> Milestones
            </div>
            <p className="font-montserrat font-bold text-4xl">{milestones.length}</p>
            <p className="text-zinc-500 text-xs">Achieved so far</p>
          </div>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/schedule"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <CalendarDays size={16} /> Book a Class
            </Link>
            <Link href="/dashboard/progress"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <TrendingUp size={16} /> Log Progress
            </Link>
            <Link href="/dashboard/goals"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <Trophy size={16} /> My Goals
            </Link>
            <Link href="/dashboard/history"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <History size={16} /> View History
            </Link>
            <Link href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <Settings size={16} /> Settings
            </Link>
          </div>
        </section>

        {/* Milestones */}
        {milestones.length > 0 && (
          <section>
            <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" /> Recent Milestones
            </h2>
            <ul className="divide-y divide-zinc-800 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-white">{m.title}</span>
                  <span className="text-xs text-zinc-500 ml-4 whitespace-nowrap">
                    {new Date(m.achievedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 90-day journey progress */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <Dumbbell size={18} className="text-red-500" /> 90-Day Journey
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {checkIns.map((ci) => (
              <div
                key={ci.id}
                className={`rounded-xl border p-4 flex flex-col gap-2 ${
                  ci.memberCompletedAt
                    ? "bg-emerald-900/20 border-emerald-700/60"
                    : new Date(ci.scheduledDate) <= new Date()
                    ? "bg-yellow-900/20 border-yellow-700/60"
                    : "bg-zinc-900 border-zinc-700"
                }`}
              >
                <span className="font-montserrat font-bold text-sm">
                  {TYPE_LABEL[ci.type] ?? ci.type}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(ci.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {ci.memberCompletedAt ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Complete
                  </span>
                ) : new Date(ci.scheduledDate) <= new Date() ? (
                  <Link href={`/dashboard/checkin/${ci.id}`} className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors">
                    Due now →
                  </Link>
                ) : (
                  <span className="text-xs text-zinc-600">Upcoming</span>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

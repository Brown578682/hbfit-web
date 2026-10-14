"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays, CheckCircle2, CreditCard, Dumbbell,
  History, TrendingUp, Trophy, Bell, BellOff, ClipboardList, Settings, MessageSquare,
  Clock, MapPin, Users,
} from "lucide-react";
import { HBFITMark, HBFITWordmark } from "@/components/HBFITMark";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { MemberAvatar } from "@/components/MemberAvatar";

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

interface UpcomingClass {
  bookingId: string;
  status: string;
  waitlistPosition: number | null;
  sessionId: string;
  startTime: string;
  endTime: string;
  className: string;
  capacity: number;
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
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [baselinePending, setBaselinePending] = useState(false);
  const [hasPin, setHasPin] = useState(true);
  const [billingStatus, setBillingStatus] = useState<{
    needsPaymentMethod: boolean;
    needsPlan: boolean;
    billingStartDate: string | null;
    plan: string | null;
  } | null>(null);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  const [memberPhotoUrl, setMemberPhotoUrl] = useState<string | null>(null);
  const [classCredits, setClassCredits] = useState<number | null>(null);

  const firstName = session?.user?.name?.split(" ")[0] ?? "Warrior";

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

    // Check billing status (for migrated members without a payment method)
    fetch("/api/member/billing-status")
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.needsPaymentMethod || data.needsPlan)) setBillingStatus(data);
      })
      .catch(() => {});

    // Load member photo
    fetch("/api/member/photo")
      .then(r => r.ok ? r.json() : null)
      .then((data) => { if (data?.photoUrl) setMemberPhotoUrl(data.photoUrl); })
      .catch(() => {});

    fetch("/api/me")
      .then(r => r.ok ? r.json() : null)
      .then((data) => { if (typeof data?.user?.classCredits === 'number') setClassCredits(data.user.classCredits); })
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

    // Load upcoming booked classes (next 14 days)
    fetch("/api/classes/upcoming")
      .then((r) => r.json())
      .then((data: UpcomingClass[]) => {
        if (Array.isArray(data)) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() + 14);
          setUpcomingClasses(data.filter(c => new Date(c.startTime) <= cutoff));
        }
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

  async function handleAddPaymentMethod() {
    setBillingPortalLoading(true);
    try {
      const res = await fetch('/api/member/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'payment_method' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // fail silently — portal link is also in Settings
    } finally {
      setBillingPortalLoading(false);
    }
  }
  const pendingCheckIns = checkIns.filter(
    (ci) => !ci.memberCompletedAt && new Date(ci.scheduledDate) <= new Date()
  );
  const nextCheckIn = checkIns.find((ci) => !ci.memberCompletedAt && new Date(ci.scheduledDate) > new Date());

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-montserrat text-xl font-black tracking-widest uppercase text-white">
          <HBFITWordmark />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Member Portal</span>
          {session?.user?.name && (
            <Link href="/dashboard/settings">
              <MemberAvatar photoUrl={memberPhotoUrl} name={session.user.name} size={32} />
            </Link>
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

        {/* Trial expired / no plan banner */}
        {billingStatus?.needsPlan && (
          <div className="bg-amber-950/40 border border-amber-600 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-amber-400 uppercase tracking-wider text-sm">
                ⚠ Trial Expired — Select a Plan
              </p>
              <p className="text-zinc-400 text-sm mt-1">
                Your trial access has ended. Choose a membership plan to keep training with us.
              </p>
            </div>
            <a
              href="/join"
              className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Select a Plan →
            </a>
          </div>
        )}

        {/* Payment method required banner — shown to migrated members with no card on file */}
        {billingStatus?.needsPaymentMethod && (
          <div className="bg-red-950/40 border border-red-700 rounded-xl px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-montserrat font-bold text-red-400 uppercase tracking-wider text-sm">
                ⚠ Action Required: Add Payment Method
              </p>
              <p className="text-zinc-400 text-sm mt-1">
                {billingStatus.plan && <>Your <strong className="text-white">{billingStatus.plan}</strong> membership </>}
                {billingStatus.billingStartDate
                  ? <>bills on <strong className="text-white">{new Date(billingStatus.billingStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>. </>
                  : <>will renew soon. </>
                }
                Add a card now to avoid any interruption.
              </p>
            </div>
            <button
              onClick={handleAddPaymentMethod}
              disabled={billingPortalLoading}
              className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {billingPortalLoading ? 'Loading…' : 'Add Card →'}
            </button>
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

        {/* ── Class Credits ─────────────────────────────────────────────────── */}
        {classCredits !== null && classCredits > 0 && (
          <section>
            <div className="flex items-center justify-between border border-amber-700/50 bg-amber-950/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-600/20 flex items-center justify-center text-amber-400 font-montserrat font-black text-lg">
                  {classCredits}
                </div>
                <div>
                  <p className="font-montserrat font-bold text-amber-300 text-sm uppercase tracking-wider">Class Credit{classCredits !== 1 ? "s" : ""}</p>
                  <p className="text-amber-200/50 text-xs">Used automatically when you book a class</p>
                </div>
              </div>
              <Link href="/drop-in" className="text-amber-400 hover:text-amber-300 text-xs font-bold font-montserrat uppercase tracking-wider transition-colors">
                Buy More →
              </Link>
            </div>
          </section>
        )}

        {/* ── Upcoming Schedule ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-red-500" /> Your Schedule
            <span className="text-zinc-600 font-normal text-xs normal-case tracking-normal">— next 14 days</span>
          </h2>

          {upcomingClasses.length === 0 ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-700 px-6 py-8 text-center">
              <p className="text-zinc-500 text-sm">No classes booked in the next 14 days.</p>
              <Link href="/schedule" className="mt-3 inline-flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-montserrat font-bold transition-colors">
                <CalendarDays size={14} /> Book a Class →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingClasses.map((c) => {
                const start = new Date(c.startTime);
                const end = new Date(c.endTime);
                const isToday = start.toDateString() === new Date().toDateString();
                const isTomorrow = start.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/New_York" });
                const timeLabel = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
                const endLabel = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" });
                const isWaitlisted = c.status === "WAITLISTED";
                const isConfirming = confirmCancelId === c.bookingId;
                const isCancelling = cancellingId === c.bookingId;

                return (
                  <li key={c.bookingId} className={`rounded-xl border px-5 py-4 transition-colors ${isWaitlisted ? "bg-zinc-900 border-yellow-700/50" : "bg-zinc-900 border-zinc-700"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Date block */}
                        <div className={`shrink-0 w-14 text-center rounded-lg py-2 ${isToday ? "bg-red-600" : "bg-zinc-800"}`}>
                          <p className="font-montserrat font-black text-xs uppercase tracking-wider leading-none">
                            {isToday ? "Today" : isTomorrow ? "Tmrw" : start.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" })}
                          </p>
                          <p className="font-montserrat font-bold text-lg leading-tight">
                            {start.toLocaleDateString("en-US", { day: "numeric", timeZone: "America/New_York" })}
                          </p>
                        </div>
                        {/* Class info */}
                        <div className="min-w-0">
                          <p className="font-montserrat font-bold text-white text-sm truncate">{c.className}</p>
                          <p className="text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {timeLabel} – {endLabel}
                          </p>
                          {!isToday && !isTomorrow && (
                            <p className="text-zinc-600 text-xs mt-0.5">{dayLabel}</p>
                          )}
                        </div>
                      </div>
                      {/* Status + cancel */}
                      <div className="shrink-0 text-right flex flex-col items-end gap-2">
                        {isWaitlisted ? (
                          <span className="text-xs font-montserrat font-bold text-yellow-400 uppercase tracking-wider">
                            Waitlist #{c.waitlistPosition}
                          </span>
                        ) : (
                          <span className="text-xs font-montserrat font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={12} /> Confirmed
                          </span>
                        )}
                        {!isConfirming && (
                          <button
                            onClick={() => setConfirmCancelId(c.bookingId)}
                            className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Confirm cancel row */}
                    {isConfirming && (
                      <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center justify-between gap-3">
                        <p className="text-zinc-400 text-xs">Cancel this booking?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-zinc-700"
                          >
                            Keep it
                          </button>
                          <button
                            disabled={isCancelling}
                            onClick={async () => {
                              setCancellingId(c.bookingId);
                              try {
                                const res = await fetch("/api/classes/cancel", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ bookingId: c.bookingId }),
                                });
                                if (res.ok) {
                                  setUpcomingClasses(prev => prev.filter(x => x.bookingId !== c.bookingId));
                                }
                              } finally {
                                setCancellingId(null);
                                setConfirmCancelId(null);
                              }
                            }}
                            className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            {isCancelling ? "Cancelling…" : "Yes, cancel"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

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
            <Link href="/dashboard/messages"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-5 py-3 font-montserrat font-bold text-sm uppercase tracking-wider">
              <MessageSquare size={16} /> Messages
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

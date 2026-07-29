export const dynamic = 'force-dynamic';
import Link from "next/link";
import {
  Users,
  Activity,
  DollarSign,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ── Data Fetching ───────────────────────────────────────────────────────────────

async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalActiveMembers,
    pendingGapCount,
    checkInsToday,
    pendingMembers,
    recentCheckIns,
  ] = await Promise.all([
    prisma.member.count({ where: { status: MemberStatus.ACTIVE } }),
    prisma.member.count({
      where: { gapEligible: true, status: MemberStatus.PENDING },
    }),
    prisma.checkIn.count({
      where: { checkedAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.member.findMany({
      where: { status: MemberStatus.PENDING },
      include: {
        memberships: {
          where: { status: "ACTIVE" },
          include: { plan: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { joinedAt: "asc" },
      take: 5,
    }),
    prisma.checkIn.findMany({
      take: 10,
      orderBy: { checkedAt: "desc" },
      include: {
        member: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  return {
    totalActiveMembers,
    pendingGapCount,
    checkInsToday,
    pendingMembers,
    recentCheckIns,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const {
    totalActiveMembers,
    pendingGapCount,
    checkInsToday,
    pendingMembers,
    recentCheckIns,
  } = await getDashboardData();

  const STATS = [
    {
      label: "Total Members",
      value: totalActiveMembers.toString(),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Pending GAP",
      value: pendingGapCount.toString(),
      icon: ShieldCheck,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Revenue (4-wk)",
      value: "See Billing",
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Check-ins Today",
      value: checkInsToday.toString(),
      icon: ScanLine,
      color: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  const QUICK_LINKS = [
    {
      label: "Manage Members",
      href: "/admin/members",
      icon: Users,
      desc: "View, add, and edit member profiles",
    },
    {
      label: "Check-in Kiosk",
      href: "/admin/checkin",
      icon: ScanLine,
      desc: "Open the member check-in station",
    },
    {
      label: "GAP Approvals",
      href: "/admin/gap",
      icon: ShieldCheck,
      desc: "Review and approve GAP applications",
    },
    {
      label: "Billing",
      href: "/admin/billing",
      icon: DollarSign,
      desc: "Subscriptions, revenue & payments",
    },
  ];

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">
          Dashboard
        </h1>
        <p className="font-lora text-zinc-400 mt-1">
          Welcome back — here&apos;s what&apos;s happening at Honor Bound FIT
          today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-zinc-900 rounded-xl p-5 border border-zinc-800"
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-4`}
            >
              <Icon className={color} size={20} />
            </div>
            <p className="font-montserrat font-bold text-2xl text-white">
              {value}
            </p>
            <p className="font-lora text-zinc-400 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Needing Attention */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="text-yellow-400" size={18} />
            <h2 className="font-montserrat font-bold text-base text-white tracking-wide">
              Needs Attention
            </h2>
            <span className="ml-auto bg-yellow-400/10 text-yellow-400 text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">
              {pendingMembers.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingMembers.length === 0 ? (
              <p className="font-lora text-sm text-zinc-500 py-4 text-center">
                No pending members — all caught up!
              </p>
            ) : (
              pendingMembers.map((m) => {
                const planName =
                  m.memberships[0]?.plan?.name ?? "No active plan";
                const since = new Date(m.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div
                    key={m.id}
                    className="flex items-start justify-between gap-3 p-3 bg-zinc-800/60 rounded-lg"
                  >
                    <div>
                      <p className="font-montserrat font-semibold text-sm text-white">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="font-lora text-xs text-yellow-400 mt-0.5">
                        {planName}
                      </p>
                      <p className="font-lora text-xs text-zinc-500 mt-0.5">
                        Since {since}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs bg-yellow-400/10 text-yellow-400 font-montserrat font-semibold px-2 py-1 rounded-md">
                      {m.gapEligible ? "GAP Pending" : "Pending"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <Link
            href="/admin/gap"
            className="flex items-center gap-1 mt-4 text-xs text-zinc-500 hover:text-white font-montserrat transition-colors"
          >
            Review GAP applications <ArrowRight size={13} />
          </Link>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="text-green-400" size={18} />
            <h2 className="font-montserrat font-bold text-base text-white tracking-wide">
              Recent Check-ins
            </h2>
          </div>
          <div className="space-y-3">
            {recentCheckIns.length === 0 ? (
              <p className="font-lora text-sm text-zinc-500 py-4 text-center">
                No check-ins yet today.
              </p>
            ) : (
              recentCheckIns.map((c) => {
                const time = new Date(c.checkedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-lg"
                  >
                    <div>
                      <p className="font-montserrat font-semibold text-sm text-white">
                        {c.member.firstName} {c.member.lastName}
                      </p>
                      <p className="font-lora text-xs text-zinc-500 mt-0.5">
                        via {c.method}
                      </p>
                    </div>
                    <span className="font-montserrat text-xs text-zinc-400">
                      {time}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <Link
            href="/admin/checkin"
            className="flex items-center gap-1 mt-4 text-xs text-zinc-500 hover:text-white font-montserrat transition-colors"
          >
            Open check-in kiosk <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-montserrat font-bold text-base text-white tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex items-start gap-4 transition-colors"
            >
              <div className="bg-red-500/10 rounded-lg p-2.5">
                <Icon className="text-red-400" size={20} />
              </div>
              <div>
                <p className="font-montserrat font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                  {label}
                </p>
                <p className="font-lora text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

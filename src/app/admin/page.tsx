import Link from "next/link";
import {
  Users,
  Activity,
  DollarSign,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Members",
    value: "34",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Active Subscriptions",
    value: "28",
    icon: Activity,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    label: "Monthly Revenue",
    value: "$3,150",
    icon: DollarSign,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    label: "Check-ins Today",
    value: "12",
    icon: ScanLine,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
];

const ATTENTION_MEMBERS = [
  {
    name: "Richard Lim",
    issue: "GAP Veteran pending",
    since: "Jul 20, 2025",
    plan: "GAP Program",
  },
  {
    name: "Cookie Ainsworth",
    issue: "GAP Caregiver pending",
    since: "Jul 19, 2025",
    plan: "GAP Program",
  },
  {
    name: "Marcus Webb",
    issue: "GAP First Responder pending",
    since: "Jul 18, 2025",
    plan: "GAP Program",
  },
];

const RECENT_CHECKINS = [
  { name: "Randy Franklin",  time: "9:47 AM", plan: "Monthly Unlimited" },
  { name: "Brandi Long",     time: "9:33 AM", plan: "Small Group" },
  { name: "Tamara Okafor",   time: "9:15 AM", plan: "Monthly Unlimited" },
  { name: "DeShawn Morris",  time: "8:58 AM", plan: "10-Class Pack" },
  { name: "Heather Valdez",  time: "8:42 AM", plan: "Small Group" },
];

const QUICK_LINKS = [
  { label: "Manage Members", href: "/admin/members", icon: Users,        desc: "View, add, and edit member profiles" },
  { label: "Check-in Kiosk", href: "/admin/checkin", icon: ScanLine,     desc: "Open the member check-in station" },
  { label: "Billing",        href: "/admin/billing", icon: DollarSign,   desc: "Subscriptions, revenue & payments" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">
          Dashboard
        </h1>
        <p className="font-lora text-zinc-400 mt-1">
          Welcome back — here&apos;s what&apos;s happening at Honor Bound FIT today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-4`}>
              <Icon className={color} size={20} />
            </div>
            <p className="font-montserrat font-bold text-2xl text-white">{value}</p>
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
              {ATTENTION_MEMBERS.length}
            </span>
          </div>
          <div className="space-y-3">
            {ATTENTION_MEMBERS.map((m) => (
              <div
                key={m.name}
                className="flex items-start justify-between gap-3 p-3 bg-zinc-800/60 rounded-lg"
              >
                <div>
                  <p className="font-montserrat font-semibold text-sm text-white">{m.name}</p>
                  <p className="font-lora text-xs text-yellow-400 mt-0.5">{m.issue}</p>
                  <p className="font-lora text-xs text-zinc-500 mt-0.5">Since {m.since}</p>
                </div>
                <span className="shrink-0 text-xs bg-yellow-400/10 text-yellow-400 font-montserrat font-semibold px-2 py-1 rounded-md">
                  GAP Pending
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/members"
            className="flex items-center gap-1 mt-4 text-xs text-zinc-500 hover:text-white font-montserrat transition-colors"
          >
            View all members <ArrowRight size={13} />
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
            {RECENT_CHECKINS.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-lg">
                <div>
                  <p className="font-montserrat font-semibold text-sm text-white">{c.name}</p>
                  <p className="font-lora text-xs text-zinc-500 mt-0.5">{c.plan}</p>
                </div>
                <span className="font-montserrat text-xs text-zinc-400">{c.time}</span>
              </div>
            ))}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

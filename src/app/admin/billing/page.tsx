"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

// ── Types & Data ───────────────────────────────────────────────────────────────

type SubStatus = "Active" | "Past Due" | "Canceled";

interface Subscription {
  id: number;
  name: string;
  plan: string;
  amount: number;
  nextBilling: string;
  status: SubStatus;
}

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    name: "Randy Franklin",
    plan: "Monthly Unlimited",
    amount: 150,
    nextBilling: "Aug 15, 2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Brandi Long",
    plan: "Small Group Training",
    amount: 120,
    nextBilling: "Aug 08, 2025",
    status: "Active",
  },
  {
    id: 3,
    name: "Tamara Okafor",
    plan: "Monthly Unlimited",
    amount: 150,
    nextBilling: "Aug 20, 2025",
    status: "Active",
  },
  {
    id: 4,
    name: "DeShawn Morris",
    plan: "10-Class Pack",
    amount: 100,
    nextBilling: "Aug 14, 2025",
    status: "Active",
  },
  {
    id: 5,
    name: "Heather Valdez",
    plan: "Small Group Training",
    amount: 120,
    nextBilling: "Aug 03, 2025",
    status: "Active",
  },
  {
    id: 6,
    name: "Jasmine Torres",
    plan: "Monthly Unlimited",
    amount: 150,
    nextBilling: "Aug 22, 2025",
    status: "Active",
  },
  {
    id: 7,
    name: "Tyler Reeves",
    plan: "Personal Training",
    amount: 300,
    nextBilling: "Aug 05, 2025",
    status: "Active",
  },
  {
    id: 8,
    name: "Angela Kim",
    plan: "Monthly Unlimited",
    amount: 150,
    nextBilling: "Aug 11, 2025",
    status: "Active",
  },
  {
    id: 9,
    name: "Calvin Brooks",
    plan: "Small Group Training",
    amount: 120,
    nextBilling: "Aug 19, 2025",
    status: "Active",
  },
  {
    id: 10,
    name: "Denise Harrington",
    plan: "Monthly Unlimited",
    amount: 150,
    nextBilling: "Aug 01, 2025",
    status: "Active",
  },
];

const STATUS_STYLES: Record<SubStatus, string> = {
  Active:   "bg-green-400/15 text-green-400 border border-green-400/30",
  "Past Due": "bg-red-400/15 text-red-400 border border-red-400/30",
  Canceled: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
};

const REVENUE_STATS = [
  {
    label: "Monthly Recurring Revenue",
    value: "$3,150",
    icon: DollarSign,
    color: "text-green-400",
    bg: "bg-green-400/10",
    sub: "+$300 vs last month",
    subColor: "text-green-400",
  },
  {
    label: "Year-to-Date Revenue",
    value: "$18,900",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    sub: "Jan – Jul 2025",
    subColor: "text-zinc-500",
  },
  {
    label: "Overdue Balance",
    value: "$0",
    icon: AlertTriangle,
    color: "text-zinc-500",
    bg: "bg-zinc-700/20",
    sub: "All accounts current",
    subColor: "text-zinc-500",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [syncing, setSyncing]     = useState(false);
  const [synced, setSynced]       = useState(false);

  function handleSync() {
    setSyncing(true);
    setSynced(false);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 1400);
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">Billing</h1>
          <p className="font-lora text-zinc-400 mt-1">Revenue overview and subscription management</p>
        </div>
        <div className="flex items-center gap-3">
          {synced && (
            <span className="flex items-center gap-1.5 text-sm text-green-400 font-montserrat font-semibold animate-pulse">
              <CheckCircle2 size={16} />
              Synced!
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-sm font-semibold border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync with Stripe"}
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REVENUE_STATS.map(({ label, value, icon: Icon, color, bg, sub, subColor }) => (
          <div key={label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-4`}>
              <Icon className={color} size={20} />
            </div>
            <p className="font-montserrat font-black text-3xl text-white">{value}</p>
            <p className="font-lora text-zinc-400 text-sm mt-0.5">{label}</p>
            <p className={`font-montserrat text-xs font-semibold mt-2 ${subColor}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Active Subscriptions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-montserrat font-bold text-base text-white tracking-wide">
            Active Subscriptions
          </h2>
          <span className="text-xs text-zinc-500 font-montserrat">
            {SUBSCRIPTIONS.filter((s) => s.status === "Active").length} active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Member", "Plan", "Amount", "Next Billing", "Status"].map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {SUBSCRIPTIONS.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4 font-montserrat font-semibold text-white whitespace-nowrap">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 font-lora text-zinc-300 whitespace-nowrap">{s.plan}</td>
                  <td className="px-6 py-4 font-montserrat font-bold text-white whitespace-nowrap">
                    ${s.amount.toLocaleString()}
                    <span className="text-zinc-600 font-normal text-xs">/mo</span>
                  </td>
                  <td className="px-6 py-4 font-lora text-zinc-400 whitespace-nowrap">
                    {s.nextBilling}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat font-bold ${
                        STATUS_STYLES[s.status]
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Payments */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-montserrat font-bold text-base text-white tracking-wide">
            Failed Payments
          </h2>
          <span className="text-xs bg-green-400/10 text-green-400 font-montserrat font-semibold px-2 py-0.5 rounded-full border border-green-400/20">
            All clear
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <CheckCircle2 className="text-zinc-700" size={40} />
          <p className="font-montserrat font-bold text-zinc-500">No failed payments</p>
          <p className="font-lora text-zinc-600 text-sm">All members are current on their billing.</p>
        </div>
      </div>
    </div>
  );
}

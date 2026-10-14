"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, AlertTriangle, RefreshCw, CheckCircle2, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type SubStatus = "Active" | "Past Due" | "Canceled" | "Trialing";
type SortCol = "name" | "plan" | "amount" | "nextBilling" | "status";
type SortDir = "asc" | "desc";

interface Subscription {
  id: string;
  memberId: string | null;
  name: string;
  plan: string;
  standInTheGap: boolean;
  amountCents: number;
  nextBilling: string | null;
  status: SubStatus;
  cancelAtPeriodEnd: boolean;
}

interface BillingData {
  recurringRevenueCents: number;
  ytdCents: number;
  overdueCents: number;
  subscriptions: Subscription[];
}

const STATUS_STYLES: Record<SubStatus, string> = {
  Active:    "bg-green-400/15 text-green-400 border border-green-400/30",
  "Past Due": "bg-red-400/15 text-red-400 border border-red-400/30",
  Canceled:  "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
  Trialing:  "bg-blue-400/15 text-blue-400 border border-blue-400/30",
};

const STATUS_ORDER: Record<SubStatus, number> = {
  Active: 0, Trialing: 1, "Past Due": 2, Canceled: 3,
};

function fmt(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function sortSubs(subs: Subscription[], col: SortCol, dir: SortDir): Subscription[] {
  return [...subs].sort((a, b) => {
    let cmp = 0;
    switch (col) {
      case "name":        cmp = a.name.localeCompare(b.name); break;
      case "plan":        cmp = a.plan.localeCompare(b.plan); break;
      case "amount":      cmp = a.amountCents - b.amountCents; break;
      case "nextBilling": {
        // nulls last regardless of direction
        if (!a.nextBilling && !b.nextBilling) { cmp = 0; break; }
        if (!a.nextBilling) return 1;
        if (!b.nextBilling) return -1;
        cmp = new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime();
        break;
      }
      case "status":      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortIcon({ col, sortCol, sortDir }: { col: SortCol; sortCol: SortCol; sortDir: SortDir }) {
  if (col !== sortCol) return <ChevronsUpDown size={13} className="text-zinc-600 ml-1 inline" />;
  return sortDir === "asc"
    ? <ChevronUp size={13} className="text-zinc-300 ml-1 inline" />
    : <ChevronDown size={13} className="text-zinc-300 ml-1 inline" />;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/billing");
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Could not load billing data. Check Stripe connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true);
    setSynced(false);
    await load();
    setSyncing(false);
    setSynced(true);
    setTimeout(() => setSynced(false), 3000);
  }

  function handleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  const activeSubs = data?.subscriptions.filter(s => s.status === "Active" || s.status === "Trialing") ?? [];
  const pastDueSubs = data?.subscriptions.filter(s => s.status === "Past Due") ?? [];
  const sortedActive = sortSubs(activeSubs, sortCol, sortDir);
  const sortedPastDue = sortSubs(pastDueSubs, sortCol, sortDir);
  const year = new Date().getFullYear();

  const COLUMNS: { key: SortCol; label: string }[] = [
    { key: "name",        label: "Member" },
    { key: "plan",        label: "Plan" },
    { key: "amount",      label: "Amount" },
    { key: "nextBilling", label: "Next Billing" },
    { key: "status",      label: "Status" },
  ];

  function SortableHead() {
    return (
      <thead>
        <tr className="border-b border-zinc-800">
          {COLUMNS.map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="text-left px-6 py-3 font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors whitespace-nowrap"
            >
              {label}
              <SortIcon col={key} sortCol={sortCol} sortDir={sortDir} />
            </th>
          ))}
        </tr>
      </thead>
    );
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
              <CheckCircle2 size={16} /> Synced!
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-sm font-semibold border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={syncing || loading ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync with Stripe"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/40 border border-red-700 rounded-xl px-6 py-4 text-red-400 font-montserrat text-sm">
          {error}
        </div>
      )}

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Recurring Revenue (4-wk)",
            value: loading ? "—" : fmt(data?.recurringRevenueCents ?? 0),
            icon: DollarSign,
            color: "text-green-400",
            bg: "bg-green-400/10",
            sub: loading ? "" : `${activeSubs.length} active subscription${activeSubs.length !== 1 ? "s" : ""}`,
            subColor: "text-green-400",
          },
          {
            label: "Year-to-Date Revenue",
            value: loading ? "—" : fmt(data?.ytdCents ?? 0),
            icon: TrendingUp,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            sub: `Jan – ${new Date().toLocaleString("en-US", { month: "short" })} ${year}`,
            subColor: "text-zinc-500",
          },
          {
            label: "Overdue Balance",
            value: loading ? "—" : fmt(data?.overdueCents ?? 0),
            icon: AlertTriangle,
            color: data?.overdueCents ? "text-red-400" : "text-zinc-500",
            bg: data?.overdueCents ? "bg-red-400/10" : "bg-zinc-700/20",
            sub: loading ? "" : pastDueSubs.length > 0 ? `${pastDueSubs.length} past due` : "All accounts current",
            subColor: data?.overdueCents ? "text-red-400" : "text-zinc-500",
          },
        ].map(({ label, value, icon: Icon, color, bg, sub, subColor }) => (
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
            {loading ? "…" : `${activeSubs.length} active`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-montserrat text-sm">Loading from Stripe…</span>
          </div>
        ) : activeSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <p className="font-montserrat font-bold text-zinc-500">No active subscriptions</p>
            <p className="font-lora text-zinc-600 text-sm">Members will appear here once they complete checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHead />
              <tbody className="divide-y divide-zinc-800">
                {sortedActive.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-montserrat font-semibold text-white whitespace-nowrap">
                      {s.memberId ? (
                        <a href={`/coach/member-view/${s.memberId}`} className="hover:text-red-400 transition-colors">
                          {s.name}
                        </a>
                      ) : s.name}
                    </td>
                    <td className="px-6 py-4 font-lora text-zinc-300 whitespace-nowrap">
                      {s.plan}
                      {s.standInTheGap && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-montserrat font-bold text-blue-400 bg-blue-400/10 border border-blue-400/25 rounded-full px-2 py-0.5">
                          🛡 SITG
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-montserrat font-bold text-white whitespace-nowrap">
                      {fmt(s.amountCents)}
                      <span className="text-zinc-600 font-normal text-xs">/4 wks</span>
                    </td>
                    <td className="px-6 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {s.cancelAtPeriodEnd
                        ? <span className="text-amber-400">Cancels {s.nextBilling ?? "—"}</span>
                        : (s.nextBilling ?? "—")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat font-bold ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Failed Payments */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-montserrat font-bold text-base text-white tracking-wide">
            Failed Payments
          </h2>
          {loading ? null : pastDueSubs.length > 0 ? (
            <span className="text-xs bg-red-400/10 text-red-400 font-montserrat font-semibold px-2 py-0.5 rounded-full border border-red-400/20">
              {pastDueSubs.length} overdue
            </span>
          ) : (
            <span className="text-xs bg-green-400/10 text-green-400 font-montserrat font-semibold px-2 py-0.5 rounded-full border border-green-400/20">
              All clear
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-zinc-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : pastDueSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <CheckCircle2 className="text-zinc-700" size={40} />
            <p className="font-montserrat font-bold text-zinc-500">No failed payments</p>
            <p className="font-lora text-zinc-600 text-sm">All members are current on their billing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <SortableHead />
              <tbody className="divide-y divide-zinc-800">
                {sortedPastDue.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-montserrat font-semibold text-white whitespace-nowrap">{s.name}</td>
                    <td className="px-6 py-4 font-lora text-zinc-300 whitespace-nowrap">{s.plan}</td>
                    <td className="px-6 py-4 font-montserrat font-bold text-white whitespace-nowrap">
                      {fmt(s.amountCents)}
                      <span className="text-zinc-600 font-normal text-xs">/4 wks</span>
                    </td>
                    <td className="px-6 py-4 font-lora text-zinc-400 whitespace-nowrap">{s.nextBilling ?? "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat font-bold ${STATUS_STYLES[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

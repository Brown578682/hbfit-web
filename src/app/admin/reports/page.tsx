"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Users, DollarSign, CalendarCheck, TrendingUp,
  RefreshCw, Loader2, Award,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MonthPoint { month: string; count: number; }
interface RevenuePoint { month: string; cents: number; }
interface DayPoint { day: string; count: number; }
interface TopMember { name: string; count: number; }

interface ReportData {
  membership: {
    activeCount: number;
    migratingCount: number;
    planCounts: Record<string, number>;
    newByMonth: MonthPoint[];
  };
  revenue: {
    mrrCents: number;
    ytdCents: number;
    byMonth: RevenuePoint[];
  };
  attendance: {
    totalBookings: number;
    totalCheckins: number;
    byDay: DayPoint[];
    checkinsByMonth: MonthPoint[];
    topMembers: TopMember[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt$ = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtMonth = (iso: string) => {
  const [y, m] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

function Bar({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-montserrat text-xs text-zinc-400 w-8 text-right">{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "text-blue-400" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <span className="font-montserrat text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      </div>
      <p className="font-montserrat font-bold text-2xl text-white">{value}</p>
      {sub && <p className="font-lora text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ── Sparkline-style bar chart ──────────────────────────────────────────────────
function MonthBarChart({ data, valueKey, color = "#3b82f6", formatter = String }: {
  data: any[]; valueKey: string; color?: string; formatter?: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const h = Math.max(4, Math.round((d[valueKey] / max) * 80));
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t transition-all duration-500 cursor-default"
              style={{ height: h, backgroundColor: color }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
              <div className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-montserrat text-white whitespace-nowrap">
                {formatter(d[valueKey])}
              </div>
            </div>
            <span className="font-montserrat text-[10px] text-zinc-600">{fmtMonth(d.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"membership" | "revenue" | "attendance">("membership");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          <div>
            <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">Reports</h1>
            <p className="font-lora text-zinc-400 text-sm mt-0.5">Membership · Revenue · Attendance</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-montserrat text-xs font-semibold rounded-lg border border-zinc-700 transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 font-montserrat text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex items-center justify-center py-24 text-zinc-500 font-lora gap-3">
          <Loader2 size={20} className="animate-spin" /> Loading report data…
        </div>
      )}

      {data && (
        <>
          {/* Top-line KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Active Members" value={String(data.membership.activeCount)} sub={`+${data.membership.migratingCount} migrating`} color="text-green-400" />
            <StatCard icon={DollarSign} label="MRR" value={fmt$(data.revenue.mrrCents)} sub="active subscriptions" color="text-emerald-400" />
            <StatCard icon={TrendingUp} label="YTD Revenue" value={fmt$(data.revenue.ytdCents)} sub={`Jan–${new Date().toLocaleDateString("en-US", { month: "short" })} ${new Date().getFullYear()}`} color="text-blue-400" />
            <StatCard icon={CalendarCheck} label="Total Bookings" value={String(data.attendance.totalBookings)} sub={`${data.attendance.totalCheckins} check-ins`} color="text-purple-400" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-800">
            {(["membership", "revenue", "attendance"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 font-montserrat text-sm font-semibold capitalize border-b-2 transition-colors ${
                  tab === t ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── MEMBERSHIP TAB ─────────────────────────────────────────────── */}
          {tab === "membership" && (
            <div className="space-y-8">
              {/* Members by plan */}
              <div>
                <SectionHeader><Users size={13} /> Members by Plan</SectionHeader>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                  {Object.entries(data.membership.planCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([plan, count]) => (
                      <div key={plan}>
                        <div className="flex justify-between mb-1">
                          <span className="font-montserrat text-sm text-white">{plan}</span>
                          <span className="font-montserrat text-sm font-bold text-white">{count}</span>
                        </div>
                        <Bar value={count} max={Math.max(...Object.values(data.membership.planCounts))} color="bg-green-500" />
                      </div>
                    ))}
                </div>
              </div>

              {/* New members by month */}
              {data.membership.newByMonth.length > 0 && (
                <div>
                  <SectionHeader><TrendingUp size={13} /> New Members (Last 6 Months)</SectionHeader>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <MonthBarChart data={data.membership.newByMonth} valueKey="count" color="#22c55e" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REVENUE TAB ────────────────────────────────────────────────── */}
          {tab === "revenue" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Monthly Recurring Revenue</p>
                  <p className="font-montserrat font-bold text-3xl text-emerald-400">{fmt$(data.revenue.mrrCents)}</p>
                  <p className="font-lora text-xs text-zinc-500 mt-1">Based on active Stripe subscriptions</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="font-montserrat text-xs uppercase tracking-widest text-zinc-500 mb-2">Year-to-Date Revenue</p>
                  <p className="font-montserrat font-bold text-3xl text-blue-400">{fmt$(data.revenue.ytdCents)}</p>
                  <p className="font-lora text-xs text-zinc-500 mt-1">Paid charges Jan 1 – today</p>
                </div>
              </div>

              {data.revenue.byMonth.length > 0 && (
                <div>
                  <SectionHeader><DollarSign size={13} /> Revenue by Month</SectionHeader>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <MonthBarChart
                      data={data.revenue.byMonth}
                      valueKey="cents"
                      color="#3b82f6"
                      formatter={(v) => fmt$(v)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDANCE TAB ─────────────────────────────────────────────── */}
          {tab === "attendance" && (
            <div className="space-y-8">
              {/* Bookings by day of week */}
              <div>
                <SectionHeader><CalendarCheck size={13} /> Bookings by Day of Week</SectionHeader>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                  {data.attendance.byDay.map(d => (
                    <div key={d.day}>
                      <div className="flex justify-between mb-1">
                        <span className="font-montserrat text-sm text-white">{d.day}</span>
                        <span className="font-montserrat text-sm font-bold text-white">{d.count}</span>
                      </div>
                      <Bar value={d.count} max={Math.max(...data.attendance.byDay.map(x => x.count))} color="bg-purple-500" />
                    </div>
                  ))}
                  {data.attendance.byDay.length === 0 && (
                    <p className="font-lora text-zinc-500 text-sm text-center py-4">No booking data yet</p>
                  )}
                </div>
              </div>

              {/* Top members */}
              {data.attendance.topMembers.length > 0 && (
                <div>
                  <SectionHeader><Award size={13} /> Most Active Members</SectionHeader>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
                    {data.attendance.topMembers.map((m, i) => (
                      <div key={m.name} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="font-montserrat text-xs font-bold text-zinc-600 w-5">{i + 1}</span>
                          <span className="font-montserrat text-sm text-white">{m.name}</span>
                        </div>
                        <span className="font-montserrat text-sm font-bold text-purple-400">{m.count} bookings</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-ins by month */}
              {data.attendance.checkinsByMonth.length > 0 && (
                <div>
                  <SectionHeader><CalendarCheck size={13} /> Check-ins by Month</SectionHeader>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <MonthBarChart data={data.attendance.checkinsByMonth} valueKey="count" color="#a855f7" />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

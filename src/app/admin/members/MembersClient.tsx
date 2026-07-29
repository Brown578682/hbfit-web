"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { UserPlus, Download, Search, Eye, Pencil } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MemberRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
  lastVisit: string | null;
  planName: string | null;
  gapEligible: boolean;
}

interface Props {
  initialMembers: MemberRow[];
  initialTotal: number;
  statusCounts: Record<string, number>;
}

// ── Status styles ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "bg-green-400/15 text-green-400 border border-green-400/30",
  PENDING:
    "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30",
  LEAD:
    "bg-blue-400/15 text-blue-400 border border-blue-400/30",
  VISITOR:
    "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
  INACTIVE:
    "bg-red-400/15 text-red-400 border border-red-400/30",
  SUSPENDED:
    "bg-orange-400/15 text-orange-400 border border-orange-400/30",
};

const ALL_STATUSES = ["All", "ACTIVE", "PENDING", "INACTIVE", "LEAD", "VISITOR", "SUSPENDED"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function exportCsv(members: MemberRow[]) {
  const header = "Name,Email,Phone,Plan,Status,Last Visit,Joined";
  const rows = members.map(
    (m) =>
      `"${m.firstName} ${m.lastName}","${m.email}","${m.phone}","${m.planName ?? ""}","${m.status}","${formatDate(m.lastVisit)}","${formatDate(m.joinedAt)}"`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hbfit-members.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MembersClient({
  initialMembers,
  initialTotal,
  statusCounts,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(
    async (q: string, status: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("search", q);
        if (status !== "All") params.set("status", status);
        const res = await fetch(`/api/admin/members?${params}`);
        const data = await res.json();
        setMembers(data.members);
        setTotal(data.total);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Client-side filter on initial data when no async fetch needed
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const matchSearch =
        search === "" ||
        fullName.includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, search, statusFilter]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length > 2 || val.length === 0) {
      fetchMembers(val, statusFilter);
    }
  };

  const handleStatus = (val: string) => {
    setStatus(val);
    fetchMembers(search, val);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">
            Members
          </h1>
          <p className="font-lora text-zinc-400 mt-1">
            {total} total &mdash;{" "}
            <span className="text-green-400">
              {statusCounts["ACTIVE"] ?? 0} active
            </span>
            {(statusCounts["PENDING"] ?? 0) > 0 && (
              <>
                {" "}·{" "}
                <span className="text-yellow-400">
                  {statusCounts["PENDING"]} pending
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-sm font-semibold transition-colors border border-zinc-700"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-montserrat text-sm font-bold transition-colors">
            <UserPlus size={15} />
            Add Member
          </button>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.filter((s) => s !== "All").map((s) => {
          const count = statusCounts[s] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => handleStatus(s === statusFilter ? "All" : s)}
              className={`px-3 py-1 rounded-full text-xs font-montserrat font-semibold border transition-colors ${
                statusFilter === s
                  ? STATUS_STYLES[s]
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={15}
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 font-lora focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-montserrat focus:outline-none focus:border-zinc-500 transition-colors"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {loading && (
          <span className="text-xs text-zinc-500 font-montserrat animate-pulse">
            Loading…
          </span>
        )}
        {!loading && (search || statusFilter !== "All") && (
          <span className="text-xs text-zinc-500 font-montserrat">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {[
                  "Name",
                  "Email",
                  "Phone",
                  "Plan",
                  "Status",
                  "Last Visit",
                  "Joined",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3.5 font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-zinc-500 font-lora"
                  >
                    {loading ? "Loading members…" : "No members match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-4 font-montserrat font-semibold text-white whitespace-nowrap">
                      {m.firstName} {m.lastName}
                      {m.gapEligible && (
                        <span className="ml-2 text-xs text-yellow-400 font-normal">
                          GAP
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.email}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.phone || "—"}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-300 whitespace-nowrap">
                      {m.planName ?? <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat font-bold ${
                          STATUS_STYLES[m.status] ??
                          "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {formatDate(m.lastVisit)}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {formatDate(m.joinedAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-xs font-semibold transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-blue-700 text-zinc-300 hover:text-white font-montserrat text-xs font-semibold transition-colors">
                          <Pencil size={12} />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

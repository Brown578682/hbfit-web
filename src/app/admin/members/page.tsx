"use client";

import { useState, useMemo } from "react";
import { UserPlus, Download, Search, Eye, Pencil } from "lucide-react";

// ── Types & Data ───────────────────────────────────────────────────────────────

type Status = "Active" | "Pending" | "Lead" | "Visitor";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: Status;
  lastVisit: string;
  joined: string;
}

const MEMBERS: Member[] = [
  {
    id: 1,
    name: "Randy Franklin",
    email: "randy.franklin@email.com",
    phone: "(540) 555-0101",
    plan: "Monthly Unlimited",
    status: "Active",
    lastVisit: "Jul 21, 2025",
    joined: "Jan 15, 2024",
  },
  {
    id: 2,
    name: "Cookie Ainsworth",
    email: "cookie.ainsworth@email.com",
    phone: "(540) 555-0102",
    plan: "GAP Program",
    status: "Pending",
    lastVisit: "Jul 19, 2025",
    joined: "Jun 01, 2025",
  },
  {
    id: 3,
    name: "Richard Lim",
    email: "richard.lim@email.com",
    phone: "(540) 555-0103",
    plan: "GAP Program",
    status: "Pending",
    lastVisit: "Jul 20, 2025",
    joined: "Jul 10, 2025",
  },
  {
    id: 4,
    name: "Brandi Long",
    email: "brandi.long@email.com",
    phone: "(540) 555-0104",
    plan: "Small Group Training",
    status: "Active",
    lastVisit: "Jul 21, 2025",
    joined: "Mar 08, 2024",
  },
  {
    id: 5,
    name: "Tamara Okafor",
    email: "tamara.okafor@email.com",
    phone: "(540) 555-0105",
    plan: "Monthly Unlimited",
    status: "Active",
    lastVisit: "Jul 21, 2025",
    joined: "Feb 20, 2024",
  },
  {
    id: 6,
    name: "DeShawn Morris",
    email: "deshawn.morris@email.com",
    phone: "(540) 555-0106",
    plan: "10-Class Pack",
    status: "Active",
    lastVisit: "Jul 21, 2025",
    joined: "Apr 14, 2025",
  },
  {
    id: 7,
    name: "Heather Valdez",
    email: "heather.valdez@email.com",
    phone: "(540) 555-0107",
    plan: "Small Group Training",
    status: "Active",
    lastVisit: "Jul 21, 2025",
    joined: "Nov 03, 2023",
  },
  {
    id: 8,
    name: "Marcus Webb",
    email: "marcus.webb@email.com",
    phone: "(540) 555-0108",
    plan: "GAP Program",
    status: "Pending",
    lastVisit: "Jul 18, 2025",
    joined: "Jul 15, 2025",
  },
  {
    id: 9,
    name: "Jasmine Torres",
    email: "jasmine.torres@email.com",
    phone: "(540) 555-0109",
    plan: "Monthly Unlimited",
    status: "Active",
    lastVisit: "Jul 20, 2025",
    joined: "Sep 22, 2023",
  },
  {
    id: 10,
    name: "Tyler Reeves",
    email: "tyler.reeves@email.com",
    phone: "(540) 555-0110",
    plan: "Personal Training",
    status: "Active",
    lastVisit: "Jul 19, 2025",
    joined: "May 05, 2024",
  },
  {
    id: 11,
    name: "Patricia Nweke",
    email: "patricia.nweke@email.com",
    phone: "(540) 555-0111",
    plan: "Monthly Unlimited",
    status: "Lead",
    lastVisit: "Jul 17, 2025",
    joined: "Jul 17, 2025",
  },
  {
    id: 12,
    name: "Kevin Stroud",
    email: "kevin.stroud@email.com",
    phone: "(540) 555-0112",
    plan: "Day Pass",
    status: "Visitor",
    lastVisit: "Jul 16, 2025",
    joined: "Jul 16, 2025",
  },
];

const STATUS_STYLES: Record<Status, string> = {
  Active:  "bg-green-400/15 text-green-400 border border-green-400/30",
  Pending: "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30",
  Lead:    "bg-blue-400/15 text-blue-400 border border-blue-400/30",
  Visitor: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
};

const ALL_STATUSES: Array<Status | "All"> = ["All", "Active", "Pending", "Lead", "Visitor"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function exportCsv(members: Member[]) {
  const header = "Name,Email,Phone,Plan,Status,Last Visit,Joined";
  const rows = members.map(
    (m) =>
      `"${m.name}","${m.email}","${m.phone}","${m.plan}","${m.status}","${m.lastVisit}","${m.joined}"`
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

export default function MembersPage() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<Status | "All">("All");

  const filtered = useMemo(() => {
    return MEMBERS.filter((m) => {
      const matchSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">Members</h1>
          <p className="font-lora text-zinc-400 mt-1">
            {MEMBERS.length} total members &mdash; {MEMBERS.filter((m) => m.status === "Active").length} active
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 font-lora focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value as Status | "All")}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-montserrat focus:outline-none focus:border-zinc-500 transition-colors"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : s}
            </option>
          ))}
        </select>
        {(search || statusFilter !== "All") && (
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
                {["Name", "Email", "Phone", "Plan", "Status", "Last Visit", "Joined", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3.5 font-montserrat font-bold text-xs uppercase tracking-widest text-zinc-500"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 font-lora">
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-4 font-montserrat font-semibold text-white whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.email}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.phone}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-300 whitespace-nowrap">
                      {m.plan}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-montserrat font-bold ${STATUS_STYLES[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.lastVisit}
                    </td>
                    <td className="px-5 py-4 font-lora text-zinc-400 whitespace-nowrap">
                      {m.joined}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-montserrat text-xs font-semibold transition-colors">
                          <Eye size={12} />
                          View
                        </button>
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

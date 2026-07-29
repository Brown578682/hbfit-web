"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, FileText, CheckCircle2, XCircle } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface GapApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinedAt: string;
  gapCategory: string | null;
  gapDocumentUrl: string | null;
}

// ── Toast ──────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GapPage() {
  const [applicants, setApplicants] = useState<GapApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gap");
      const data = await res.json();
      setApplicants(data.applicants ?? []);
    } catch {
      showToast("Failed to load applicants", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string, name: string) => {
    setActionLoading(id + "-approve");
    try {
      const res = await fetch(`/api/admin/gap/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBy: "Admin" }),
      });
      if (!res.ok) throw new Error("Failed");
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      showToast(`✓ ${name} approved — membership activated`, "success");
    } catch {
      showToast(`Failed to approve ${name}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (id: string, name: string) => {
    if (!confirm(`Deny GAP application for ${name}?`)) return;
    setActionLoading(id + "-deny");
    try {
      const res = await fetch(`/api/admin/gap/${id}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Denied via admin panel" }),
      });
      if (!res.ok) throw new Error("Failed");
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      showToast(`${name} denied`, "error");
    } catch {
      showToast(`Failed to deny ${name}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatCategory = (cat: string | null) => {
    if (!cat) return "Unknown";
    return cat
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg font-montserrat text-sm font-semibold shadow-lg transition-all ${
              t.type === "success"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-yellow-400" size={28} />
          <h1 className="font-montserrat font-bold text-3xl tracking-tight text-white">
            GAP Approvals
          </h1>
        </div>
        <p className="font-lora text-zinc-400 mt-1 ml-11">
          Review and approve Government Assistance Program applications.
        </p>
      </div>

      {/* Count badge */}
      {!loading && (
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-montserrat font-semibold ${
              applicants.length > 0
                ? "bg-yellow-400/10 text-yellow-400"
                : "bg-green-400/10 text-green-400"
            }`}
          >
            {applicants.length === 0
              ? "All caught up"
              : `${applicants.length} pending application${applicants.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500 font-lora">
          Loading applicants…
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center">
          <CheckCircle2 className="text-green-400 mx-auto mb-4" size={40} />
          <p className="font-montserrat font-bold text-lg text-white">
            No pending GAP applications
          </p>
          <p className="font-lora text-zinc-500 mt-2">
            All GAP applications have been reviewed. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applicants.map((a) => {
            const name = `${a.firstName} ${a.lastName}`;
            const isActioning = actionLoading?.startsWith(a.id);
            return (
              <div
                key={a.id}
                className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-opacity ${
                  isActioning ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-montserrat font-bold text-lg text-white">
                        {name}
                      </h3>
                      {a.gapCategory && (
                        <span className="bg-yellow-400/10 text-yellow-400 text-xs font-montserrat font-semibold px-2 py-0.5 rounded-full">
                          {formatCategory(a.gapCategory)}
                        </span>
                      )}
                    </div>
                    <p className="font-lora text-sm text-zinc-400">{a.email}</p>
                    {a.phone && (
                      <p className="font-lora text-sm text-zinc-400">{a.phone}</p>
                    )}
                    <p className="font-lora text-xs text-zinc-500">
                      Applied {formatDate(a.joinedAt)}
                    </p>
                    {a.gapDocumentUrl && (
                      <a
                        href={a.gapDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-montserrat font-semibold transition-colors mt-1"
                      >
                        <FileText size={13} />
                        View Supporting Document
                      </a>
                    )}
                    {!a.gapDocumentUrl && (
                      <p className="text-xs text-zinc-600 font-lora italic mt-1">
                        No document uploaded
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(a.id, name)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-montserrat text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(a.id, name)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-red-700 border border-zinc-700 hover:border-red-600 text-zinc-300 hover:text-white font-montserrat text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Deny
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

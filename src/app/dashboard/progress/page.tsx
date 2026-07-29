"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp, Plus } from "lucide-react";
import CoreMetricsEntry, { CoreMetricsCard, CoreMetricsDelta } from "@/components/CoreMetricsEntry";
import { ASSESSMENT_LABELS, type AssessmentType } from "@/lib/coreMetrics";

interface CoreMetricsRecord {
  id: string;
  assessmentType: AssessmentType;
  recordedAt: string;
  recordedBy: string | null;
  age: number | null;
  heightIn: number | null;
  weightLbs: number | null;
  bodyFatPct: number | null;
  squatLbs: number | null;
  benchLbs: number | null;
  deadliftLbs: number | null;
  mileSec: number | null;
  fourHundredSec: number | null;
  wodTimeSec: number | null;
  wodPullUps: number | null;
  notes: string | null;
}

export default function ProgressPage() {
  const [history, setHistory] = useState<CoreMetricsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"history" | "log">("history");

  useEffect(() => {
    fetch("/api/member/core-metrics")
      .then((r) => r.json())
      .then((d: CoreMetricsRecord[]) => { if (Array.isArray(d)) setHistory(d); })
      .finally(() => setLoading(false));
  }, []);

  const baseline = [...history].reverse().find((h) => h.assessmentType === "ONBOARDING") ?? history[history.length - 1];
  const latest = history[0];
  const hasMultiple = history.length >= 2 && baseline && latest && baseline.id !== latest.id;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-montserrat font-bold">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <span className="font-montserrat font-bold text-sm uppercase tracking-wider">My Progress</span>
        <button
          onClick={() => setTab("log")}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-400 font-montserrat font-bold transition-colors"
        >
          <Plus size={14} /> Log
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">

        <div>
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight flex items-center gap-3">
            <TrendingUp size={28} className="text-red-500" /> Core Metrics
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {history.length} assessment{history.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {(["history", "log"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-montserrat font-bold uppercase tracking-wider border-b-2 transition-colors ${
                tab === t ? "border-red-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}>
              {t === "history" ? "History" : "Log New"}
            </button>
          ))}
        </div>

        {/* History tab */}
        {tab === "history" && (
          <div className="space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && history.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <p className="text-zinc-500">No assessments yet.</p>
                <button onClick={() => setTab("log")}
                  className="bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-lg text-sm transition-colors">
                  Log Your Baseline
                </button>
              </div>
            )}

            {/* Progress delta — most recent vs baseline */}
            {hasMultiple && (
              <div>
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  📈 Progress Since Baseline
                </h2>
                <CoreMetricsDelta
                  baseline={baseline as unknown as Record<string, unknown>}
                  current={latest as unknown as Record<string, unknown>}
                />
              </div>
            )}

            {/* Assessment history */}
            {history.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400">
                  Assessment History
                </h2>
                {history.map((record) => (
                  <CoreMetricsCard
                    key={record.id}
                    metrics={record as unknown as Record<string, unknown>}
                    label={`${ASSESSMENT_LABELS[record.assessmentType]}${record.recordedBy ? " (Coach)" : ""}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log tab */}
        {tab === "log" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-montserrat text-xl font-bold uppercase tracking-tight">Log an Assessment</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Fill in what you have — all fields are optional. Your coach can fill in anything
                you don&apos;t know (like body fat %).
              </p>
            </div>

            {/* Assessment type picker */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-widest font-montserrat mb-2">Assessment Type</label>
              <AssessmentTypePicker />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── Assessment type picker + form ─────────────────────────────────────────────
function AssessmentTypePicker() {
  const [type, setType] = useState<AssessmentType>("ONGOING");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.entries(ASSESSMENT_LABELS) as [AssessmentType, string][]).map(([val, label]) => (
          <button key={val} type="button" onClick={() => setType(val)}
            className={`px-4 py-2 rounded-lg text-sm font-montserrat font-bold border transition-colors ${
              type === val ? "bg-red-600 border-red-600 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <CoreMetricsEntry
        assessmentType={type}
        allowSkip={true}
        onSaved={() => { window.location.reload(); }}
      />
    </div>
  );
}

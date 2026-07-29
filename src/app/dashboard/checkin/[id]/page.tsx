"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import CoreMetricsEntry from "@/components/CoreMetricsEntry";
import { type AssessmentType } from "@/lib/coreMetrics";

interface CheckIn {
  id: string;
  type: "DAY1" | "DAY30" | "DAY60" | "DAY90" | "DAY180";
  scheduledDate: string;
  memberCompletedAt: string | null;
  coachCompletedAt: string | null;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  bigWins: string | null;
  areasToImprove: string | null;
  effortRating: number | null;
  motivationNote: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  DAY1: "Day 1",
  DAY30: "Day 30",
  DAY60: "Day 60",
  DAY90: "Day 90",
};

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    bigWins: "",
    areasToImprove: "",
    effortRating: 0,
    motivationNote: "",
  });

  useEffect(() => {
    fetch("/api/member/checkins")
      .then((r) => r.json())
      .then((all: CheckIn[]) => {
        const ci = all.find((c) => c.id === id);
        if (!ci) { router.replace("/dashboard"); return; }
        setCheckIn(ci);
        if (ci.memberCompletedAt) {
          setSubmitted(true);
          setForm({
            weight: ci.weight?.toString() ?? "",
            bodyFat: ci.bodyFat?.toString() ?? "",
            muscleMass: ci.muscleMass?.toString() ?? "",
            bigWins: ci.bigWins ?? "",
            areasToImprove: ci.areasToImprove ?? "",
            effortRating: ci.effortRating ?? 0,
            motivationNote: ci.motivationNote ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function submit() {
    setSaving(true);
    try {
      const res = await fetch("/api/member/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInId: id,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
          muscleMass: form.muscleMass ? parseFloat(form.muscleMass) : undefined,
          bigWins: form.bigWins || undefined,
          areasToImprove: form.areasToImprove || undefined,
          effortRating: form.effortRating || undefined,
          motivationNote: form.motivationNote || undefined,
        }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!checkIn) return null;

  const label = TYPE_LABEL[checkIn.type] ?? checkIn.type;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-montserrat font-bold">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <span className="font-montserrat font-bold text-sm uppercase tracking-wider">
          {label} Check‑In
        </span>
        <div className="w-20" />
      </header>

      <main className="mx-auto max-w-lg px-6 py-10 space-y-8">

        {/* Submitted confirmation */}
        {submitted && (
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl px-6 py-5 flex items-start gap-4">
            <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-montserrat font-bold text-emerald-400">Check-in submitted!</p>
              <p className="text-emerald-600 text-sm mt-1">
                Your coaches have been notified and will add their notes soon.
              </p>
            </div>
          </div>
        )}

        <div>
          <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
            {label} Check‑In
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Scheduled {new Date(checkIn.scheduledDate).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Metrics */}
        <section>
          <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
            📊 Measurements
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Weight (lbs)", key: "weight", placeholder: "185" },
              { label: "Body Fat %", key: "bodyFat", placeholder: "18" },
              { label: "Muscle Mass", key: "muscleMass", placeholder: "lbs" },
            ].map(({ label: l, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-zinc-500 mb-1">{l}</label>
                <input
                  type="number"
                  disabled={submitted}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 disabled:opacity-60"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Effort rating */}
        <section>
          <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
            ⚡ Effort & Consistency Rating
          </h2>
          <p className="text-zinc-500 text-xs mb-3">
            How would you honestly rate your effort, discipline, and consistency this period?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                disabled={submitted}
                onClick={() => setForm({ ...form, effortRating: n })}
                className={`flex-1 py-2 rounded text-sm font-montserrat font-bold border transition-colors disabled:cursor-default ${
                  form.effortRating === n
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 disabled:hover:border-zinc-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Core Metrics */}
        {!submitted && (
          <section>
            <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
              📊 Core Metrics
            </h2>
            <CoreMetricsEntry
              assessmentType={(
                checkIn.type === "DAY1"   ? "ONBOARDING" :
                checkIn.type === "DAY90"  ? "DAY90" :
                checkIn.type === "DAY180" ? "DAY180" :
                "ONGOING"
              ) as AssessmentType}
              checkInId={checkIn.id}
              allowSkip={true}
              compact={true}
            />
          </section>
        )}

        {/* Big wins */}
        <section>
          <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
            <Star size={14} className="text-yellow-500" /> Big Wins
          </h2>
          <textarea
            rows={4}
            disabled={submitted}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-600 resize-none disabled:opacity-60"
            placeholder="What are you most proud of this period? PRs, habits, mindset shifts..."
            value={form.bigWins}
            onChange={(e) => setForm({ ...form, bigWins: e.target.value })}
          />
        </section>

        {/* Areas to improve */}
        <section>
          <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
            🎯 Areas to Improve
          </h2>
          <textarea
            rows={3}
            disabled={submitted}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-600 resize-none disabled:opacity-60"
            placeholder="What held you back? What will you do differently?"
            value={form.areasToImprove}
            onChange={(e) => setForm({ ...form, areasToImprove: e.target.value })}
          />
        </section>

        {/* Motivation note */}
        <section>
          <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">
            💬 Note to Your Coach
          </h2>
          <textarea
            rows={3}
            disabled={submitted}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-red-600 resize-none disabled:opacity-60"
            placeholder="Anything else your coach should know?"
            value={form.motivationNote}
            onChange={(e) => setForm({ ...form, motivationNote: e.target.value })}
          />
        </section>

        {/* Coach notes (read-only, shown after coach completes) */}
        {checkIn.coachCompletedAt && (
          <section className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
            <h2 className="font-montserrat text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">
              📋 Coach Notes
            </h2>
            <p className="text-zinc-300 text-sm">
              Your coach has added their assessment. Check in with them at your next session.
            </p>
          </section>
        )}

        {/* Submit */}
        {!submitted && (
          <button
            onClick={submit}
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            {saving ? "Submitting..." : "Submit Check-In"}
          </button>
        )}

        {submitted && (
          <Link
            href="/dashboard"
            className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-colors text-sm"
          >
            Back to Dashboard
          </Link>
        )}

      </main>
    </div>
  );
}

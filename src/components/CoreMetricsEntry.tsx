"use client";

import { useState } from "react";
import { Save, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  CORE_METRIC_FIELDS, SECTION_LABELS, EMPTY_FORM, formToPayload,
  fmtTime, fmtHeight,
  type CoreMetricsForm, type AssessmentType, type MetricKey,
} from "@/lib/coreMetrics";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CoreMetricsEntryProps {
  assessmentType: AssessmentType;
  checkInId?: string;
  apiPath?: string;           // default: /api/member/core-metrics
  initial?: Partial<CoreMetricsForm>;
  onSaved?: (entry: Record<string, unknown>) => void;
  allowSkip?: boolean;
  compact?: boolean;          // hide section headers + descriptions
}

// ── Group fields by section ───────────────────────────────────────────────────
const SECTIONS = Array.from(
  CORE_METRIC_FIELDS.reduce((acc, f) => {
    if (!acc.has(f.section)) acc.set(f.section, []);
    acc.get(f.section)!.push(f);
    return acc;
  }, new Map<string, typeof CORE_METRIC_FIELDS[number][]>())
);

const WOD_DESCRIPTION =
  "500m Row → 40 Air Squats → 30 Sit-Ups → 20 Push-Ups (for time) + Max Pull-Up Reps";

// ── Component ─────────────────────────────────────────────────────────────────
export default function CoreMetricsEntry({
  assessmentType,
  checkInId,
  apiPath = "/api/member/core-metrics",
  initial = {},
  onSaved,
  allowSkip = true,
  compact = false,
}: CoreMetricsEntryProps) {
  const [form, setForm] = useState<CoreMetricsForm>({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["bio", "body", "strength", "cardio", "wod"])
  );

  function toggleSection(key: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function set(key: keyof CoreMetricsForm, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        assessmentType,
        checkInId,
        ...formToPayload(form),
      };
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const entry = await res.json();
      setSaved(true);
      onSaved?.(entry);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const hasAnyValue = Object.values(form).some((v) => v !== "");

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg px-4 py-3 text-emerald-400 text-sm font-semibold">
          ✓ Metrics saved successfully.
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {SECTIONS.map(([sectionKey, fields]) => {
        const isOpen = openSections.has(sectionKey);
        const sectionLabel = SECTION_LABELS[sectionKey as keyof typeof SECTION_LABELS];
        return (
          <div key={sectionKey} className="rounded-xl border border-zinc-700 overflow-hidden">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between px-5 py-3 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <span className="font-montserrat font-bold text-sm text-white">{sectionLabel}</span>
              <div className="flex items-center gap-2">
                {sectionKey === "wod" && !compact && (
                  <span className="text-xs text-zinc-500 hidden sm:block truncate max-w-xs text-right">{WOD_DESCRIPTION}</span>
                )}
                {isOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
              </div>
            </button>

            {/* WOD description banner */}
            {isOpen && sectionKey === "wod" && !compact && (
              <div className="flex items-start gap-2 px-5 py-3 bg-zinc-950 border-b border-zinc-800 text-xs text-zinc-400">
                <Info size={13} className="shrink-0 mt-0.5 text-zinc-500" />
                <span>{WOD_DESCRIPTION}</span>
              </div>
            )}

            {/* Fields */}
            {isOpen && (
              <div className="bg-zinc-950 px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fields.map((field) => (
                  <MetricInput
                    key={field.key}
                    field={field}
                    value={form[field.key as keyof CoreMetricsForm]}
                    onChange={(val) => set(field.key as keyof CoreMetricsForm, val)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Notes */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1 font-montserrat uppercase tracking-wider">Notes</label>
        <textarea
          rows={2}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
          placeholder="Any context — injuries, conditions, equipment used..."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving || saved || !hasAnyValue}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-colors text-sm"
        >
          <Save size={14} />
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Metrics"}
        </button>
        {allowSkip && !saved && (
          <span className="text-zinc-600 text-xs">
            All fields optional — fill in what you have.
          </span>
        )}
      </div>
    </div>
  );
}

// ── Single field input ────────────────────────────────────────────────────────
function MetricInput({
  field,
  value,
  onChange,
}: {
  field: typeof CORE_METRIC_FIELDS[number];
  value: string;
  onChange: (val: string) => void;
}) {
  const placeholder =
    field.type === "time" ? "MM:SS" :
    field.key === "heightIn" ? "5'10\"" :
    field.unit ? `e.g. — ${field.unit}` : "—";

  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1 leading-tight">
        {field.label}
        {field.unit && field.type !== "time" && (
          <span className="text-zinc-700 ml-1">({field.unit})</span>
        )}
      </label>
      <input
        type={field.type === "number" ? "number" : "text"}
        step={field.type === "number" ? "0.1" : undefined}
        min={field.type === "number" ? "0" : undefined}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Read-only metrics display card ────────────────────────────────────────────
export function CoreMetricsCard({
  metrics,
  label,
}: {
  metrics: Record<string, unknown>;
  label?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 overflow-hidden">
      {label && (
        <div className="bg-zinc-900 px-5 py-3 border-b border-zinc-800">
          <p className="font-montserrat font-bold text-sm text-white">{label}</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {new Date(metrics.recordedAt as string).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
      )}
      <div className="bg-zinc-950 p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
        {CORE_METRIC_FIELDS.map((f) => {
          const raw = metrics[f.key];
          if (raw == null) return null;
          let display: string;
          if (f.type === "time") display = fmtTime(raw as number);
          else if (f.key === "heightIn") display = fmtHeight(raw as number);
          else display = `${raw}${f.unit ? " " + f.unit : ""}`;
          return (
            <div key={f.key}>
              <p className="text-xs text-zinc-500">{f.label}</p>
              <p className="text-white font-semibold text-sm mt-0.5">{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Delta comparison between two assessments ──────────────────────────────────
export function CoreMetricsDelta({
  baseline,
  current,
}: {
  baseline: Record<string, unknown>;
  current: Record<string, unknown>;
}) {
  // Fields where lower = better
  const lowerBetter = new Set(["weightLbs", "bodyFatPct", "mileSec", "fourHundredSec", "wodTimeSec"]);

  return (
    <div className="rounded-xl border border-zinc-700 overflow-hidden">
      <div className="bg-zinc-900 px-5 py-3 border-b border-zinc-800">
        <p className="font-montserrat font-bold text-sm text-white">Progress vs Baseline</p>
      </div>
      <div className="bg-zinc-950 p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
        {CORE_METRIC_FIELDS.map((f) => {
          const base = baseline[f.key] as number | null;
          const curr = current[f.key] as number | null;
          if (base == null || curr == null) return null;

          const delta = curr - base;
          const improved = lowerBetter.has(f.key) ? delta < 0 : delta > 0;
          const neutral = delta === 0;

          let baseDisplay: string;
          let currDisplay: string;
          let deltaDisplay: string;

          if (f.type === "time") {
            baseDisplay = fmtTime(base);
            currDisplay = fmtTime(curr);
            const abs = Math.abs(delta);
            deltaDisplay = `${delta < 0 ? "-" : "+"}${fmtTime(abs)}`;
          } else if (f.key === "heightIn") {
            baseDisplay = fmtHeight(base);
            currDisplay = fmtHeight(curr);
            deltaDisplay = "";
          } else {
            baseDisplay = `${base}${f.unit ? " " + f.unit : ""}`;
            currDisplay = `${curr}${f.unit ? " " + f.unit : ""}`;
            const sign = delta > 0 ? "+" : "";
            deltaDisplay = `${sign}${delta.toFixed(1)}${f.unit ? " " + f.unit : ""}`;
          }

          return (
            <div key={f.key}>
              <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
              <p className="text-white font-semibold text-sm">{currDisplay}</p>
              <p className="text-xs text-zinc-600">was {baseDisplay}</p>
              {deltaDisplay && (
                <p className={`text-xs font-bold mt-0.5 ${
                  neutral ? "text-zinc-500" :
                  improved ? "text-emerald-400" : "text-red-400"
                }`}>
                  {deltaDisplay}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

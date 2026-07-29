// ── Display helpers for CoreMetrics ──────────────────────────────────────────

/** Convert total seconds → "MM:SS" */
export function fmtTime(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Convert seconds input string "MM:SS" or plain seconds → integer seconds */
export function parseTime(val: string): number | null {
  if (!val.trim()) return null;
  if (val.includes(":")) {
    const [m, s] = val.split(":").map(Number);
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

/** Convert height in inches → "5'11"" */
export function fmtHeight(inches: number | null | undefined): string {
  if (inches == null) return "—";
  const ft = Math.floor(inches / 12);
  const inn = Math.round(inches % 12);
  return `${ft}'${inn}"`;
}

/** Convert "5'11"" or "71" → inches float */
export function parseHeight(val: string): number | null {
  if (!val.trim()) return null;
  // ft'in" format
  const ftIn = val.match(/^(\d+)'(\d+)"?$/);
  if (ftIn) return parseInt(ftIn[1]) * 12 + parseInt(ftIn[2]);
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export type AssessmentType = "ONBOARDING" | "DAY90" | "DAY180" | "ONGOING";

export const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  ONBOARDING: "Baseline (Onboarding)",
  DAY90:      "90-Day Evaluation",
  DAY180:     "180-Day Evaluation",
  ONGOING:    "Progress Check",
};

export interface CoreMetricsForm {
  age: string;
  heightIn: string;    // displayed as ft'in"
  weightLbs: string;
  bodyFatPct: string;
  squatLbs: string;
  benchLbs: string;
  deadliftLbs: string;
  mileSec: string;      // "MM:SS"
  fourHundredSec: string; // "MM:SS"
  wodTimeSec: string;   // "MM:SS"
  wodPullUps: string;
  notes: string;
}

export const EMPTY_FORM: CoreMetricsForm = {
  age: "", heightIn: "", weightLbs: "", bodyFatPct: "",
  squatLbs: "", benchLbs: "", deadliftLbs: "",
  mileSec: "", fourHundredSec: "",
  wodTimeSec: "", wodPullUps: "",
  notes: "",
};

export function formToPayload(f: CoreMetricsForm) {
  return {
    age:           f.age ? parseInt(f.age) : undefined,
    heightIn:      parseHeight(f.heightIn) ?? undefined,
    weightLbs:     f.weightLbs ? parseFloat(f.weightLbs) : undefined,
    bodyFatPct:    f.bodyFatPct ? parseFloat(f.bodyFatPct) : undefined,
    squatLbs:      f.squatLbs ? parseFloat(f.squatLbs) : undefined,
    benchLbs:      f.benchLbs ? parseFloat(f.benchLbs) : undefined,
    deadliftLbs:   f.deadliftLbs ? parseFloat(f.deadliftLbs) : undefined,
    mileSec:       parseTime(f.mileSec) ?? undefined,
    fourHundredSec: parseTime(f.fourHundredSec) ?? undefined,
    wodTimeSec:    parseTime(f.wodTimeSec) ?? undefined,
    wodPullUps:    f.wodPullUps ? parseInt(f.wodPullUps) : undefined,
    notes:         f.notes || undefined,
  };
}

// Field definitions — drives both the form and the comparison table
export const CORE_METRIC_FIELDS = [
  { key: "age",            label: "Age",              unit: "yrs",   type: "number", section: "bio" },
  { key: "heightIn",       label: "Height",           unit: "",      type: "height", section: "bio" },
  { key: "weightLbs",      label: "Weight",           unit: "lbs",   type: "number", section: "body" },
  { key: "bodyFatPct",     label: "Body Fat",         unit: "%",     type: "number", section: "body" },
  { key: "squatLbs",       label: "Squat 1RM",        unit: "lbs",   type: "number", section: "strength" },
  { key: "benchLbs",       label: "Bench 1RM",        unit: "lbs",   type: "number", section: "strength" },
  { key: "deadliftLbs",    label: "Deadlift 1RM",     unit: "lbs",   type: "number", section: "strength" },
  { key: "mileSec",        label: "1-Mile Run",       unit: "MM:SS", type: "time",   section: "cardio" },
  { key: "fourHundredSec", label: "400m Run",         unit: "MM:SS", type: "time",   section: "cardio" },
  { key: "wodTimeSec",     label: "Baseline WOD Time",unit: "MM:SS", type: "time",   section: "wod" },
  { key: "wodPullUps",     label: "WOD Pull-Up Reps", unit: "reps",  type: "number", section: "wod" },
] as const;

export const SECTION_LABELS = {
  bio:      "📋 Demographics",
  body:     "⚖️ Body Composition",
  strength: "💪 Strength (1RM)",
  cardio:   "🏃 Cardio",
  wod:      "🔥 Baseline WOD",
};

export type MetricKey = typeof CORE_METRIC_FIELDS[number]["key"];

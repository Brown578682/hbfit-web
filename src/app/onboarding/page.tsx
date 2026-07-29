"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, SkipForward } from "lucide-react";
import GoalSelector, { type SelectedGoal } from "@/components/GoalSelector";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  // Step 2 — About You
  reasonsForJoining: string;
  daysPerWeek: string;
  preferredDays: string[];
  preferredTime: string;
  priorTraining: string;
  priorTrainingNotes: string;
  injuries: string;
  // Step 3 — Goals
  whatNotWorking: string;
  vision90Days: string;
  whyImportant: string;
  goalStatement: string;
  // Step 4 — Preferred Coach
  preferredCoachId: string;
  // Step 5 — Nutrition
  proteinGoalG: string;
  waterGoalOz: string;
}

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TOTAL_STEPS = 7;
const STEP_TITLES = [
  "Welcome to Honor Bound FIT",
  "About You",
  "Your Goals",
  "Your Coaches",
  "Nutrition Brief",
  "Week 1 Checklist",
  "Mission Accepted",
];

// Static coach data — shown if the API returns nothing (pre-seed)
const STATIC_COACHES: Coach[] = [
  {
    id: "randy-franklin",
    firstName: "Randy",
    lastName: "Franklin",
    title: "Head Coach · CSCS, CF-L2",
    bio: "Randy specializes in strength & conditioning and military fitness prep. With a background in competitive powerlifting and 10+ years coaching athletes of all levels, he brings intensity, structure, and a no-excuses mindset to every session.",
    photoUrl: null,
  },
  {
    id: "heather-traves",
    firstName: "Heather",
    lastName: "Traves",
    title: "Coach · NASM-CPT, Precision Nutrition L1",
    bio: "Heather focuses on functional fitness, mobility, and sustainable habit-building. She's known for meeting members where they are and building programming that fits real life — especially for those returning after injury or a long break.",
    photoUrl: null,
  },
  {
    id: "alyse-osteen",
    firstName: "Alyse",
    lastName: "O'Steen",
    title: "Coach · CF-L1, USAW",
    bio: "Alyse brings energy and technical precision to Olympic lifting and metabolic conditioning. She excels at coaching beginners through complex movements and is passionate about building confidence under the bar.",
    photoUrl: null,
  },
  {
    id: "erika-jacobs",
    firstName: "Erika",
    lastName: "Jacobs",
    title: "Coach-in-Training · ACE-CPT",
    bio: "Erika is completing her coaching certification under our mentorship program. She specializes in group motivation and body-weight training, and brings fresh energy and a community-first approach to every class.",
    photoUrl: null,
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [form, setForm] = useState<FormData>({
    reasonsForJoining: "",
    daysPerWeek: "",
    preferredDays: [],
    preferredTime: "",
    priorTraining: "",
    priorTrainingNotes: "",
    injuries: "",
    whatNotWorking: "",
    vision90Days: "",
    whyImportant: "",
    goalStatement: "",
    preferredCoachId: "",
    proteinGoalG: "",
    waterGoalOz: "100",
  });

  // Load saved progress on mount
  useEffect(() => {
    fetch("/api/member/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data?.completedAt) { router.replace("/dashboard"); return; }
        if (data?.currentStep) setStep(data.currentStep);
        if (data) {
          setForm((f) => ({
            ...f,
            reasonsForJoining: data.reasonsForJoining ?? "",
            daysPerWeek: data.daysPerWeek?.toString() ?? "",
            preferredDays: data.preferredDays ? JSON.parse(data.preferredDays) : [],
            preferredTime: data.preferredTime ?? "",
            priorTraining: data.priorTraining != null ? String(data.priorTraining) : "",
            priorTrainingNotes: data.priorTrainingNotes ?? "",
            injuries: data.injuries ?? "",
            whatNotWorking: data.whatNotWorking ?? "",
            vision90Days: data.vision90Days ?? "",
            whyImportant: data.whyImportant ?? "",
            goalStatement: data.goalStatement ?? "",
            preferredCoachId: data.preferredCoachId ?? "",
            proteinGoalG: data.proteinGoalG?.toString() ?? "",
            waterGoalOz: data.waterGoalOz?.toString() ?? "100",
          }));
        }
      })
      .catch(() => {});

    // Load coaches
    fetch("/api/coaches")
      .then((r) => r.json())
      .then((data: Coach[]) => { if (Array.isArray(data) && data.length > 0) setCoaches(data); else setCoaches(STATIC_COACHES); })
      .catch(() => setCoaches(STATIC_COACHES));
  }, [router]);

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function saveProgress(nextStep: number, complete = false) {
    setSaving(true);
    try {
      await fetch("/api/member/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: nextStep,
          complete,
          ...form,
          daysPerWeek: form.daysPerWeek ? parseInt(form.daysPerWeek) : undefined,
          preferredDays: form.preferredDays,
          priorTraining: form.priorTraining === "true" ? true : form.priorTraining === "false" ? false : undefined,
          proteinGoalG: form.proteinGoalG ? parseInt(form.proteinGoalG) : undefined,
          waterGoalOz: form.waterGoalOz ? parseInt(form.waterGoalOz) : 100,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    const nextStep = step + 1;
    await saveProgress(nextStep);
    // Save goals when leaving step 3
    if (step === 3 && selectedGoals.length > 0) {
      await fetch("/api/member/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: selectedGoals }),
      });
    }
    // Save preferredCoachId to Member when leaving step 4
    if (step === 4 && form.preferredCoachId) {
      fetch("/api/member/preferred-coach", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredCoachId: form.preferredCoachId }),
      }).catch(() => {}); // best-effort
    }
    setStep(nextStep);
  }

  async function back() {
    const prevStep = step - 1;
    await saveProgress(prevStep);
    setStep(prevStep);
  }

  async function skip() {
    const nextStep = step + 1;
    await saveProgress(nextStep);
    setStep(nextStep);
  }

  async function complete() {
    await saveProgress(TOTAL_STEPS, true);
    router.push("/dashboard");
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const isSkippable = step >= 2 && step <= TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="font-montserrat text-lg font-black tracking-widest uppercase">
          Honor Bound <span className="text-red-500">FIT</span>
        </span>
        <span className="text-zinc-500 text-sm font-montserrat">
          Step {step} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800">
        <div className="h-1 bg-red-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">

          <p className="text-zinc-500 text-xs uppercase tracking-widest font-montserrat mb-2">
            Step {step} — {STEP_TITLES[step - 1]}
          </p>

          {/* ── Step 1: Welcome ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="font-montserrat text-4xl font-extrabold uppercase tracking-tight leading-tight">
                Welcome Aboard, Warrior.
              </h1>
              <p className="text-zinc-300 leading-relaxed">
                You&apos;ve committed to a powerful 90-day journey — not just to change your body,
                but to upgrade your energy, mindset, and daily habits for life.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                This briefing takes about 5 minutes. Answer what you can — you can skip any section
                and come back later. Your answers help your coaches serve you better from day one.
              </p>
              <blockquote className="border-l-4 border-red-600 pl-4 text-zinc-400 italic">
                &ldquo;There is no substitute for hard work. There is no shortcut to becoming the
                person you want to be. And that&apos;s a good thing — because the work will change you.&rdquo;
              </blockquote>
              <button
                type="button"
                onClick={next}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Let&apos;s Go <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── Step 2: About You ────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-montserrat text-2xl font-bold uppercase">About You</h2>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  What are your top reasons for joining Honor Bound FIT?
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                  placeholder="e.g. Lose weight, build strength, find community..."
                  value={form.reasonsForJoining}
                  onChange={(e) => setForm({ ...form, reasonsForJoining: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  How many days per week can you realistically commit?
                </label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600"
                  value={form.daysPerWeek}
                  onChange={(e) => setForm({ ...form, daysPerWeek: e.target.value })}
                >
                  <option value="">Select...</option>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} days</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Preferred days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, preferredDays: toggle(form.preferredDays, d) })}
                      className={`px-4 py-2 rounded-lg text-sm font-montserrat font-bold border transition-colors ${
                        form.preferredDays.includes(d)
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Preferred time</label>
                <div className="flex gap-3">
                  {["MORNING", "AFTERNOON", "EVENING"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, preferredTime: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-montserrat font-bold border transition-colors ${
                        form.preferredTime === t
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Have you followed a structured training program before?
                </label>
                <div className="flex gap-3">
                  {[["true", "Yes"], ["false", "No"]].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm({ ...form, priorTraining: val })}
                      className={`flex-1 py-2 rounded-lg text-sm font-montserrat font-bold border transition-colors ${
                        form.priorTraining === val
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {form.priorTraining === "true" && (
                  <textarea
                    rows={2}
                    className="mt-3 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                    placeholder="Which program? What did you like or dislike?"
                    value={form.priorTrainingNotes}
                    onChange={(e) => setForm({ ...form, priorTrainingNotes: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Any injuries or limitations we should know about?
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                  placeholder="e.g. Bad left knee, lower back issues... or 'None'"
                  value={form.injuries}
                  onChange={(e) => setForm({ ...form, injuries: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Goals ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-montserrat text-2xl font-bold uppercase">Your Goals</h2>
              <p className="text-zinc-400 text-sm">
                Pick <strong className="text-white">5 goals</strong> across any categories. These
                give your coaches a clear picture of what matters most to you. You can update them
                anytime from your dashboard.
              </p>

              <GoalSelector
                initial={selectedGoals}
                onChange={useCallback((goals: SelectedGoal[]) => setSelectedGoals(goals), [])}
              />

              <div className="border-t border-zinc-800 pt-6 space-y-4">
                <p className="text-zinc-500 text-sm font-montserrat font-bold uppercase tracking-wider">
                  Add context (optional)
                </p>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    What&apos;s been frustrating you about your health or habits?
                  </label>
                  <textarea rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                    placeholder="Be honest..."
                    value={form.whatNotWorking}
                    onChange={(e) => setForm({ ...form, whatNotWorking: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    What does success look like 90 days from now?
                  </label>
                  <textarea rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                    placeholder="Paint the picture..."
                    value={form.vision90Days}
                    onChange={(e) => setForm({ ...form, vision90Days: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Why does this matter to you right now?
                  </label>
                  <textarea rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                    placeholder="The real reason..."
                    value={form.whyImportant}
                    onChange={(e) => setForm({ ...form, whyImportant: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Preferred Coach ───────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-montserrat text-2xl font-bold uppercase">Meet Your Coaches</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pick a preferred coach — someone whose background or style connects with your goals.
                This is just a preference, not a commitment. Every coach here is excellent, and
                we&apos;re a tight team. <strong className="text-white">We encourage every member
                to get to know all of our coaches and try every form of training we offer.</strong>
              </p>

              <div className="space-y-3">
                {/* "No preference" option */}
                <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  form.preferredCoachId === ""
                    ? "border-red-600 bg-red-950/20"
                    : "border-zinc-700 hover:border-zinc-500"
                }`}>
                  <input
                    type="radio"
                    name="preferredCoach"
                    value=""
                    checked={form.preferredCoachId === ""}
                    onChange={() => setForm({ ...form, preferredCoachId: "" })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-400 text-lg font-bold shrink-0">
                      ?
                    </div>
                    <div>
                      <div className="text-white font-montserrat font-bold text-sm">No preference</div>
                      <div className="text-zinc-500 text-xs mt-0.5">Assign me to any available coach</div>
                    </div>
                  </div>
                </label>

                {coaches.map((coach) => {
                  const initials = `${coach.firstName[0]}${coach.lastName[0]}`;
                  const selected = form.preferredCoachId === coach.id;
                  return (
                    <label key={coach.id} className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                      selected ? "border-red-600 bg-red-950/20" : "border-zinc-700 hover:border-zinc-500"
                    }`}>
                      <input
                        type="radio"
                        name="preferredCoach"
                        value={coach.id}
                        checked={selected}
                        onChange={() => setForm({ ...form, preferredCoachId: coach.id })}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-white text-sm font-bold font-montserrat shrink-0 overflow-hidden">
                          {coach.photoUrl
                            ? <img src={coach.photoUrl} alt={coach.firstName} className="w-full h-full object-cover" />
                            : initials
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-montserrat font-bold text-sm">
                            {coach.firstName} {coach.lastName}
                          </div>
                          {coach.title && (
                            <div className="text-red-400 text-xs font-montserrat mt-0.5">{coach.title}</div>
                          )}
                          {coach.bio && (
                            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{coach.bio}</p>
                          )}
                        </div>
                        {selected && (
                          <CheckCircle2 size={18} className="text-red-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <p className="text-zinc-600 text-xs text-center">
                You can change your preferred coach at any time from your profile settings.
              </p>
            </div>
          )}

          {/* ── Step 5: Nutrition ─────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-montserrat text-2xl font-bold uppercase">Nutrition Basics</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nutrition is the foundation. We keep it simple: <strong className="text-white">eat
                real food, not too much, and prioritize protein.</strong> We&apos;ll layer in more
                detail over time — for now, start here.
              </p>

              <div className="space-y-3 bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                {[
                  "Aim for 1g of protein per pound of body weight",
                  "Eat real food — limit processed sugar",
                  "Maintain a caloric deficit if fat loss is the goal",
                  "Track calories/macros so you know what you're eating",
                  "Hydration goal: 100 oz of water per day minimum",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Daily protein goal (g)</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                    placeholder="e.g. 185"
                    value={form.proteinGoalG}
                    onChange={(e) => setForm({ ...form, proteinGoalG: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Daily water goal (oz)</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600"
                    placeholder="100"
                    value={form.waterGoalOz}
                    onChange={(e) => setForm({ ...form, waterGoalOz: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: Week 1 Checklist ──────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="font-montserrat text-2xl font-bold uppercase">Week 1 Checklist</h2>
              <p className="text-zinc-400 text-sm">Complete these before your first session.</p>

              <div className="space-y-3">
                {[
                  { label: "Book your first class", href: "/schedule", cta: "View Schedule" },
                  { label: "Add HBFIT to your home screen (PWA)", href: null, cta: "Already here ✓" },
                  { label: "Follow us on Instagram", href: "https://instagram.com/honorboundfit", cta: "@honorboundfit" },
                  { label: "Follow us on Facebook", href: "https://facebook.com/honorboundfit", cta: "Honor Bound FIT" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4">
                    <span className="text-sm text-white">{item.label}</span>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-red-500 text-sm font-montserrat font-bold hover:text-red-400 transition-colors whitespace-nowrap ml-4">
                        {item.cta} →
                      </a>
                    ) : (
                      <span className="text-emerald-500 text-sm font-montserrat font-bold ml-4">{item.cta}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 7: Mission Accepted ──────────────────────────────── */}
          {step === 7 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl">🎖️</div>
              <h2 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight">
                Mission Accepted.
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                You came here for change. You came here for a better you. That time is now.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Over the next 90 days you&apos;ll face resistance — from your schedule, your body,
                and your own mind. But every time you choose to show up, you&apos;re proving that
                the future you want is worth it.
              </p>
              <p className="text-red-500 font-montserrat font-bold uppercase tracking-wider">
                Finish what you started.
              </p>
              <p className="text-zinc-500 text-sm">
                Your coaches will check in with you at Day 30, 60, and 90. You&apos;ll get a
                push notification when it&apos;s time.
              </p>
              <button
                type="button"
                onClick={complete}
                disabled={saving}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                {saving ? "Saving..." : "Go to My Dashboard"}
              </button>
            </div>
          )}

          {/* ── Nav buttons ──────────────────────────────────────────── */}
          {step > 1 && step < TOTAL_STEPS + 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={back}
                disabled={saving}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-montserrat font-bold disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-3">
                {isSkippable && step < TOTAL_STEPS && (
                  <button
                    type="button"
                    onClick={skip}
                    disabled={saving}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors text-sm disabled:opacity-50"
                  >
                    <SkipForward size={14} /> Skip
                  </button>
                )}
                {step < TOTAL_STEPS && (
                  <button
                    type="button"
                    onClick={next}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-montserrat font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-colors text-sm"
                  >
                    {saving ? "Saving..." : "Continue"} <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

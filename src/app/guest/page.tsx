"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "info" | "interests" | "waiver" | "success";

const INTERESTS = [
  "Group Classes",
  "Strength & Conditioning",
  "Olympic Weightlifting",
  "Open Gym",
  "Nutrition Coaching",
  "Corporate Wellness",
];

const HOW_HEARD = [
  "Google Search",
  "Instagram / Facebook",
  "Friend / Family Referral",
  "Drove By",
  "Flyer / Event",
  "Other",
];

const VISIT_TYPES = [
  { id: "free-week",  label: "Free Week Trial",  desc: "7 days of unlimited classes, on us." },
  { id: "drop-in",   label: "Drop-In Class",     desc: "Come for a single class today." },
  { id: "tour",      label: "Just Looking",      desc: "Tour the facility, no pressure." },
];

export default function GuestPassPage() {
  const [step, setStep]           = useState<Step>("info");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [countdown, setCountdown] = useState(12);

  // Step 1 — info
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [dob,       setDob]       = useState("");

  // Step 2 — interests
  const [visitType,    setVisitType]    = useState("");
  const [interests,    setInterests]    = useState<string[]>([]);
  const [howHeard,     setHowHeard]     = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  // Step 3 — waiver
  const [waiverChecked,    setWaiverChecked]    = useState(false);
  const [liabilityChecked, setLiabilityChecked] = useState(false);
  const [ageChecked,       setAgeChecked]        = useState(false);

  const canAdvanceInfo = firstName.trim() && lastName.trim() && email.trim() && phone.trim() && dob;
  const canAdvanceInterests = visitType !== "";
  const canSubmit = waiverChecked && liabilityChecked && ageChecked;

  // Auto-reset after success
  useEffect(() => {
    if (step !== "success") return;
    setCountdown(12);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); resetAll(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  const resetAll = () => {
    setStep("info");
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setDob("");
    setVisitType(""); setInterests([]); setHowHeard(""); setMarketingOptIn(true);
    setWaiverChecked(false); setLiabilityChecked(false); setAgeChecked(false);
    setError(null);
  };

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          dateOfBirth: dob,
          visitType,
          interests,
          howHeard,
          marketingOptIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); setSubmitting(false); return; }
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  // ── Progress bar ──────────────────────────────────────────────────────────
  const steps: Step[] = ["info", "interests", "waiver", "success"];
  const stepIdx = steps.indexOf(step);

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (step === "success") {
    const vt = VISIT_TYPES.find(v => v.id === visitType);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle2 size={72} className="text-green-500 mx-auto" />
          <div>
            <p className="text-red-500 font-montserrat font-bold text-xs uppercase tracking-widest mb-2">You're In</p>
            <h1 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight text-white">
              Welcome, {firstName}.
            </h1>
            <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
              Your guest pass is confirmed. Check your email — we sent you all the details including our address and what to expect.
            </p>
          </div>

          <div className="border border-white/10 bg-white/5 p-5 text-left space-y-3">
            <p className="text-xs font-montserrat font-bold uppercase tracking-widest text-white/40">Your Visit</p>
            <p className="text-white font-bold">{vt?.label}</p>
            <p className="text-zinc-400 text-sm">{vt?.desc}</p>
            <div className="pt-2 border-t border-white/10 text-sm text-zinc-400 space-y-1">
              <p>📍 45 Centreport Pkwy, Suite 137, Fredericksburg, VA</p>
              <p>📞 Questions? <a href="mailto:rich@honorboundfit.com" className="text-white underline">rich@honorboundfit.com</a></p>
            </div>
          </div>

          <p className="text-zinc-600 text-xs">
            Returning to start in {countdown}s…
          </p>
          <button onClick={resetAll} className="text-zinc-400 text-sm underline">
            Register another guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-red-500 font-montserrat font-bold text-xs uppercase tracking-widest mb-2">
            Honor Bound FIT
          </p>
          <h1 className="font-montserrat text-4xl font-extrabold uppercase tracking-tight">
            Guest Pass
          </h1>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            First visit? Get started here — takes 2 minutes. Your waiver will be on file and we'll be expecting you.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {["Your Info", "Interests", "Waiver"].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i < stepIdx ? "bg-red-500" : i === stepIdx ? "bg-red-500/60" : "bg-white/10"
              )} />
              {i < 2 && <div className={cn(
                "w-1 h-1 rounded-full flex-shrink-0",
                i < stepIdx ? "bg-red-500" : "bg-white/10"
              )} />}
            </div>
          ))}
        </div>
        <p className="text-xs font-montserrat uppercase tracking-widest text-white/30 mb-6">
          Step {stepIdx + 1} of 3 — {["Your Info", "Interests", "Waiver"][stepIdx]}
        </p>

        {/* ── STEP 1: INFO ──────────────────────────────────────────────────── */}
        {step === "info" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">First Name</label>
                <input
                  type="text" autoComplete="given-name" value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">Last Name</label>
                <input
                  type="text" autoComplete="family-name" value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">Email</label>
              <input
                type="email" autoComplete="email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">Phone</label>
              <input
                type="tel" autoComplete="tel" value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-white placeholder-white/20 px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="(540) 555-0100"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-2">
                Date of Birth <span className="text-white/20 normal-case font-normal">(must be 18+)</span>
              </label>
              <input
                type="date" value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0, 10)}
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
              />
            </div>

            <button
              onClick={() => { if (canAdvanceInfo) setStep("interests"); }}
              disabled={!canAdvanceInfo}
              className="w-full bg-white text-black font-montserrat font-extrabold text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity active:scale-[0.98]"
            >
              Next — Interests <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── STEP 2: INTERESTS ─────────────────────────────────────────────── */}
        {step === "interests" && (
          <div className="space-y-6">
            {/* Visit type */}
            <div>
              <p className="text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-3">
                What brings you in today?
              </p>
              <div className="space-y-2">
                {VISIT_TYPES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setVisitType(v.id)}
                    className={cn(
                      "w-full text-left border px-4 py-4 transition-all",
                      visitType === v.id
                        ? "border-red-500 bg-red-500/10"
                        : "border-white/10 bg-zinc-900 hover:border-white/20"
                    )}
                  >
                    <p className="font-montserrat font-bold text-sm uppercase tracking-wide text-white">{v.label}</p>
                    <p className="text-zinc-400 text-xs mt-1">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests (optional) */}
            <div>
              <p className="text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-3">
                What are you interested in? <span className="text-white/20 normal-case font-normal">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={cn(
                      "text-xs font-montserrat font-bold uppercase tracking-wider px-3 py-2 border transition-all",
                      interests.includes(i)
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* How did you hear */}
            <div>
              <p className="text-xs font-montserrat font-bold uppercase tracking-wider text-white/50 mb-3">
                How did you hear about us? <span className="text-white/20 normal-case font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {HOW_HEARD.map(h => (
                  <button
                    key={h}
                    onClick={() => setHowHeard(h)}
                    className={cn(
                      "text-xs font-montserrat font-bold uppercase tracking-wider px-3 py-3 border text-center transition-all",
                      howHeard === h
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-white/10 text-zinc-400 hover:border-white/20"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Marketing opt-in */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setMarketingOptIn(p => !p)}
                className={cn(
                  "mt-0.5 w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  marketingOptIn ? "border-red-500 bg-red-500" : "border-white/30 bg-transparent"
                )}
              >
                {marketingOptIn && <span className="text-white text-xs font-black">✓</span>}
              </div>
              <span className="text-zinc-400 text-xs leading-relaxed">
                I'd like to receive class schedules, events, and updates from Honor Bound FIT.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("info")}
                className="flex-1 border border-white/10 text-zinc-400 font-montserrat font-bold text-sm uppercase tracking-wider py-4 hover:border-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => { if (canAdvanceInterests) setStep("waiver"); }}
                disabled={!canAdvanceInterests}
                className="flex-[2] bg-white text-black font-montserrat font-extrabold text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity active:scale-[0.98]"
              >
                Next — Waiver <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: WAIVER ────────────────────────────────────────────────── */}
        {step === "waiver" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-xs font-montserrat font-bold uppercase tracking-wider text-white/50">
                Liability Waiver & Release
              </p>
            </div>

            {/* Waiver summary card */}
            <div className="border border-white/10 bg-zinc-950 p-5 space-y-4 text-sm text-zinc-400 leading-relaxed max-h-64 overflow-y-auto">
              <p className="text-white font-bold text-xs uppercase tracking-widest">
                Read carefully — this affects your legal rights
              </p>
              <p>
                By signing this waiver, <strong className="text-white">{firstName} {lastName}</strong>, you acknowledge and agree that:
              </p>
              <ul className="space-y-3 list-none">
                {[
                  "Physical fitness activities involve inherent risks of injury, including serious injury or death.",
                  "You are voluntarily participating in all HBFIT activities including group classes, strength training, conditioning, open gym, and any other programs offered.",
                  "You RELEASE and HOLD HARMLESS Honor Bound FIT LLC, Rich Brown, its coaches, staff, and affiliates from any and all claims arising from your participation, INCLUDING claims based on negligence.",
                  "You represent that you are in adequate health to participate and have not been advised against physical activity by a physician.",
                  "This waiver is binding on your heirs, estate, and personal representatives.",
                  "Virginia law governs this agreement. If any provision is found unenforceable, the remainder remains in effect.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-zinc-500 text-xs pt-2">
                This is a summary. View the{" "}
                <a href="/waiver" target="_blank" className="text-white underline">
                  full liability waiver
                </a>{" "}
                before signing.
                Honor Bound FIT LLC · 45 Centreport Pkwy Suite 137, Fredericksburg, VA 22406
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              {[
                {
                  checked: waiverChecked,
                  set: setWaiverChecked,
                  text: `I, ${firstName} ${lastName}, have read the Liability Waiver and Release, understand its terms, and voluntarily agree to be bound by it.`,
                },
                {
                  checked: liabilityChecked,
                  set: setLiabilityChecked,
                  text: "I understand that I am releasing Honor Bound FIT LLC and its staff from liability, including claims based on their negligence, to the fullest extent permitted by Virginia law.",
                },
                {
                  checked: ageChecked,
                  set: setAgeChecked,
                  text: "I confirm that I am 18 years of age or older and legally competent to sign this waiver.",
                },
              ].map(({ checked, set, text }, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <div
                    onClick={() => set((p: boolean) => !p)}
                    className={cn(
                      "mt-0.5 w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      checked ? "border-red-500 bg-red-500" : "border-white/30"
                    )}
                  >
                    {checked && <span className="text-white text-xs font-black">✓</span>}
                  </div>
                  <span className="text-zinc-300 text-xs leading-relaxed">{text}</span>
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm border border-red-500/30 bg-red-500/10 px-4 py-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setError(null); setStep("interests"); }}
                className="flex-1 border border-white/10 text-zinc-400 font-montserrat font-bold text-sm uppercase tracking-wider py-4 hover:border-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-montserrat font-extrabold text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-2 disabled:opacity-30 transition-all active:scale-[0.98]"
              >
                {submitting ? "Submitting…" : "Sign & Submit"}
              </button>
            </div>

            <p className="text-zinc-600 text-xs text-center">
              Your signature is recorded with a timestamp and IP address for legal purposes.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

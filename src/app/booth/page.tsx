"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";

type Step = "form" | "waiver" | "success";

export default function BoothPage() {
  const [step, setStep]             = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [countdown, setCountdown]   = useState(10);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [dob,       setDob]       = useState("");

  const [waiverChecked,    setWaiverChecked]    = useState(false);
  const [liabilityChecked, setLiabilityChecked] = useState(false);
  const [ageChecked,       setAgeChecked]       = useState(false);

  const canAdvance = firstName.trim() && lastName.trim() && email.trim() && phone.trim() && dob;
  const canSubmit  = waiverChecked && liabilityChecked && ageChecked;

  // Auto-reset after success
  useEffect(() => {
    if (step !== "success") return;
    setCountdown(10);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); resetAll(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  const resetAll = () => {
    setStep("form");
    setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setDob("");
    setWaiverChecked(false); setLiabilityChecked(false); setAgeChecked(false);
    setError(null);
    setCountdown(10);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    try {
      const res = await fetch("/api/booth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, dateOfBirth: dob }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); setSubmitting(false); return; }
      setStep("success");
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === "AbortError") {
        setError("Connection timed out. Please check the internet connection and try again.");
      } else {
        setError("Network error. Please try again.");
      }
      setSubmitting(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle2 size={72} className="text-green-600 mx-auto" />
          <div>
            <h1 className="font-montserrat text-4xl font-extrabold uppercase text-gray-900 tracking-tight">
              You&apos;re In, {firstName}!
            </h1>
            <p className="text-gray-600 mt-3 text-base leading-relaxed font-semibold">
              We&apos;ve got your info. Our team will be in touch — and if you crushed those reps, we hope to see you on the floor.
            </p>
          </div>

          <div className="bg-gray-100 border-2 border-gray-300 p-6 text-left space-y-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-montserrat font-bold">Next Steps</p>
            <p className="text-gray-900 text-sm leading-relaxed font-semibold">
              Visit <span className="text-red-600 font-extrabold">honorboundfit.com</span> to learn more about membership — including our <span className="font-extrabold">GAP Program</span> for veterans, active duty, first responders, and healthcare workers.
            </p>
          </div>

          {/* Countdown bar */}
          <div className="space-y-2">
            <p className="text-gray-500 text-sm font-montserrat font-bold uppercase tracking-widest">
              Returning to start in {countdown}s…
            </p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 10) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={resetAll}
            className="w-full border-2 border-gray-400 hover:border-gray-700 text-gray-700 hover:text-gray-900 font-montserrat font-extrabold uppercase tracking-wider py-4 text-sm transition-colors"
          >
            Start Over Now
          </button>
        </div>
      </div>
    );
  }

  // ── Waiver Step ───────────────────────────────────────────────────────────
  if (step === "waiver") {
    return (
      <div className="min-h-screen bg-white px-4 py-10">
        <div className="max-w-lg mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Shield size={28} className="text-red-600" />
            <div>
              <h1 className="font-montserrat font-extrabold uppercase text-2xl tracking-tight text-gray-900">Waiver &amp; Consent</h1>
              <p className="text-gray-500 text-sm mt-0.5 font-semibold">Please read carefully and check all three boxes to proceed.</p>
            </div>
          </div>

          {/* Waiver text */}
          <div className="bg-gray-50 border-2 border-gray-300 p-5 space-y-4 text-sm text-gray-700 leading-relaxed max-h-64 overflow-y-auto">
            <p className="font-extrabold text-gray-900 uppercase text-xs tracking-widest">Assumption of Risk &amp; Release of Liability</p>
            <p>
              I, the undersigned, voluntarily choose to participate in physical fitness activities including but not limited to push-ups, pull-ups, and related exercises at the Honor Bound FIT promotional event (&quot;the Activity&quot;).
            </p>
            <p>
              I acknowledge that physical exercise involves inherent risks of injury, including but not limited to muscle strains, joint injuries, and cardiovascular events. I represent that I am in good physical health and have no medical condition that would prevent safe participation in the Activity.
            </p>
            <p>
              In consideration for being permitted to participate, I hereby release, waive, discharge, and covenant not to sue <strong>Honor Bound FIT, LLC</strong>, its owners, officers, employees, agents, and volunteers (collectively &quot;HBFIT&quot;) from any and all liability, claims, demands, actions, or causes of action arising from my participation in the Activity, including those caused by the ordinary negligence of HBFIT.
            </p>
            <p>
              I agree to follow all instructions given by HBFIT staff and to stop immediately if I feel pain, dizziness, or discomfort. I understand that HBFIT staff are not licensed medical professionals and that any guidance given is general in nature.
            </p>
            <p>
              This release is binding on my heirs, estate, and assigns. If any portion of this agreement is held invalid, the remainder shall continue in full force and effect.
            </p>
            <p className="font-extrabold text-gray-900 uppercase text-xs tracking-widest mt-2">Media &amp; Likeness</p>
            <p>
              I grant Honor Bound FIT permission to photograph and/or video record my participation in the Activity and consent to the use of such images or recordings for promotional purposes including social media, website content, and marketing materials, without compensation.
            </p>
            <p className="font-extrabold text-gray-900 uppercase text-xs tracking-widest mt-2">Marketing Communications</p>
            <p>
              I consent to Honor Bound FIT contacting me via email and/or phone regarding membership, programming, events, and promotions. I may withdraw consent at any time by contacting HBFIT directly.
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            {[
              {
                checked: ageChecked,
                onChange: setAgeChecked,
                label: "I confirm that I am 18 years of age or older and voluntarily choose to participate in this physical activity.",
              },
              {
                checked: liabilityChecked,
                onChange: setLiabilityChecked,
                label: "I have read and understand the Assumption of Risk and Release of Liability above, and I agree to its terms.",
              },
              {
                checked: waiverChecked,
                onChange: setWaiverChecked,
                label: "I consent to media/likeness use and to being contacted by Honor Bound FIT regarding membership and promotions.",
              },
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-4 cursor-pointer group">
                <div
                  className={cn(
                    "w-7 h-7 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors rounded",
                    item.checked ? "bg-red-600 border-red-600" : "border-gray-400 group-hover:border-gray-700 bg-white"
                  )}
                  onClick={() => item.onChange(!item.checked)}
                >
                  {item.checked && <CheckCircle2 size={16} className="text-white" />}
                </div>
                <span className="text-base text-gray-800 leading-snug font-semibold">{item.label}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border-2 border-red-400 p-4 text-red-700 text-sm font-semibold">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="flex-1 border-2 border-gray-400 hover:border-gray-700 text-gray-600 hover:text-gray-900 font-montserrat font-extrabold uppercase tracking-wider py-5 text-sm transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex-[2] bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-montserrat font-extrabold uppercase tracking-wider py-5 text-lg transition-colors shadow-lg"
            >
              {submitting ? "Submitting…" : "I Agree — Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Info Form Step ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <p className="text-red-600 font-montserrat font-black text-sm uppercase tracking-[0.25em]">Honor Bound FIT</p>
          <h1 className="font-montserrat font-extrabold uppercase text-5xl tracking-tight leading-none text-gray-900">
            Think You<br />Got Reps?
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto font-semibold">
            Step up, knock out your best set of push-ups or pull-ups, and get entered into our giveaway. Drop your info below to participate.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700 text-sm font-extrabold uppercase tracking-widest">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First"
                autoComplete="given-name"
                className="w-full bg-white border-2 border-gray-400 focus:border-red-600 text-gray-900 text-lg px-4 py-4 outline-none transition-colors placeholder:text-gray-300 rounded font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-700 text-sm font-extrabold uppercase tracking-widest">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last"
                autoComplete="family-name"
                className="w-full bg-white border-2 border-gray-400 focus:border-red-600 text-gray-900 text-lg px-4 py-4 outline-none transition-colors placeholder:text-gray-300 rounded font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-extrabold uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="w-full bg-white border-2 border-gray-400 focus:border-red-600 text-gray-900 text-lg px-4 py-4 outline-none transition-colors placeholder:text-gray-300 rounded font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-extrabold uppercase tracking-widest">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(540) 000-0000"
              autoComplete="tel"
              className="w-full bg-white border-2 border-gray-400 focus:border-red-600 text-gray-900 text-lg px-4 py-4 outline-none transition-colors placeholder:text-gray-300 rounded font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-700 text-sm font-extrabold uppercase tracking-widest">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              className="w-full bg-white border-2 border-gray-400 focus:border-red-600 text-gray-900 text-lg px-4 py-4 outline-none transition-colors rounded font-semibold [color-scheme:light]"
            />
          </div>
        </div>

        <button
          onClick={() => setStep("waiver")}
          disabled={!canAdvance}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-montserrat font-extrabold uppercase tracking-wider py-6 text-xl transition-colors shadow-lg rounded"
        >
          Next — Review Waiver
        </button>

        <p className="text-gray-400 text-sm text-center leading-relaxed font-semibold">
          By continuing you&apos;ll be asked to review and sign a brief activity waiver.
        </p>
      </div>
    </div>
  );
}

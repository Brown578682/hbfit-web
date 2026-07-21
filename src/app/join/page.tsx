"use client";
import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Upload, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_PLANS } from "@/lib/plans";

const STEPS = ["Select Plan", "Your Info", "Verify", "Payment"];

const GAP_DOC_REQUIREMENTS: Record<string, string[]> = {
  VETERAN: ["DD-214 (Certificate of Release/Discharge)", "VA ID Card (VIC or VHIC)", "Uniformed Services ID (retiree)"],
  ACTIVE_DUTY: ["CAC (Common Access Card)", "Current Military Orders", "Leave and Earnings Statement (LES)"],
  GUARD_RESERVE: ["National Guard / Reserve ID Card", "Current Orders or Activation Paperwork"],
  FIRST_RESPONDER: ["Agency-issued Badge + Photo ID", "Government Employee ID", "Department Letterhead"],
  MEDICAL_STUDENT: ["Medical School Student ID", "Enrollment Verification Letter"],
  CLERGY: ["Ordination Certificate", "Church/Organization Letterhead"],
};

type FormData = {
  planSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  householdMembers: { firstName: string; lastName: string; dob: string }[];
  gapDocFile: File | null;
  agreeTerms: boolean;
};

function JoinPageInner() {
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    planSlug: defaultPlan,
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", address: "", city: "", state: "VA", zip: "",
    householdMembers: [],
    gapDocFile: null,
    agreeTerms: false,
  });

  const selectedPlan = MEMBERSHIP_PLANS.find(p => p.slug === form.planSlug);
  const isGap = selectedPlan?.isGap ?? false;
  const gapCategory = (selectedPlan as any)?.gapCategory as string | undefined;

  const update = (key: keyof FormData, value: any) => setForm(f => ({ ...f, [key]: value }));

  const addFamilyMember = () => {
    const current = form.householdMembers;
    const newTotal = 1 + current.length + 1;
    const baseCents = selectedPlan?.price ?? 100_00;
    const addOnCents = 50_00;
    const capCents = 200_00;
    const billable = Math.min(baseCents + current.length * addOnCents, capCents);
    if (billable >= capCents) return; // already at cap, still can add members (they're free)
    update("householdMembers", [...current, { firstName: "", lastName: "", dob: "" }]);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    update("gapDocFile", file);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("planSlug", form.planSlug);
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("dob", form.dob);
      fd.append("address", form.address);
      fd.append("city", form.city);
      fd.append("state", form.state);
      fd.append("zip", form.zip);
      fd.append("householdMembers", JSON.stringify(form.householdMembers));
      if (form.gapDocFile) fd.append("gapDoc", form.gapDocFile);

      const res = await fetch("/api/join", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.pending) {
        window.location.href = "/join/pending";
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!form.planSlug;
    if (step === 1) return !!(form.firstName && form.lastName && form.email && form.phone);
    if (step === 2) return isGap ? !!form.gapDocFile : true;
    if (step === 3) return form.agreeTerms;
    return false;
  };

  const householdTotal = (() => {
    const base = selectedPlan?.price ?? 100_00;
    const addon = 50_00;
    const cap = 200_00;
    return Math.min(base + form.householdMembers.length * addon, cap);
  })();

  return (
    <div className="pt-16 min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                i < step ? "bg-white text-black border-white" :
                i === step ? "border-white text-white" :
                "border-white/20 text-white/30"
              )}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div className={cn("text-xs ml-2 font-medium hidden sm:block", i === step ? "text-white" : "text-white/30")}>
                {s}
              </div>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-px mx-3", i < step ? "bg-white" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        {/* Step 0: Plan Selection */}
        {step === 0 && (
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">Choose Your Plan</h1>
            <p className="text-white/50 text-sm mb-8">All plans are month-to-month. No contracts.</p>
            <div className="space-y-3">
              {MEMBERSHIP_PLANS.map((plan) => (
                <button
                  key={plan.slug}
                  onClick={() => update("planSlug", plan.slug)}
                  className={cn(
                    "w-full text-left border p-5 transition-all",
                    form.planSlug === plan.slug
                      ? "border-white bg-white/5"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-montserrat font-bold text-white text-sm">{plan.name}</div>
                      <div className="text-white/50 text-xs mt-1">{plan.description}</div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-white font-bold text-lg font-montserrat">${plan.price / 100}</div>
                      <div className="text-white/40 text-xs">/mo</div>
                    </div>
                  </div>
                  {plan.requiresApproval && (
                    <div className="mt-2 text-xs text-white/40 flex items-center gap-1">
                      <AlertCircle size={11} />
                      Requires verification — billing starts after approval
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">Your Information</h1>
            <p className="text-white/50 text-sm mb-8">Tell us about yourself. We won&apos;t spam you.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">First Name *</label>
                  <input value={form.firstName} onChange={e => update("firstName", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Last Name *</label>
                  <input value={form.lastName} onChange={e => update("lastName", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => update("dob", e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Address</label>
                <input value={form.address} onChange={e => update("address", e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">City</label>
                  <input value={form.city} onChange={e => update("city", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">State</label>
                  <input value={form.state} onChange={e => update("state", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">ZIP</label>
                  <input value={form.zip} onChange={e => update("zip", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm" />
                </div>
              </div>

              {/* Family members */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white text-sm font-medium">Family Members</div>
                    <div className="text-white/40 text-xs">$50/each · household cap $200/mo</div>
                  </div>
                  <button onClick={addFamilyMember} className="text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-3 py-1.5 transition-colors">
                    + Add Member
                  </button>
                </div>
                {form.householdMembers.map((m, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                    <input placeholder="First" value={m.firstName}
                      onChange={e => { const hm = [...form.householdMembers]; hm[i].firstName = e.target.value; update("householdMembers", hm); }}
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                    <input placeholder="Last" value={m.lastName}
                      onChange={e => { const hm = [...form.householdMembers]; hm[i].lastName = e.target.value; update("householdMembers", hm); }}
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                    <input type="date" value={m.dob}
                      onChange={e => { const hm = [...form.householdMembers]; hm[i].dob = e.target.value; update("householdMembers", hm); }}
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                  </div>
                ))}
                {form.householdMembers.length > 0 && (
                  <div className="text-right text-white/60 text-sm mt-2">
                    Household total: <span className="text-white font-bold">${householdTotal / 100}/mo</span>
                    {householdTotal === 200_00 && <span className="text-white/40 text-xs ml-2">(capped)</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: GAP Verification or skip */}
        {step === 2 && (
          <div>
            {isGap ? (
              <>
                <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">Verify Your Status</h1>
                <p className="text-white/50 text-sm mb-6">Upload one of the following documents. Staff will review within 24 hours — no billing until approved.</p>
                {gapCategory && GAP_DOC_REQUIREMENTS[gapCategory] && (
                  <div className="bg-zinc-900 border border-white/10 p-4 mb-6">
                    <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Accepted Documents</div>
                    <ul className="space-y-1">
                      {GAP_DOC_REQUIREMENTS[gapCategory].map(doc => (
                        <li key={doc} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-white/30 mt-0.5">·</span>{doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <label className={cn(
                  "block border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
                  form.gapDocFile ? "border-white/40 bg-white/5" : "border-white/20 hover:border-white/40"
                )}>
                  <Upload size={28} className="mx-auto text-white/40 mb-3" />
                  {form.gapDocFile ? (
                    <div>
                      <div className="text-white text-sm font-medium">{form.gapDocFile.name}</div>
                      <div className="text-white/40 text-xs mt-1">{(form.gapDocFile.size / 1024).toFixed(0)} KB</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-white text-sm">Click to upload or drag & drop</div>
                      <div className="text-white/40 text-xs mt-1">PDF, JPG, or PNG · Max 10MB</div>
                    </div>
                  )}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
                </label>
                <p className="text-white/30 text-xs mt-4 text-center">
                  Documents are stored securely and used only for verification. They are not shared with third parties.
                </p>
              </>
            ) : (
              <div className="text-center py-12">
                <Check size={48} className="mx-auto text-white/40 mb-4" />
                <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">You&apos;re Good to Go</h1>
                <p className="text-white/50 text-sm">No verification required for this plan. Continue to payment.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 3 && selectedPlan && (
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">Review & Pay</h1>
            <p className="text-white/50 text-sm mb-8">You&apos;ll be redirected to Stripe&apos;s secure checkout.</p>

            <div className="bg-zinc-900 border border-white/10 p-6 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Plan</span>
                <span className="text-white font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Name</span>
                <span className="text-white">{form.firstName} {form.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Email</span>
                <span className="text-white">{form.email}</span>
              </div>
              {form.householdMembers.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Family Members</span>
                  <span className="text-white">{form.householdMembers.length} additional</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold">Monthly Total</span>
                <span className="text-white font-bold text-lg">${householdTotal / 100}/mo</span>
              </div>
              {isGap && (
                <div className="text-white/40 text-xs flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  GAP plan — billing begins after staff verifies your document (within 24 hrs)
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={form.agreeTerms} onChange={e => update("agreeTerms", e.target.checked)}
                className="mt-0.5 accent-white" />
              <span className="text-white/60 text-sm leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-white underline underline-offset-2">Terms and Conditions</Link>
                {" "}and{" "}
                <Link href="/privacy" target="_blank" className="text-white underline underline-offset-2">Privacy Policy</Link>.
                I understand my membership is month-to-month and I can cancel at any time.
              </span>
            </label>

            {error && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-400 text-sm p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-white/50 hover:text-white text-sm uppercase tracking-wide transition-colors">
              ← Back
            </button>
          ) : (
            <Link href="/membership" className="text-white/50 hover:text-white text-sm uppercase tracking-wide transition-colors">
              ← Plans
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className={cn(
                "flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-8 py-4 transition-all",
                canAdvance() ? "bg-white text-black hover:bg-white/90" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance() || loading}
              className={cn(
                "flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-8 py-4 transition-all",
                canAdvance() && !loading ? "bg-white text-black hover:bg-white/90" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : "Proceed to Payment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <JoinPageInner />
    </Suspense>
  );
}

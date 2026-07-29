"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Check, Upload, ChevronRight, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_PLANS } from "@/lib/plans";

const STEPS = ["Select Plan", "Your Info", "Verify", "Payment"];

const GAP_DOC_REQUIREMENTS = [
  "DD-214 or VA ID Card (Veterans)",
  "CAC or current military orders (Active Duty / Guard / Reserve)",
  "Agency-issued badge or government employee ID (First Responders)",
  "Any official documentation showing qualifying status",
];

type StudentEntry = { firstName: string; lastName: string; dob: string };

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
  referredByName: string;
  householdMembers: { firstName: string; lastName: string; dob: string; email: string; phone: string }[];
  gapDocFile: File | null;
  standInTheGap: boolean;
  agreeTerms: boolean;
  agreeHealth: boolean;
  agreePhoto: boolean;
  // Homeschool Heroes fields
  students: StudentEntry[];
  isParentGuardian: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalInfo: string;
  minorPhotoConsent: boolean;
};

// ── All form state lives here ─────────────────────────────────────────────────
function JoinForm({ defaultPlan }: { defaultPlan: string }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    planSlug: defaultPlan,
    firstName: "", lastName: "", email: "", phone: "",
    dob: "", address: "", city: "", state: "VA", zip: "",
    referredByName: "",
    householdMembers: [],
    gapDocFile: null,
    standInTheGap: false,
    agreeTerms: false,
    agreeHealth: false,
    agreePhoto: false,
    students: [{ firstName: "", lastName: "", dob: "" }],
    isParentGuardian: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    medicalInfo: "",
    minorPhotoConsent: false,
  });

  const selectedPlan = MEMBERSHIP_PLANS.find(p => p.slug === form.planSlug);
  const isGap = selectedPlan?.isGap ?? false;
  const isHomeschool = form.planSlug === "homeschool-heroes";

  const update = (key: keyof FormData, value: any) =>
    setForm(f => ({ ...f, [key]: value }));

  const trackEvent = (name: string, params?: Record<string, string | number>) => {
    if (typeof window !== "undefined" && (window as any).gtag)
      (window as any).gtag("event", name, params);
  };

  const addFamilyMember = () => {
    const cur = form.householdMembers;
    update("householdMembers", [...cur, { firstName: "", lastName: "", dob: "", email: "", phone: "" }]);
  };

  const addStudent = () => {
    if (form.students.length >= 3) return;
    update("students", [...form.students, { firstName: "", lastName: "", dob: "" }]);
  };

  const updateStudent = (i: number, field: keyof StudentEntry, value: string) => {
    const updated = form.students.map((s, idx) => idx === i ? { ...s, [field]: value } : s);
    update("students", updated);
  };

  const removeStudent = (i: number) => {
    if (form.students.length <= 1) return;
    update("students", form.students.filter((_, idx) => idx !== i));
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    update("gapDocFile", e.target.files?.[0] ?? null);
  }, []);

  const householdTotal = Math.min(
    (selectedPlan?.price ?? 100_00) + form.householdMembers.length * 50_00,
    200_00
  );

  const canAdvance = () => {
    if (step === 0) return !!form.planSlug;
    if (step === 1) {
      const baseOk = !!(form.firstName && form.lastName && form.email && form.phone);
      if (!baseOk) return false;
      if (isHomeschool) {
        const studentsOk = form.students.every(s => s.firstName && s.lastName && s.dob);
        const emergencyOk = !!(form.emergencyContactName && form.emergencyContactPhone && form.emergencyContactRelationship);
        return studentsOk && form.isParentGuardian && emergencyOk;
      }
      return true;
    }
    if (step === 2) return isGap ? !!form.gapDocFile : true;
    if (step === 3) return form.agreeTerms && form.agreeHealth;
    return false;
  };

  const advance = () => {
    if (!canAdvance()) return;
    if (step === 0) trackEvent("select_plan", { plan_name: selectedPlan?.name ?? form.planSlug });
    if (step === 1) trackEvent("join_info_complete");
    if (step === 2) trackEvent("join_verification_complete", { is_gap: isGap ? 1 : 0 });
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      trackEvent("begin_checkout", { plan_name: selectedPlan?.name ?? "", value: householdTotal / 100, currency: "USD" });
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
      if (form.referredByName.trim()) fd.append("referredByName", form.referredByName.trim());
      if (form.gapDocFile) fd.append("gapDoc", form.gapDocFile);
      fd.append("standInTheGap", form.standInTheGap ? "true" : "false");
      fd.append("agreeTerms", form.agreeTerms ? "true" : "false");
      fd.append("agreeHealth", form.agreeHealth ? "true" : "false");
      fd.append("agreePhoto", form.agreePhoto ? "true" : "false");
      if (isHomeschool) {
        fd.append("students", JSON.stringify(form.students));
        fd.append("emergencyContactName", form.emergencyContactName);
        fd.append("emergencyContactPhone", form.emergencyContactPhone);
        fd.append("emergencyContactRelationship", form.emergencyContactRelationship);
        fd.append("medicalInfo", form.medicalInfo);
        fd.append("minorPhotoConsent", form.minorPhotoConsent ? "true" : "false");
      }

      const res = await fetch("/api/join", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (data.checkoutUrl) {
        trackEvent("proceed_to_payment", { plan_name: selectedPlan?.name ?? "" });
        window.location.href = data.checkoutUrl;
      } else if (data.pending) {
        window.location.href = "/join/pending";
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Step progress bar */}
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
              <div className={cn("text-xs ml-2 font-medium hidden sm:block",
                i === step ? "text-white" : "text-white/30")}>
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-3", i < step ? "bg-white" : "bg-white/10")} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Plan Selection ── */}
        {step === 0 && (
          <div>
            <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">
              Choose Your Plan
            </h1>
            <p className="text-white/50 text-sm mb-8">All plans are 4-week billing cycles. No contracts.</p>
            <div className="space-y-3">
              {MEMBERSHIP_PLANS.map((plan) => {
                const selected = form.planSlug === plan.slug;
                return (
                  <label
                    key={plan.slug}
                    className={cn(
                      "block border p-5 cursor-pointer transition-all select-none",
                      selected ? "border-white bg-white/5" : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <input
                      type="radio"
                      name="planSlug"
                      value={plan.slug}
                      checked={selected}
                      onChange={() => update("planSlug", plan.slug)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-montserrat font-bold text-white text-sm flex items-center gap-2">
                          {selected && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white shrink-0">
                              <Check size={10} className="text-black" />
                            </span>
                          )}
                          {plan.name}
                        </div>
                        <div className="text-white/50 text-xs mt-1">{plan.description}</div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-white font-bold text-lg font-montserrat">${plan.price / 100}</div>
                        <div className="text-white/40 text-xs">/4 wks</div>
                      </div>
                    </div>
                    {plan.requiresApproval && (
                      <div className="mt-2 text-xs text-white/40 flex items-center gap-1">
                        <AlertCircle size={11} />
                        Requires verification — billing starts after approval
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 1: Personal Info ── */}
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
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">
                  Referred by <span className="text-white/30 normal-case tracking-normal">(optional)</span>
                </label>
                <input value={form.referredByName} onChange={e => update("referredByName", e.target.value)}
                  placeholder="First and last name of the member who referred you"
                  className="w-full bg-zinc-900 border border-white/20 text-white px-4 py-3 focus:outline-none focus:border-white/50 text-sm placeholder-white/20" />
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white text-sm font-medium">Family Members</div>
                    <div className="text-white/40 text-xs">All additional members included · $200/4-wk family cap</div>
                  </div>
                  <button type="button" onClick={addFamilyMember}
                    className="text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-3 py-1.5 transition-colors">
                    + Add Member
                  </button>
                </div>
                {form.householdMembers.map((m, i) => (
                  <div key={i} className="border border-white/10 p-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-xs uppercase tracking-wider">Family Member {i + 1}</span>
                      <button type="button" onClick={() => {
                        const hm = [...form.householdMembers];
                        hm.splice(i, 1);
                        update("householdMembers", hm);
                      }} className="text-white/30 hover:text-red-400 text-xs transition-colors">Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="First name" value={m.firstName}
                        onChange={e => { const hm = [...form.householdMembers]; hm[i].firstName = e.target.value; update("householdMembers", hm); }}
                        className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                      <input placeholder="Last name" value={m.lastName}
                        onChange={e => { const hm = [...form.householdMembers]; hm[i].lastName = e.target.value; update("householdMembers", hm); }}
                        className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="email" placeholder="Email" value={m.email}
                        onChange={e => { const hm = [...form.householdMembers]; hm[i].email = e.target.value; update("householdMembers", hm); }}
                        className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                      <input type="tel" placeholder="Phone" value={m.phone}
                        onChange={e => { const hm = [...form.householdMembers]; hm[i].phone = e.target.value; update("householdMembers", hm); }}
                        className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs block mb-1">Date of Birth</label>
                      <input type="date" value={m.dob}
                        onChange={e => { const hm = [...form.householdMembers]; hm[i].dob = e.target.value; update("householdMembers", hm); }}
                        className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
                    </div>
                  </div>
                ))}
                {form.householdMembers.length > 0 && (
                  <div className="text-right text-white/60 text-sm mt-2">
                    Household total: <span className="text-white font-bold">${householdTotal / 100}/4 wks</span>
                    {form.householdMembers.length > 0 && <span className="text-white/40 text-xs ml-2">({form.householdMembers.length} family member{form.householdMembers.length !== 1 ? "s" : ""})</span>}
                  </div>
                )}
              </div>
            </div>

            {/* ── Homeschool Heroes: Student Information ── */}
            {isHomeschool && (
              <div className="mt-8 border border-white/20 bg-zinc-950">
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Required · Homeschool Heroes</div>
                  <div className="font-montserrat font-extrabold text-white uppercase text-base">
                    Student Information (Homeschool Heroes)
                  </div>
                </div>
                <div className="px-5 py-5 space-y-5">
                  {/* Students */}
                  {form.students.map((student, i) => (
                    <div key={i} className="border border-white/10 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-xs uppercase tracking-wider">Student {i + 1}</span>
                        {form.students.length > 1 && (
                          <button type="button" onClick={() => removeStudent(i)}
                            className="text-white/30 hover:text-red-400 text-xs transition-colors">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">First Name *</label>
                          <input value={student.firstName}
                            onChange={e => updateStudent(i, "firstName", e.target.value)}
                            className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Last Name *</label>
                          <input value={student.lastName}
                            onChange={e => updateStudent(i, "lastName", e.target.value)}
                            className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Date of Birth *</label>
                        <input type="date" value={student.dob}
                          onChange={e => updateStudent(i, "dob", e.target.value)}
                          className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
                      </div>
                    </div>
                  ))}
                  {form.students.length < 3 && (
                    <button type="button" onClick={addStudent}
                      className="flex items-center gap-2 text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-4 py-2 transition-colors">
                      <PlusCircle size={13} /> Add Another Student
                      <span className="text-white/30">({form.students.length}/3)</span>
                    </button>
                  )}

                  {/* Parent/Guardian confirmation */}
                  <label className="flex items-start gap-3 cursor-pointer group mt-2">
                    <div className={cn(
                      "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                      form.isParentGuardian
                        ? "bg-white border-white"
                        : "bg-transparent border-white/30 group-hover:border-white/60"
                    )}>
                      {form.isParentGuardian && <Check size={12} className="text-black" />}
                    </div>
                    <input type="checkbox" className="sr-only"
                      checked={form.isParentGuardian}
                      onChange={e => update("isParentGuardian", e.target.checked)} />
                    <span className="text-white/70 text-sm leading-relaxed">
                      I am the parent or legal guardian of the student(s) listed above and have authority to enroll them and sign on their behalf. *
                    </span>
                  </label>

                  {/* Emergency Contact */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Emergency Contact *</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Contact Name *</label>
                        <input value={form.emergencyContactName}
                          onChange={e => update("emergencyContactName", e.target.value)}
                          className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Phone *</label>
                        <input type="tel" value={form.emergencyContactPhone}
                          onChange={e => update("emergencyContactPhone", e.target.value)}
                          className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50" />
                      </div>
                    </div>
                    <div>
                      <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Relationship *</label>
                      <input value={form.emergencyContactRelationship}
                        onChange={e => update("emergencyContactRelationship", e.target.value)}
                        placeholder="e.g. Spouse, Parent, Sibling"
                        className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50 placeholder-white/20" />
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="text-white/60 text-xs uppercase tracking-wider block mb-1.5">Medical Information *</label>
                    <textarea
                      value={form.medicalInfo}
                      onChange={e => update("medicalInfo", e.target.value)}
                      rows={3}
                      placeholder="Please list any allergies, medical conditions, medications, or physical restrictions we should know about. Write NONE if not applicable."
                      className="w-full bg-zinc-900 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/50 placeholder-white/20 resize-none" />
                  </div>

                  {/* Minor Photo Consent (optional) */}
                  <div className="border-t border-white/10 pt-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={cn(
                        "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                        form.minorPhotoConsent
                          ? "bg-white border-white"
                          : "bg-transparent border-white/30 group-hover:border-white/60"
                      )}>
                        {form.minorPhotoConsent && <Check size={12} className="text-black" />}
                      </div>
                      <input type="checkbox" className="sr-only"
                        checked={form.minorPhotoConsent}
                        onChange={e => update("minorPhotoConsent", e.target.checked)} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white text-sm font-medium leading-snug">
                            I consent to Honor Bound FIT using photos or videos of my child(ren) for marketing and social media.
                          </span>
                          <span className="text-white/30 text-xs uppercase tracking-wide shrink-0">Optional</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Stand in the GAP */}
            {!isGap && (
              <div className="mt-6 border border-white/10 bg-zinc-950">
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-1">Optional · $25/4-week cycle</div>
                  <div className="font-montserrat font-extrabold text-white uppercase text-base">
                    Stand in the GAP
                  </div>
                </div>
                {/* Body */}
                <div className="px-5 py-4 pb-6">
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    Our Guardian Angel Program offers a discounted rate of $75/4 wks to veterans, active duty service members, first responders, and other qualifying community members. The difference between the standard rate and their discounted rate is covered by members like you.
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">
                    Adding $25 to your recurring membership helps us keep that commitment strong — and ensure that those who have given the most never have to hesitate to walk through our doors.
                  </p>
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={cn(
                      "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                      form.standInTheGap
                        ? "bg-white border-white"
                        : "bg-transparent border-white/30 group-hover:border-white/60"
                    )}>
                      {form.standInTheGap && <Check size={12} className="text-black" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.standInTheGap}
                      onChange={e => update("standInTheGap", e.target.checked)}
                    />
                    <div>
                      <div className="text-white text-sm font-medium leading-snug">
                        Yes — add $25/4 wks to my membership to Stand in the GAP
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        Recurring. Cancel anytime alongside your membership.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: GAP Verification or pass-through ── */}
        {step === 2 && (
          <div>
            {isGap ? (
              <>
                <h1 className="font-montserrat text-3xl font-extrabold text-white uppercase mb-2">Verify Your Status</h1>
                <p className="text-white/50 text-sm mb-6">
                  Upload one of the following documents. Staff will review within 24 hours — no billing until approved.
                </p>
                <div className="bg-zinc-900 border border-white/10 p-4 mb-6">
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-2">Accepted Documents</div>
                  <ul className="space-y-1">
                    {GAP_DOC_REQUIREMENTS.map(doc => (
                      <li key={doc} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-white/30 mt-0.5">·</span>{doc}
                      </li>
                    ))}
                  </ul>
                </div>
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
                  Documents are stored securely and used only for verification. Not shared with third parties.
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

        {/* ── Step 3: Review & Pay ── */}
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
              {isHomeschool && form.students.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Students</span>
                  <span className="text-white">{form.students.map(s => `${s.firstName} ${s.lastName}`).join(", ")}</span>
                </div>
              )}
              {form.householdMembers.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Family Members</span>
                  <span className="text-white">{form.householdMembers.length} additional</span>
                </div>
              )}
              {form.referredByName.trim() && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Referred by</span>
                  <span className="text-white">{form.referredByName}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold">4-Week Total</span>
                <span className="text-white font-bold text-lg">${householdTotal / 100}/4 wks</span>
              </div>
              {form.standInTheGap && (
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-white/60">Stand in the GAP donation</span>
                  <span className="text-emerald-400 font-medium">+$25/4 wks</span>
                </div>
              )}
              {isGap && (
                <div className="text-white/40 text-xs flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  GAP plan — billing begins after staff verifies your document (within 24 hrs)
                </div>
              )}
              {form.householdMembers.length > 0 && (
                <div className="text-white/40 text-xs flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Family plan — staff will confirm household members at check-in
                </div>
              )}
            </div>

            {/* ── Legal Consent Checkboxes ── */}
            <div className="space-y-4 mb-6">
              {/* 1. Terms & Waiver */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                  form.agreeTerms
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30 group-hover:border-white/60"
                )}>
                  {form.agreeTerms && <Check size={12} className="text-black" />}
                </div>
                <input type="checkbox" className="sr-only"
                  checked={form.agreeTerms}
                  onChange={e => update("agreeTerms", e.target.checked)} />
                <span className="text-white/70 text-sm leading-relaxed">
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-white underline underline-offset-2">Terms &amp; Conditions</Link>
                  {" "}and{" "}
                  <Link href="/waiver" target="_blank" className="text-white underline underline-offset-2">Liability Waiver &amp; Release</Link>
                  , including the assumption of risk and release of liability for injury, illness, or death, including claims arising from Honor Bound FIT&apos;s negligence. *
                </span>
              </label>

              {/* 2. Health Confirmation */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                  form.agreeHealth
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30 group-hover:border-white/60"
                )}>
                  {form.agreeHealth && <Check size={12} className="text-black" />}
                </div>
                <input type="checkbox" className="sr-only"
                  checked={form.agreeHealth}
                  onChange={e => update("agreeHealth", e.target.checked)} />
                <span className="text-white/70 text-sm leading-relaxed">
                  I confirm I am in good physical health, have no medical condition that would make exercise unsafe without medical supervision, and will inform HBFIT staff of any relevant health limitations. *
                </span>
              </label>

              {/* 3. Photo Consent (optional) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  "mt-0.5 w-5 h-5 shrink-0 border flex items-center justify-center transition-colors",
                  form.agreePhoto
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30 group-hover:border-white/60"
                )}>
                  {form.agreePhoto && <Check size={12} className="text-black" />}
                </div>
                <input type="checkbox" className="sr-only"
                  checked={form.agreePhoto}
                  onChange={e => update("agreePhoto", e.target.checked)} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/70 text-sm leading-relaxed">
                      I consent to Honor Bound FIT using photos or videos of me for marketing and social media.
                    </span>
                    <span className="text-white/30 text-xs uppercase tracking-wide shrink-0">Optional</span>
                  </div>
                </div>
              </label>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-400 text-sm p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-10">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="text-white/50 hover:text-white text-sm uppercase tracking-wide transition-colors">
              ← Back
            </button>
          ) : (
            <Link href="/membership" className="text-white/50 hover:text-white text-sm uppercase tracking-wide transition-colors">
              ← Plans
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={advance}
              disabled={!canAdvance()}
              className={cn(
                "flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-8 py-4 transition-all",
                canAdvance()
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance() || loading}
              className={cn(
                "flex items-center gap-2 font-bold text-sm uppercase tracking-widest px-8 py-4 transition-all",
                canAdvance() && !loading
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : "Proceed to Payment"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function JoinPage() {
  return <JoinForm defaultPlan="" />;
}

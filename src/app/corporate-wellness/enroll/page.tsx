"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Loader2, AlertCircle, CheckCircle2, ChevronRight, Building2, UserCheck, Users } from "lucide-react";

type Employee = { firstName: string; lastName: string; email: string };

type FormData = {
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  planTier: "SMALL" | "MEDIUM" | "LARGE";
  managerParticipates: boolean;
  employees: Employee[];
};

const TIER_LIMITS = { SMALL: 5, MEDIUM: 15, LARGE: 50 };
const TIER_PRICES = { SMALL: "$250", MEDIUM: "$750", LARGE: "$2,500" };
const TIER_LABELS = { SMALL: "Up to 5 employees", MEDIUM: "Up to 15 employees", LARGE: "Up to 50 employees" };

const emptyEmployee = (): Employee => ({ firstName: "", lastName: "", email: "" });

export default function CorporateEnrollPage() {
  const [form, setForm] = useState<FormData>({
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    planTier: "SMALL",
    managerParticipates: false,
    employees: [emptyEmployee()],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // When manager participates, one seat is consumed by them — reduce available employee rows
  const seatLimit = form.managerParticipates
    ? TIER_LIMITS[form.planTier] - 1
    : TIER_LIMITS[form.planTier];

  const totalSeats = TIER_LIMITS[form.planTier];

  const usedSeats = form.employees.length + (form.managerParticipates ? 1 : 0);

  const updateEmployee = useCallback((index: number, field: keyof Employee, value: string) => {
    setForm((prev) => {
      const employees = [...prev.employees];
      employees[index] = { ...employees[index], [field]: value };
      return { ...prev, employees };
    });
  }, []);

  const addEmployee = useCallback(() => {
    setForm((prev) => {
      if (prev.employees.length >= seatLimit) return prev;
      return { ...prev, employees: [...prev.employees, emptyEmployee()] };
    });
  }, [seatLimit]);

  const removeEmployee = useCallback((index: number) => {
    setForm((prev) => {
      if (prev.employees.length <= 1) return prev;
      return { ...prev, employees: prev.employees.filter((_, i) => i !== index) };
    });
  }, []);

  const handleTierChange = useCallback((tier: FormData["planTier"]) => {
    setForm((prev) => {
      const newSeatLimit = prev.managerParticipates ? TIER_LIMITS[tier] - 1 : TIER_LIMITS[tier];
      return {
        ...prev,
        planTier: tier,
        employees: prev.employees.slice(0, newSeatLimit),
      };
    });
  }, []);

  const handleManagerParticipatesToggle = useCallback((participates: boolean) => {
    setForm((prev) => {
      const newSeatLimit = participates ? TIER_LIMITS[prev.planTier] - 1 : TIER_LIMITS[prev.planTier];
      return {
        ...prev,
        managerParticipates: participates,
        employees: prev.employees.slice(0, newSeatLimit),
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.companyName.trim() || !form.contactEmail.trim()) {
      setError("Company name and contact email are required.");
      return;
    }
    if (form.employees.some((emp) => !emp.firstName.trim() || !emp.lastName.trim() || !emp.email.trim())) {
      setError("All employee rows must have a first name, last name, and email.");
      return;
    }
    if (form.managerParticipates) {
      // manager email will also be added as an employee — check for duplicate in employee list
      const dupEmail = form.employees.find(
        (e) => e.email.toLowerCase() === form.contactEmail.toLowerCase()
      );
      if (dupEmail) {
        setError("Your email is already in the employee list. Since you're participating, remove it from the roster — we'll handle your account automatically.");
        return;
      }
    }
    if (usedSeats > totalSeats) {
      setError(`Your ${form.planTier} plan supports up to ${totalSeats} total participants (including you).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/corporate/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 py-24">
        <div className="max-w-lg w-full text-center">
          <CheckCircle2 className="text-green-500 mx-auto mb-6" size={56} />
          <p className="text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-3">Enrollment Submitted</p>
          <h1 className="font-montserrat font-black text-white text-4xl uppercase tracking-tight mb-6">
            You&rsquo;re all set.
          </h1>
          <p className="text-zinc-300 font-lora leading-relaxed mb-4">
            Your corporate wellness enrollment has been received. Each employee on your list will receive an invitation email shortly with instructions to complete their setup.
          </p>
          {form.managerParticipates && (
            <p className="text-zinc-300 font-lora leading-relaxed mb-4">
              You&rsquo;ll also receive a separate invitation to set up your own member account — you can use your same work email to log in to both your member portal and manage the corporate account.
            </p>
          )}
          <p className="text-zinc-400 font-lora leading-relaxed mb-10">
            A member of our team will reach out within 24 hours to confirm your account and discuss next steps.
          </p>
          <a
            href="/"
            className="inline-block bg-red-600 text-white font-montserrat font-black text-sm uppercase tracking-widest px-10 py-4 hover:bg-red-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-red-600" size={20} />
            <span className="text-zinc-500 text-xs tracking-widest uppercase font-montserrat">Corporate Wellness</span>
          </div>
          <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl uppercase tracking-tight mb-3">
            Enroll Your Team
          </h1>
          <p className="text-zinc-400 font-lora text-lg leading-relaxed">
            Fill out your company info and list your employees below. Each person will receive an invitation email to complete their own setup.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-12 space-y-12">

        {/* Plan Selection */}
        <section>
          <h2 className="font-montserrat font-black text-white text-xl uppercase tracking-widest mb-2">
            Select Your Plan
          </h2>
          <p className="text-zinc-500 text-sm font-lora mb-6">Your bill adjusts when your team size changes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["SMALL", "MEDIUM", "LARGE"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => handleTierChange(tier)}
                className={`border p-6 text-left transition-all ${
                  form.planTier === tier
                    ? "border-red-600 bg-red-600/10"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                <p className={`font-montserrat font-black text-3xl mb-1 ${form.planTier === tier ? "text-white" : "text-zinc-300"}`}>
                  {TIER_PRICES[tier]}
                </p>
                <p className="text-zinc-500 text-xs font-montserrat uppercase tracking-wider mb-2">per month</p>
                <p className={`text-sm font-lora ${form.planTier === tier ? "text-zinc-200" : "text-zinc-400"}`}>
                  {TIER_LABELS[tier]}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Company / Contact Info */}
        <section>
          <h2 className="font-montserrat font-black text-white text-xl uppercase tracking-widest mb-6">
            Account Manager Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-2">Company Name *</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-2">First Name *</label>
              <input
                type="text"
                required
                value={form.contactFirstName}
                onChange={(e) => setForm((p) => ({ ...p, contactFirstName: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={form.contactLastName}
                onChange={(e) => setForm((p) => ({ ...p, contactLastName: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora"
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-2">Work Email *</label>
              <input
                type="email"
                required
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora"
                placeholder="jane@company.com"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs tracking-widest uppercase font-montserrat mb-2">Phone</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora"
                placeholder="(540) 555-0100"
              />
            </div>
          </div>
        </section>

        {/* Manager Participation Toggle */}
        <section>
          <h2 className="font-montserrat font-black text-white text-xl uppercase tracking-widest mb-2">
            Will You Participate?
          </h2>
          <p className="text-zinc-500 text-sm font-lora mb-6">
            As the account manager, you can either join the program yourself or simply manage the account without holding a seat.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Not participating */}
            <button
              type="button"
              onClick={() => handleManagerParticipatesToggle(false)}
              className={`border p-6 text-left transition-all flex items-start gap-4 ${
                !form.managerParticipates
                  ? "border-red-600 bg-red-600/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              <Users
                size={24}
                className={`mt-0.5 shrink-0 ${!form.managerParticipates ? "text-red-500" : "text-zinc-600"}`}
              />
              <div>
                <p className={`font-montserrat font-black text-sm uppercase tracking-wide mb-1 ${!form.managerParticipates ? "text-white" : "text-zinc-400"}`}>
                  Managing Only
                </p>
                <p className={`text-sm font-lora leading-snug ${!form.managerParticipates ? "text-zinc-300" : "text-zinc-500"}`}>
                  I&rsquo;ll manage the account but won&rsquo;t use a membership seat. All {TIER_LIMITS[form.planTier]} seats go to employees.
                </p>
              </div>
            </button>

            {/* Participating */}
            <button
              type="button"
              onClick={() => handleManagerParticipatesToggle(true)}
              className={`border p-6 text-left transition-all flex items-start gap-4 ${
                form.managerParticipates
                  ? "border-red-600 bg-red-600/10"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              <UserCheck
                size={24}
                className={`mt-0.5 shrink-0 ${form.managerParticipates ? "text-red-500" : "text-zinc-600"}`}
              />
              <div>
                <p className={`font-montserrat font-black text-sm uppercase tracking-wide mb-1 ${form.managerParticipates ? "text-white" : "text-zinc-400"}`}>
                  Participating
                </p>
                <p className={`text-sm font-lora leading-snug ${form.managerParticipates ? "text-zinc-300" : "text-zinc-500"}`}>
                  I&rsquo;ll hold one seat myself. I&rsquo;ll use my work email for both my member account and account management.{" "}
                  {TIER_LIMITS[form.planTier] - 1} seats remain for employees.
                </p>
              </div>
            </button>
          </div>

          {/* Seat counter */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: totalSeats }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-sm ${
                    i < usedSeats ? "bg-red-600" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
            <span className="text-zinc-500 text-xs font-montserrat uppercase tracking-widest ml-1">
              {usedSeats} / {totalSeats} seats
            </span>
          </div>

          {form.managerParticipates && (
            <div className="mt-4 bg-zinc-900 border border-zinc-700 p-4">
              <p className="text-zinc-300 text-sm font-lora leading-relaxed">
                <span className="text-white font-semibold">Your seat:</span> You&rsquo;ll receive a separate onboarding invitation at{" "}
                <span className="text-white">{form.contactEmail || "your work email"}</span>. That same email will be your login for both your member portal and the corporate account dashboard.
              </p>
            </div>
          )}
        </section>

        {/* Employee Roster */}
        <section>
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="font-montserrat font-black text-white text-xl uppercase tracking-widest">
                {form.managerParticipates ? "Other Employees" : "Employee Roster"}
              </h2>
              <p className="text-zinc-500 text-sm font-lora mt-1">
                {form.employees.length} of {seatLimit} remaining seat{seatLimit !== 1 ? "s" : ""} filled
              </p>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_40px] gap-3 mb-2">
            {["First Name", "Last Name", "Work Email", ""].map((h) => (
              <p key={h} className="text-zinc-600 text-xs tracking-widest uppercase font-montserrat">{h}</p>
            ))}
          </div>

          <div className="space-y-3">
            {form.employees.map((emp, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={emp.firstName}
                  onChange={(e) => updateEmployee(i, "firstName", e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora text-sm w-full"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={emp.lastName}
                  onChange={(e) => updateEmployee(i, "lastName", e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora text-sm w-full"
                />
                <input
                  type="email"
                  required
                  placeholder="employee@company.com"
                  value={emp.email}
                  onChange={(e) => updateEmployee(i, "email", e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-lora text-sm w-full"
                />
                <button
                  type="button"
                  onClick={() => removeEmployee(i)}
                  disabled={form.employees.length === 1}
                  className="flex items-center justify-center text-zinc-600 hover:text-red-500 disabled:opacity-20 transition-colors h-12"
                  title="Remove row"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {form.employees.length < seatLimit && (
            <button
              type="button"
              onClick={addEmployee}
              className="mt-4 flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-montserrat uppercase tracking-widest transition-colors"
            >
              <Plus size={16} />
              Add Employee
            </button>
          )}

          {form.employees.length >= seatLimit && seatLimit > 0 && (
            <p className="mt-4 text-zinc-500 text-xs font-lora">
              {form.managerParticipates
                ? `Seat limit reached (you hold 1 seat; ${seatLimit} remain for employees). Upgrade your plan to add more.`
                : "Plan limit reached. Upgrade your plan to add more employees."}
            </p>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-950 border border-red-800 p-4">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm font-lora">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-zinc-900 pt-8">
          <p className="text-zinc-500 text-sm font-lora mb-6">
            After submitting, each employee will receive an invitation email to complete their own onboarding.
            {form.managerParticipates && " You'll receive your own invitation as well."}
            {" "}A member of our team will follow up with you within 24 hours to finalize billing.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-3 bg-red-600 text-white font-montserrat font-black text-sm uppercase tracking-widest px-10 py-4 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <>Submit Enrollment <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

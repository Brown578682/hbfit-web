"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, Users, RefreshCw, AlertTriangle,
  CheckCircle2, ChevronRight, X, Plus, Loader2, ShieldCheck,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface HouseholdMember {
  id: string;
  firstName: string;
  lastName: string;
  isMinor: boolean;
  email: string | null;
}

interface SwitchablePlan {
  slug: string;
  name: string;
  price: number;
  description: string;
}

interface MembershipData {
  membership: {
    id: string;
    plan: string;
    planSlug: string;
    isGap: boolean;
    status: string;
    stripeSubscriptionId: string | null;
    amountCents: number | null;
    nextBillingDate: string | null;
    cancelAtPeriodEnd: boolean;
  };
  householdMembers: HouseholdMember[];
  switchablePlans: SwitchablePlan[];
  addOnCents: number;
  capCents: number | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; text: string; ok: boolean }[]>([]);
  let _id = 0;
  const show = useCallback((text: string, ok = true) => {
    const id = ++_id;
    setToasts(p => [...p, { id, text, ok }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, show };
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ManageMembershipPage() {
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { toasts, show } = useToast();

  // Modals
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Add member form + confirm state
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', dob: '', email: '' });
  const [pendingAdd, setPendingAdd] = useState<{ form: typeof addForm; isMinor: boolean; costLine: string } | null>(null);

  // Plan change confirm state
  const [pendingPlan, setPendingPlan] = useState<SwitchablePlan | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/member/manage-membership");
      if (!res.ok) { setError("Unable to load membership data."); return; }
      setData(await res.json());
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(action: string, extra: object = {}) {
    setBusy(action);
    try {
      const res = await fetch("/api/member/manage-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!res.ok && res.status !== 200) { show(d.error ?? "Something went wrong.", false); return false; }
      await load();
      return true;
    } catch { show("Network error — please try again.", false); return false; }
    finally { setBusy(null); }
  }

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="text-red-500" size={36} />
      <p className="text-zinc-400">{error || "No active membership found."}</p>
      <Link href="/dashboard/settings" className="text-red-400 underline text-sm">Back to Settings</Link>
    </div>
  );

  const { membership: ms, householdMembers, switchablePlans, addOnCents, capCents } = data;
  const totalMembers = 1 + householdMembers.length;
  const capReached = capCents != null && ms.amountCents != null && ms.amountCents >= capCents;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[200] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg text-sm font-montserrat font-semibold shadow-lg ${t.ok ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {t.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard/settings" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Settings
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="font-montserrat font-bold text-sm uppercase tracking-wider">Manage Membership</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">

        {/* ── Current Plan ──────────────────────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <h2 className="font-montserrat font-bold text-lg uppercase tracking-widest flex items-center gap-2">
            <CreditCard size={18} className="text-red-500" /> Current Plan
          </h2>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-montserrat font-extrabold text-2xl text-white">{ms.plan}</p>
                {ms.isGap && <span className="bg-yellow-400/10 text-yellow-400 text-xs font-montserrat font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={11} /> GAP</span>}
              </div>
              <p className="text-zinc-400 text-sm mt-1">
                {ms.amountCents != null ? `${fmt(ms.amountCents)}/cycle` : "—"}
                {capCents && <span className="text-zinc-600 ml-2">(family cap: {fmt(capCents)})</span>}
              </p>
              {ms.nextBillingDate && (
                <p className="text-zinc-500 text-xs mt-1">
                  {ms.cancelAtPeriodEnd
                    ? <span className="text-amber-400">⚠ Cancels {fmtDate(ms.nextBillingDate)}</span>
                    : `Renews ${fmtDate(ms.nextBillingDate)}`}
                </p>
              )}
            </div>
            <span className={`text-xs font-montserrat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              ms.status === "ACTIVE"   ? "bg-green-950 text-green-400 border border-green-800" :
              ms.status === "PAST_DUE" ? "bg-amber-950 text-amber-400 border border-amber-800" :
              "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}>
              {ms.cancelAtPeriodEnd ? "Canceling" : ms.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {/* Change plan */}
            {switchablePlans.length > 0 && !ms.cancelAtPeriodEnd && (
              <button onClick={() => setShowChangePlan(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
                <RefreshCw size={13} /> Change Plan
              </button>
            )}

            {/* Update payment method — Stripe portal */}
            <button onClick={async () => {
              setBusy("payment");
              const res = await fetch("/api/member/billing-portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flow: "payment_method" }) });
              const d = await res.json();
              if (d.url) window.location.href = d.url;
              else show("Unable to open billing portal.", false);
              setBusy(null);
            }} disabled={busy === "payment"}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50">
              {busy === "payment" ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
              Update Payment Method
            </button>

            {/* Cancel / Reactivate */}
            {ms.stripeSubscriptionId && (
              ms.cancelAtPeriodEnd ? (
                <button onClick={async () => { if (await act("reactivate")) show("Membership reactivated."); }}
                  disabled={!!busy}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-900/40 hover:bg-green-800/50 border border-green-700 text-green-300 font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50">
                  {busy === "reactivate" ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  Reactivate
                </button>
              ) : (
                <button onClick={() => setShowCancel(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-300 font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
                  <X size={13} /> Cancel Membership
                </button>
              )
            )}
          </div>
        </section>

        {/* ── Household Members ─────────────────────────────────────────────── */}
        <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-montserrat font-bold text-lg uppercase tracking-widest flex items-center gap-2">
              <Users size={18} className="text-red-500" /> Household Members
            </h2>
            {!ms.cancelAtPeriodEnd && (
              <button onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-red-400 hover:text-red-300 transition-colors">
                <Plus size={14} /> Add Member
              </button>
            )}
          </div>

          {/* Primary (you) */}
          <div className="flex items-center justify-between py-3 border-b border-zinc-800">
            <div>
              <p className="text-white font-montserrat font-bold text-sm">You (Primary)</p>
              <p className="text-zinc-500 text-xs">{ms.plan}</p>
            </div>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-montserrat">Primary</span>
          </div>

          {householdMembers.length === 0 ? (
            <p className="text-zinc-500 text-sm">No additional household members.</p>
          ) : (
            <div className="space-y-1">
              {householdMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                  <div>
                    <p className="text-white text-sm font-montserrat font-semibold">{m.firstName} {m.lastName}</p>
                    <p className="text-zinc-500 text-xs">
                      {m.isMinor ? "Minor" : "Adult"}
                      {m.email && ` · ${m.email}`}
                      {!capReached && <span className="text-zinc-600 ml-2">+{fmt(addOnCents)}/cycle</span>}
                      {capReached && <span className="text-green-600 ml-2">included (cap)</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => setRemovingId(m.id)}
                    disabled={!!busy}
                    className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30 p-1">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {capCents && (
            <p className="text-zinc-600 text-xs">
              {totalMembers} member{totalMembers !== 1 ? "s" : ""} · {fmt(addOnCents)}/cycle each · family cap {fmt(capCents)}/cycle
              {capReached && <span className="text-green-500 ml-1">— cap reached, additional members are free</span>}
            </p>
          )}
        </section>

      </main>

      {/* ── Change Plan Modal ──────────────────────────────────────────────── */}
      {showChangePlan && !pendingPlan && (
        <Modal title="Change Plan" onClose={() => setShowChangePlan(false)}>
          <p className="text-zinc-400 text-sm mb-5">
            Select a plan below. You&apos;ll see the exact billing impact before anything is confirmed.
            {ms.isGap && ' GAP discount applies to Base plan rate.'}
          </p>
          <div className="space-y-3">
            {switchablePlans.map(p => (
              <button key={p.slug}
                disabled={!!busy}
                onClick={() => setPendingPlan(p)}
                className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors text-left disabled:opacity-50">
                <div>
                  <p className="font-montserrat font-bold text-white text-sm">{p.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{p.description}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="font-montserrat font-bold text-white">{fmt(p.price)}</p>
                  <p className="text-zinc-500 text-xs">/cycle</p>
                </div>
                <ChevronRight size={16} className="text-zinc-500 ml-2" />
              </button>
            ))}
          </div>
          {ms.isGap && (
            <p className="text-yellow-500/70 text-xs mt-4 flex items-start gap-1.5">
              <ShieldCheck size={13} className="mt-0.5 shrink-0" />
              To change your GAP eligibility category or upgrade to a non-GAP rate, contact staff.
            </p>
          )}
        </Modal>
      )}

      {/* ── Change Plan Confirm ────────────────────────────────────────────── */}
      {pendingPlan && (
        <Modal title="Confirm Plan Change" onClose={() => setPendingPlan(null)}>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Current plan</span>
              <span className="text-white font-semibold">{ms.plan} — {ms.amountCents != null ? fmt(ms.amountCents) : '—'}/cycle</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">New plan</span>
              <span className="text-white font-semibold">{pendingPlan.name} — {fmt(pendingPlan.price)}/cycle</span>
            </div>
            {householdMembers.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Family add-ons ({householdMembers.length})</span>
                <span className="text-white font-semibold">+{fmt(Math.min(householdMembers.length * addOnCents, capCents ? Math.max(0, capCents - pendingPlan.price) : householdMembers.length * addOnCents))}/cycle</span>
              </div>
            )}
          </div>
          <p className="text-zinc-400 text-sm mb-5">
            Your plan changes immediately and your next invoice will be prorated. Your family add-ons will be recalculated automatically.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setPendingPlan(null)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors">
              Go Back
            </button>
            <button disabled={!!busy} onClick={async () => {
              if (await act('change_plan', { planSlug: pendingPlan.slug })) {
                show(`Switched to ${pendingPlan.name}.`);
                setPendingPlan(null);
                setShowChangePlan(false);
              }
            }}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {busy === 'change_plan' ? <Loader2 size={13} className="animate-spin" /> : null}
              Confirm Change
            </button>
          </div>
        </Modal>
      )}

      {/* ── Add Member Modal ───────────────────────────────────────────────── */}
      {showAddMember && !pendingAdd && (
        <Modal title="Add Household Member" onClose={() => setShowAddMember(false)}>
          <form onSubmit={async e => {
            e.preventDefault();
            if (!addForm.firstName || !addForm.lastName) { show('First and last name are required.', false); return; }
            const dobDate = addForm.dob ? new Date(addForm.dob) : null;
            const age = dobDate ? (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25) : 99;
            const isMinor = age < 18;
            if (!isMinor && !addForm.email) { show('Email is required for adult family members.', false); return; }
            // Compute cost line for confirmation step
            let costLine: string;
            if (capReached) {
              costLine = 'No charge — your household has reached the family cap.';
            } else {
              const newTotal = (ms.amountCents ?? 0) + addOnCents;
              const cappedTotal = capCents ? Math.min(newTotal, capCents) : newTotal;
              costLine = `Your billing will increase by ${fmt(addOnCents)}/cycle (${fmt(ms.amountCents ?? 0)} → ${fmt(cappedTotal)}/cycle).`;
            }
            setPendingAdd({ form: addForm, isMinor, costLine });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider font-montserrat block mb-1.5">First Name *</label>
                <input value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider font-montserrat block mb-1.5">Last Name *</label>
                <input value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider font-montserrat block mb-1.5">Date of Birth <span className="text-zinc-600 normal-case">(optional — used to determine minor status)</span></label>
              <input type="date" value={addForm.dob} onChange={e => setAddForm(p => ({ ...p, dob: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            {(() => {
              const dobDate = addForm.dob ? new Date(addForm.dob) : null;
              const age = dobDate ? (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25) : 99;
              if (age < 18) return null;
              return (
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wider font-montserrat block mb-1.5">
                    Email * <span className="text-zinc-600 normal-case">(they&apos;ll receive a setup link)</span>
                  </label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-zinc-600" />
                </div>
              );
            })()}
            <button type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-lg text-sm transition-colors">
              Review &amp; Confirm →
            </button>
          </form>
        </Modal>
      )}

      {/* ── Add Member Confirm ─────────────────────────────────────────────── */}
      {pendingAdd && (
        <Modal title="Confirm — Add Household Member" onClose={() => { setPendingAdd(null); setShowAddMember(false); }}>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Member</span>
              <span className="text-white font-semibold">{pendingAdd.form.firstName} {pendingAdd.form.lastName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Type</span>
              <span className="text-white font-semibold">{pendingAdd.isMinor ? 'Minor (no login)' : 'Adult'}</span>
            </div>
          </div>
          <div className={`rounded-lg p-4 mb-5 flex items-start gap-3 ${capReached ? 'bg-green-950/40 border border-green-800/50' : 'bg-amber-950/40 border border-amber-800/50'}`}>
            <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${capReached ? 'text-green-400' : 'text-amber-400'}`} />
            <p className={`text-sm ${capReached ? 'text-green-200' : 'text-amber-200'}`}>{pendingAdd.costLine}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPendingAdd(null)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors">
              Go Back
            </button>
            <button disabled={!!busy} onClick={async () => {
              const result = await act('add_member', pendingAdd.form);
              if (result) {
                const emailNote = !pendingAdd.isMinor ? ' A setup email has been sent to them.' : '';
                show(`${pendingAdd.form.firstName} ${pendingAdd.form.lastName} added.${emailNote}`);
                setAddForm({ firstName: '', lastName: '', dob: '', email: '' });
                setPendingAdd(null);
                setShowAddMember(false);
              }
            }}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {busy === 'add_member' ? <Loader2 size={13} className="animate-spin" /> : null}
              Confirm Add Member
            </button>
          </div>
        </Modal>
      )}

      {/* ── Remove Member Confirm ─────────────────────────────────────────── */}
      {removingId && (() => {
        const target = householdMembers.find(m => m.id === removingId);
        return (
          <Modal title="Remove Household Member" onClose={() => setRemovingId(null)}>
            <p className="text-zinc-400 text-sm mb-6">
              Remove <strong className="text-white">{target?.firstName} {target?.lastName}</strong> from your household?
              {!capReached && <span> Your billing will decrease by {fmt(addOnCents)}/cycle starting next period.</span>}
              <span className="block mt-2 text-zinc-500 text-xs">Their account will be deactivated. Contact staff to reverse this.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemovingId(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors">
                Cancel
              </button>
              <button disabled={!!busy} onClick={async () => {
                if (await act("remove_member", { memberId: removingId })) {
                  show(`${target?.firstName} removed.`);
                  setRemovingId(null);
                }
              }}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                {busy === "remove_member" ? <Loader2 size={13} className="animate-spin" /> : null}
                Remove
              </button>
            </div>
          </Modal>
        );
      })()}

      {/* ── Cancel Confirm ────────────────────────────────────────────────── */}
      {showCancel && (
        <Modal title="Cancel Membership" onClose={() => setShowCancel(false)}>
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-4 mb-5 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">
              Your membership will remain active until{" "}
              <strong>{ms.nextBillingDate ? fmtDate(ms.nextBillingDate) : "the end of your current period"}</strong>.
              After that, you and your household members will lose access.
            </p>
          </div>
          <p className="text-zinc-500 text-sm mb-6">You can reactivate any time before that date. We&apos;d hate to see you go.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancel(false)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors">
              Keep Membership
            </button>
            <button disabled={!!busy} onClick={async () => {
              if (await act("cancel")) {
                show("Membership set to cancel at period end.");
                setShowCancel(false);
              }
            }}
              className="flex-1 bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-300 disabled:opacity-50 font-montserrat font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              {busy === "cancel" ? <Loader2 size={13} className="animate-spin" /> : null}
              Confirm Cancellation
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-montserrat font-bold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

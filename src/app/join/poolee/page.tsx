'use client';

import { useState } from 'react';
import Link from 'next/link';

const BRANCHES = [
  'Army',
  'Marine Corps',
  'Navy',
  'Air Force',
  'Space Force',
  'Coast Guard',
];

export default function PooleeJoinPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    branch: '', shipDate: '', recruiterName: '', recruiterPhone: '',
    agreeToTerms: false, agreeToHealth: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canSubmit =
    form.firstName && form.lastName && form.email && form.phone &&
    form.branch && form.shipDate && form.recruiterName &&
    form.agreeToTerms && form.agreeToHealth;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/join/poolee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-white/40 text-xs font-montserrat font-bold uppercase tracking-widest mb-6">Request Received</p>
          <h1 className="font-montserrat font-black text-4xl uppercase tracking-tight mb-6">
            We've Got You.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            We'll reach out within 24 hours to get your account set up.
            Your membership is free for as long as you're active in the DEP program.
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            Check your email for a confirmation. Questions? <a href="mailto:rich@honorboundfit.com" className="text-white underline">rich@honorboundfit.com</a>
          </p>
          <Link href="/" className="inline-block border border-white/20 text-white/60 hover:border-white hover:text-white font-montserrat font-bold text-xs uppercase tracking-widest px-6 py-3 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-20">

        <div className="mb-10">
          <p className="text-white/40 text-xs font-montserrat font-bold uppercase tracking-widest mb-3">Free Membership</p>
          <h1 className="font-montserrat font-black text-4xl uppercase tracking-tight mb-4">
            DEP Poolee Access
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed">
            If you're active in the Delayed Entry Program, your membership is on us — for as long as you're in the DEP.
            We train you before you ship. Fill out the form below and we'll get your account set up within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="First"
              />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="Last"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email" value={form.email} onChange={e => update('email', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="(540) 000-0000"
              />
            </div>
          </div>

          {/* Branch + Ship Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                value={form.branch} onChange={e => update('branch', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              >
                <option value="">Select branch...</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Ship Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date" value={form.shipDate} onChange={e => update('shipDate', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Recruiter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Recruiter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.recruiterName} onChange={e => update('recruiterName', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="SSgt Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Recruiter Phone <span className="text-zinc-600 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="tel" value={form.recruiterPhone} onChange={e => update('recruiterPhone', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="(540) 000-0000"
              />
            </div>
          </div>

          {/* Consent */}
          <div className="border border-zinc-800 p-6 space-y-4">
            <p className="text-white/40 text-xs font-montserrat font-bold uppercase tracking-widest mb-2">Acknowledgments</p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={form.agreeToTerms}
                onChange={e => update('agreeToTerms', e.target.checked)}
                className="mt-1 accent-white"
              />
              <span className="text-zinc-400 text-sm leading-relaxed">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-white underline">Terms & Waiver</a>
                {' '}and confirm I am currently enrolled in the DEP program and will notify Honor Bound FIT if my status changes.
                <span className="text-red-500"> *</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={form.agreeToHealth}
                onChange={e => update('agreeToHealth', e.target.checked)}
                className="mt-1 accent-white"
              />
              <span className="text-zinc-400 text-sm leading-relaxed">
                I confirm I am in adequate physical health to participate in fitness training and will inform staff of any injuries or conditions that may affect my participation.
                <span className="text-red-500"> *</span>
              </span>
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm border border-red-800 bg-red-950/20 px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={!canSubmit || loading}
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed font-montserrat font-black text-sm uppercase tracking-widest py-4 transition-colors"
          >
            {loading ? 'Submitting...' : 'Request Free Access →'}
          </button>

          <p className="text-zinc-600 text-xs text-center">
            Already have an account?{' '}
            <Link href="/dashboard" className="text-zinc-400 underline">Sign in</Link>
          </p>

        </form>
      </div>
    </div>
  );
}

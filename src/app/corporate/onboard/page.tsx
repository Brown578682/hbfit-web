'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmployeeInfo {
  firstName: string;
  companyName: string;
  email: string;
}

// ── Main form ─────────────────────────────────────────────────────────────────

function CorporateOnboardForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'loading' | 'error' | 'form' | 'success'>('loading');
  const [tokenError, setTokenError] = useState('');
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);

  // Form state
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [dob, setDob]             = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('No invite token found. Please use the link from your invitation email.');
      setStatus('error');
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/corporate/onboard?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setTokenError(data.error ?? 'This invite link is invalid or has expired.');
          setStatus('error');
        } else {
          setEmployee(data);
          setStatus('form');
        }
      } catch {
        setTokenError('Unable to validate your invite link. Please try again or contact your HR team.');
        setStatus('error');
      }
    }

    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/corporate/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          phone,
          password,
          ...(dob ? { dateOfBirth: dob } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setStatus('success');
    } catch {
      setFormError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-zinc-500 text-sm tracking-widest uppercase">Validating your invite…</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <span className="font-black text-4xl uppercase tracking-tight leading-none">
              <span className="text-blue-700">HB</span>
              <span className="text-red-600">F</span>
              <span className="text-white">I</span>
              <span className="text-red-600">T</span>
            </span>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h1 className="text-white text-lg font-black uppercase tracking-wide mb-2">
                  Invite Link Invalid
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed">{tokenError}</p>
              </div>
            </div>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-6">
            Questions?{' '}
            <a href="mailto:rich@honorboundfit.com" className="text-zinc-400 underline">
              rich@honorboundfit.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-10">
            <span className="font-black text-4xl uppercase tracking-tight leading-none">
              <span className="text-blue-700">HB</span>
              <span className="text-red-600">F</span>
              <span className="text-white">I</span>
              <span className="text-red-600">T</span>
            </span>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-white text-2xl font-black uppercase tracking-wide mb-4">
              You&apos;re All Set!
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Check your email for next steps. Your coaches at Honor Bound FIT will reach out to
              schedule your intro session.
            </p>
            <a
              href="/login"
              className="inline-block bg-white text-black font-black text-xs tracking-[3px] uppercase px-8 py-4 hover:bg-zinc-200 transition-colors"
            >
              Go to Login &rarr;
            </a>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-6">
            Questions?{' '}
            <a href="mailto:rich@honorboundfit.com" className="text-zinc-400 underline">
              rich@honorboundfit.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="flex justify-center mb-10">
          <span className="font-black text-4xl uppercase tracking-tight leading-none">
            <span className="text-blue-700">HB</span>
            <span className="text-red-600">F</span>
            <span className="text-white">I</span>
            <span className="text-red-600">T</span>
          </span>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-8">
          {/* Eyebrow + greeting */}
          <p className="text-zinc-500 text-xs tracking-[4px] uppercase mb-3">Corporate Wellness</p>
          <h1 className="text-white text-2xl font-black uppercase tracking-wide mb-2">
            Welcome, {employee?.firstName}.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Complete your setup below.
          </p>

          {/* Company badge */}
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 mb-8">
            <span className="text-zinc-500 text-xs tracking-widest uppercase">Member via</span>
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              {employee?.companyName}
            </span>
          </div>

          {/* Error */}
          {formError && (
            <div className="flex items-start gap-2 bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="(540) 555-0100"
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                minLength={8}
                required
                placeholder="Repeat password"
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
              />
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Date of Birth{' '}
                <span className="text-zinc-600 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white [color-scheme:dark]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-black text-xs tracking-[3px] uppercase py-4 hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create My Account →'
              )}
            </button>
          </form>
        </div>

        <p className="text-zinc-600 text-xs text-center mt-6">
          Questions?{' '}
          <a href="mailto:rich@honorboundfit.com" className="text-zinc-400 underline">
            rich@honorboundfit.com
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function CorporateOnboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <CorporateOnboardForm />
    </Suspense>
  );
}

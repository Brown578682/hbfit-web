'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// ── Step 1: Set password ──────────────────────────────────────────────────────
function PasswordStep({
  token,
  onDone,
}: {
  token: string;
  onDone: (email: string, password: string) => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return; }
      onDone(data.email, password);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="border border-zinc-800 bg-zinc-950 p-8">
      <p className="text-zinc-500 text-xs tracking-[4px] uppercase mb-3">Step 1 of 2</p>
      <h1 className="text-white text-2xl font-black uppercase tracking-wide mb-2">
        Create Your Password
      </h1>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
        Set a password to access your member portal. You&apos;ll use your email + this password to log in.
      </p>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            minLength={8} required placeholder="Minimum 8 characters" autoFocus
            className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">Confirm Password</label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            minLength={8} required placeholder="Repeat password"
            className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
          />
        </div>
        <button
          type="submit" disabled={loading || !token}
          className="w-full bg-white text-black font-black text-xs tracking-[3px] uppercase py-4 hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Setting Password…' : 'Next: Set Kiosk PIN →'}
        </button>
      </form>
    </div>
  );
}

// ── Step 2: Set kiosk PIN ─────────────────────────────────────────────────────
function PinStep({
  email,
  password,
  onDone,
}: {
  email: string;
  password: string;
  onDone: () => void;
}) {
  const [pin, setPin]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Auto sign-in first so the PIN API can authenticate us
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(() => setAuthed(true)).catch(() => setAuthed(true)); // proceed either way
  }, [email, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{4}$/.test(pin))    { setError('PIN must be exactly 4 digits.'); return; }
    if (pin !== confirm)             { setError('PINs do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/member/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to save PIN.'); setLoading(false); return; }
      onDone();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const inputClass = "w-28 bg-black border border-zinc-700 text-white text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 focus:outline-none focus:border-white placeholder:text-zinc-700";

  return (
    <div className="border border-zinc-800 bg-zinc-950 p-8">
      <p className="text-zinc-500 text-xs tracking-[4px] uppercase mb-3">Step 2 of 2</p>
      <h1 className="text-white text-2xl font-black uppercase tracking-wide mb-2">
        Set Your Kiosk PIN
      </h1>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8">
        Choose a 4-digit PIN to check in at the gym kiosk. You&apos;ll enter this every time you arrive.
      </p>

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-3">PIN</label>
          <input
            type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4}
            value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••" autoFocus className={inputClass}
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-3">Confirm PIN</label>
          <input
            type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4}
            value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••" className={inputClass}
          />
        </div>
        <div className="flex gap-4 items-center pt-2">
          <button
            type="submit" disabled={loading || !authed || pin.length < 4}
            className="flex-1 bg-white text-black font-black text-xs tracking-[3px] uppercase py-4 hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : 'Save PIN & Enter →'}
          </button>
          <button
            type="button" onClick={onDone}
            className="text-zinc-600 text-xs tracking-widest uppercase hover:text-zinc-400 transition-colors whitespace-nowrap"
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main form orchestrator ────────────────────────────────────────────────────
function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [step, setStep]         = useState<'password' | 'pin' | 'done'>('password');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) setTokenError('Missing or invalid link. Please contact us at rich@honorboundfit.com.');
  }, [token]);

  function handlePasswordDone(em: string, pw: string) {
    setEmail(em);
    setPassword(pw);
    setStep('pin');
  }

  function handlePinDone() {
    setStep('done');
    router.push('/onboarding');
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-white text-4xl mb-4">✓</div>
          <p className="text-white font-bold uppercase tracking-widest text-sm">All set. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Mark */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/logo.png"
            alt="Honor Bound FIT"
            width={120}
            height={120}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {tokenError ? (
          <div className="border border-zinc-800 bg-zinc-950 p-8">
            <p className="text-red-400 text-sm">{tokenError}</p>
          </div>
        ) : step === 'password' ? (
          <PasswordStep token={token} onDone={handlePasswordDone} />
        ) : (
          <PinStep email={email} password={password} onDone={handlePinDone} />
        )}

        <p className="text-zinc-600 text-xs text-center mt-6">
          Questions? Email{' '}
          <a href="mailto:rich@honorboundfit.com" className="text-zinc-400 underline">
            rich@honorboundfit.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  );
}

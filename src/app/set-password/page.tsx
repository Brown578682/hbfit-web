'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing or invalid link. Please contact us at rich@honorboundfit.com.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setLoading(false);
        return;
      }

      // Auto sign-in and redirect to dashboard
      setDone(true);
      const signInResult = await signIn('credentials', {
        email: data.email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/onboarding');
      } else {
        // Password set but auto-login failed — send to login page
        router.push('/login?notice=password-set');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-white text-4xl mb-4">✓</div>
          <p className="text-white font-bold uppercase tracking-widest text-sm">
            Password set. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/Honor-Bound-FIT-logo-med.png"
            alt="Honor Bound FIT"
            width={160}
            height={80}
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-zinc-500 text-xs tracking-[4px] uppercase mb-3">One Last Step</p>
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
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-white placeholder:text-zinc-600"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs tracking-[3px] uppercase mb-2">
                Confirm Password
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

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-white text-black font-black text-xs tracking-[3px] uppercase py-4 hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Setting Password…' : 'Set Password & Enter →'}
            </button>
          </form>
        </div>

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

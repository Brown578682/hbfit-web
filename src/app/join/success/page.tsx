'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HBFITMark } from '@/components/HBFITMark';

interface SuccessData {
  memberName: string;
  planName: string;
  email: string;
}

function JoinSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('session_id');

  const [data, setData]       = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/join/success?session_id=${sessionId}`)
      .then(r => r.json())
      .then((json: SuccessData & { error?: string }) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        // Fire Google Ads conversion for membership signup
        const gadsId = process.env.NEXT_PUBLIC_GADS_ID;
        const label  = process.env.NEXT_PUBLIC_GADS_SIGNUP_LABEL;
        if (gadsId && label && typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: `${gadsId}/${label}`,
            value: 75.0,
            currency: 'USD',
          });
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-10 shadow-2xl text-center">
      {/* Checkmark */}
      <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-black font-montserrat mb-2 tracking-tight">
        Welcome to Honor&nbsp;Bound&nbsp;FIT!
      </h1>

      {loading && (
        <p className="text-zinc-400 mt-4 text-sm animate-pulse">Loading your membership details…</p>
      )}

      {error && (
        <p className="text-red-400 mt-4 text-sm">
          Could not load membership details — please contact us if you have questions.
        </p>
      )}

      {data && !loading && (
        <div className="mt-6 space-y-3 text-left bg-zinc-800 rounded-xl px-6 py-4">
          <DetailRow label="Name"  value={data.memberName} />
          <DetailRow label="Plan"  value={data.planName}   />
          <DetailRow label="Email" value={data.email}      />
        </div>
      )}

      <p className="mt-6 text-zinc-400 text-sm leading-relaxed">
        You&apos;ll receive a confirmation email shortly. Our team is excited to
        have you in the tribe.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 inline-block w-full rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 transition-colors px-6 py-3 font-bold font-montserrat text-white text-base text-center"
      >
        Go to My Dashboard →
      </Link>

      <Link
        href="/"
        className="mt-3 inline-block w-full rounded-xl border border-zinc-700 hover:border-zinc-500 transition-colors px-6 py-3 font-semibold text-zinc-400 hover:text-white text-base text-center"
      >
        Return to Home
      </Link>
    </div>
  );
}

export default function JoinSuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <HBFITMark className="text-5xl font-black font-montserrat tracking-tighter" />
      </div>

      <Suspense
        fallback={
          <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-10 shadow-2xl text-center">
            <p className="text-zinc-400 text-sm animate-pulse">Loading…</p>
          </div>
        }
      >
        <JoinSuccessContent />
      </Suspense>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-zinc-400 font-medium">{label}</span>
      <span className="text-white font-semibold">{value || '—'}</span>
    </div>
  );
}

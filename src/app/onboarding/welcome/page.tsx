'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function WelcomeContent() {
  const searchParams = useSearchParams();

  // These come from the Stripe session metadata (via redirect) or query params
  const name         = searchParams.get('name') ?? 'Member';
  const plan         = searchParams.get('plan') ?? 'Membership';
  const billingDate  = searchParams.get('billing_date'); // e.g. "August 5, 2026"

  const firstName = name.split(' ')[0];

  return (
    <div className="max-w-lg w-full">

      {/* Check circle */}
      <div className="mx-auto mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Headline */}
      <h1 className="font-montserrat font-black text-4xl md:text-5xl uppercase tracking-tight text-center mb-3">
        You&apos;re all set,<br />{firstName}.
      </h1>
      <div className="w-12 h-1 bg-white mx-auto mb-8" />

      {/* Billing callout */}
      {billingDate && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-6 py-5 mb-6 text-center">
          <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-zinc-500 mb-2">
            Your First Charge
          </p>
          <p className="font-montserrat font-black text-2xl text-white mb-1">
            {billingDate}
          </p>
          <p className="font-lora text-zinc-400 text-sm leading-relaxed">
            Your current membership continues uninterrupted until then.
            Same (or reduced) rate — zero double-billing.
          </p>
        </div>
      )}

      {/* Detail rows */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 mb-8 space-y-3">
        <DetailRow label="Member"  value={name} />
        <DetailRow label="Plan"    value={plan} />
        <DetailRow label="Status"  value="Active — Portal Access Granted" />
        {billingDate && (
          <DetailRow label="Billing Starts" value={billingDate} />
        )}
      </div>

      {/* What's next */}
      <div className="mb-8">
        <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-zinc-500 mb-4 text-center">
          What&apos;s Next
        </p>
        <div className="space-y-3">
          {[
            { num: '01', text: 'View the class schedule and reserve your spot' },
            { num: '02', text: 'Complete your fitness profile so your coaches can serve you better' },
            { num: '03', text: 'Connect with your preferred coach' },
          ].map(({ num, text }) => (
            <div key={num} className="flex items-start gap-4">
              <span className="font-montserrat font-black text-2xl text-zinc-700 leading-none mt-0.5 w-8 flex-shrink-0">
                {num}
              </span>
              <p className="font-lora text-zinc-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <Link
        href="/dashboard"
        className="font-montserrat font-bold text-sm tracking-widest uppercase bg-white text-black px-6 py-4 w-full inline-block text-center hover:bg-zinc-200 transition-colors duration-200 mb-3"
      >
        Go to My Dashboard →
      </Link>
      <Link
        href="/schedule"
        className="font-montserrat font-bold text-sm tracking-widest uppercase border border-zinc-700 text-zinc-400 px-6 py-4 w-full inline-block text-center hover:border-white hover:text-white transition-colors duration-200"
      >
        View the Schedule
      </Link>
    </div>
  );
}

export default function OnboardingWelcomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Image
          src="/images/Honor-Bound-FIT-logo-med.png"
          alt="Honor Bound FIT"
          width={180}
          height={60}
          style={{ height: '52px', width: 'auto' }}
          priority
        />
      </div>

      <Suspense
        fallback={
          <div className="max-w-lg w-full text-center">
            <p className="text-zinc-400 text-sm animate-pulse">Loading your account…</p>
          </div>
        }
      >
        <WelcomeContent />
      </Suspense>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-montserrat text-zinc-500 uppercase tracking-widest text-xs">{label}</span>
      <span className="font-lora text-white">{value}</span>
    </div>
  );
}

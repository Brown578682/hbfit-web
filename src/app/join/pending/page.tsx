import Link from 'next/link';
import { CheckCircle2, Clock, CreditCard, Mail, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Application Received — Honor Bound FIT',
};

export default function GapPendingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ── Minimal header ── */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
        <Link href="/" className="font-montserrat text-xl font-black tracking-widest uppercase">
          Honor Bound <span className="text-red-500">FIT</span>
        </Link>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Big checkmark */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-900/40 border-2 border-emerald-500">
          <CheckCircle2 size={52} className="text-emerald-400" strokeWidth={1.75} />
        </div>

        {/* Heading */}
        <h1 className="font-montserrat text-4xl font-extrabold uppercase tracking-tight mb-3">
          Application Received
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mb-10">
          Thank you for submitting your Government Assistance Program (GAP) membership application.
        </p>

        {/* Info cards */}
        <div className="w-full max-w-lg space-y-4 text-left mb-10">
          {/* Doc received */}
          <div className="flex items-start gap-4 rounded-xl bg-zinc-900 border border-zinc-700 p-5">
            <ShieldCheck size={22} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-montserrat font-bold text-sm uppercase tracking-wider mb-1">Document Received</p>
              <p className="text-zinc-400 text-sm">
                Your verification document has been securely uploaded and is queued for staff review.
              </p>
            </div>
          </div>

          {/* Review timeline */}
          <div className="flex items-start gap-4 rounded-xl bg-zinc-900 border border-zinc-700 p-5">
            <Clock size={22} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-montserrat font-bold text-sm uppercase tracking-wider mb-1">24-Hour Review</p>
              <p className="text-zinc-400 text-sm">
                Our staff will review your eligibility documentation within <strong className="text-white">24 business hours</strong>.
                You&apos;ll hear from us shortly.
              </p>
            </div>
          </div>

          {/* Billing note */}
          <div className="flex items-start gap-4 rounded-xl bg-zinc-900 border border-zinc-700 p-5">
            <CreditCard size={22} className="text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-montserrat font-bold text-sm uppercase tracking-wider mb-1">No Charge Until Approved</p>
              <p className="text-zinc-400 text-sm">
                Billing will only begin <strong className="text-white">after your application is approved</strong>. You
                will not be charged during the review period.
              </p>
            </div>
          </div>

          {/* Email confirmation */}
          <div className="flex items-start gap-4 rounded-xl bg-zinc-900 border border-zinc-700 p-5">
            <Mail size={22} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-montserrat font-bold text-sm uppercase tracking-wider mb-1">Email Confirmation</p>
              <p className="text-zinc-400 text-sm">
                A confirmation email has been sent to the address you provided. You&apos;ll receive a second email
                once your membership is activated.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-8 py-3 font-montserrat font-bold text-sm uppercase tracking-widest"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-600 px-8 py-3 font-montserrat font-bold text-sm uppercase tracking-widest"
          >
            Contact Us
          </Link>
        </div>

        <p className="mt-8 text-zinc-600 text-xs">
          Questions? Call us at{' '}
          <a href="tel:+17575550100" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
            (757) 555-0100
          </a>{' '}
          or email{' '}
          <a href="mailto:info@honorboundfit.com" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
            info@honorboundfit.com
          </a>
          .
        </p>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-zinc-700 text-xs font-montserrat">
        © {new Date().getFullYear()} Honor Bound FIT · All rights reserved.
      </footer>
    </div>
  );
}

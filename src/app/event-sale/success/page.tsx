'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface OrderItem {
  name: string;
  qty: number;
  amount: number; // in cents
}

interface SessionData {
  amount: number;
  currency: string;
  items: OrderItem[];
  receiptNumber: string;
}

function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// Always-visible rep banner — shown regardless of data load state
function RepBanner() {
  return (
    <div className="bg-red-600 text-white px-6 py-5 text-center space-y-1 shadow-lg">
      <p className="font-montserrat font-extrabold uppercase text-xl tracking-tight leading-tight">
        📋 Show this screen to your HB FIT rep
      </p>
      <p className="font-montserrat font-extrabold uppercase text-sm tracking-widest leading-tight">
        to confirm your purchase
      </p>
    </div>
  );
}

function EventSaleSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get('session_id');

  const [data, setData]       = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/event-sale/session?session_id=${sessionId}`)
      .then(r => r.json())
      .then((json: SessionData & { error?: string }) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="max-w-lg w-full space-y-6">
      {/* Green checkmark + heading */}
      <div className="text-center space-y-4">
        <CheckCircle2 size={80} className="text-green-600 mx-auto" />
        <h1 className="font-montserrat font-extrabold uppercase text-5xl tracking-tight leading-none text-gray-900">
          Payment<br />Complete
        </h1>
      </div>

      {/* Prominent rep banner — always visible */}
      <RepBanner />

      {/* Loading state */}
      {loading && (
        <p className="text-gray-400 text-sm text-center font-semibold animate-pulse">
          Loading order details…
        </p>
      )}

      {/* Error state — still show banner above, plus a note here */}
      {error && !loading && (
        <div className="bg-gray-50 border-2 border-gray-300 p-5 text-center space-y-2">
          <p className="text-gray-700 text-sm font-semibold leading-relaxed">
            Could not load order details — but your payment was processed.
            Show this screen or your Stripe receipt to confirm your purchase.
          </p>
          <p className="text-gray-400 text-xs font-semibold">
            Session: {sessionId ?? '—'}
          </p>
        </div>
      )}

      {/* Order summary */}
      {data && !loading && (
        <div className="border-2 border-gray-200 divide-y-2 divide-gray-200">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50">
            <span className="col-span-6 text-gray-500 text-xs font-extrabold uppercase tracking-widest">
              Item
            </span>
            <span className="col-span-2 text-gray-500 text-xs font-extrabold uppercase tracking-widest text-center">
              Qty
            </span>
            <span className="col-span-4 text-gray-500 text-xs font-extrabold uppercase tracking-widest text-right">
              Subtotal
            </span>
          </div>

          {/* Line items */}
          {data.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
              <span className="col-span-6 text-gray-900 font-semibold text-sm leading-snug">
                {item.name}
              </span>
              <span className="col-span-2 text-gray-700 font-extrabold text-sm text-center tabular-nums">
                {item.qty}
              </span>
              <span className="col-span-4 text-gray-900 font-extrabold text-sm text-right tabular-nums">
                {formatCents(item.amount, data.currency)}
              </span>
            </div>
          ))}

          {/* Total row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-gray-50 items-center">
            <span className="col-span-8 font-montserrat font-extrabold uppercase text-gray-900 tracking-tight">
              Total Paid
            </span>
            <span className="col-span-4 font-montserrat font-extrabold text-2xl text-gray-900 text-right tabular-nums">
              {formatCents(data.amount, data.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Confirmation number */}
      {data && !loading && (
        <div className="bg-gray-50 border-2 border-gray-200 px-5 py-4 flex items-center justify-between">
          <span className="text-gray-500 text-xs font-extrabold uppercase tracking-widest">
            Confirmation #
          </span>
          <span className="font-montserrat font-extrabold text-gray-900 text-lg tracking-widest tabular-nums">
            {data.receiptNumber}
          </span>
        </div>
      )}

      {/* Make Another Purchase */}
      <Link
        href="/event-sale"
        className="block w-full border-2 border-gray-400 hover:border-gray-700 text-gray-700 hover:text-gray-900 font-montserrat font-extrabold uppercase tracking-wider py-5 text-sm text-center transition-colors"
      >
        ← Make Another Purchase
      </Link>
    </div>
  );
}

export default function EventSaleSuccessPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle2 size={80} className="text-green-600 mx-auto" />
              <h1 className="font-montserrat font-extrabold uppercase text-5xl tracking-tight leading-none text-gray-900">
                Payment<br />Complete
              </h1>
            </div>
            <RepBanner />
            <p className="text-gray-400 text-sm text-center font-semibold animate-pulse">Loading…</p>
          </div>
        }
      >
        <EventSaleSuccessContent />
      </Suspense>
    </main>
  );
}

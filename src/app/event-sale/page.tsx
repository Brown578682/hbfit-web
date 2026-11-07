'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';

type KioskProduct = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function EventSalePage() {
  const [products, setProducts]   = useState<KioskProduct[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/kiosk/products')
      .then(res => res.json())
      .then((data: KioskProduct[]) => {
        setProducts(data);
        setQuantities(Object.fromEntries(data.map(p => [p.id, 0])));
      })
      .catch(() => setError('Failed to load products. Please refresh and try again.'))
      .finally(() => setFetching(false));
  }, []);

  const total = products.reduce(
    (sum, p) => sum + p.priceCents * (quantities[p.id] ?? 0),
    0,
  );

  const hasItems = Object.values(quantities).some(q => q > 0);

  function setQty(id: string, delta: number) {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const items = products
        .filter(p => (quantities[p.id] ?? 0) > 0)
        .map(p => ({ productId: p.id, qty: quantities[p.id] }));

      const res = await fetch('/api/event-sale/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-red-600 font-montserrat font-black text-sm uppercase tracking-[0.25em]">
            Honor Bound FIT
          </p>
          <h1 className="font-montserrat font-extrabold uppercase text-5xl tracking-tight leading-none text-gray-900">
            Event<br />Shop
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto font-semibold">
            Select the items you want below, then proceed to secure checkout.
          </p>
        </div>

        {/* Loading State */}
        {fetching && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500 font-semibold">
            <Loader2 size={24} className="animate-spin text-red-600" />
            Loading products…
          </div>
        )}

        {/* Product Cards */}
        {!fetching && (
          <div className="space-y-4">
            {products.map(product => {
              const qty = quantities[product.id] ?? 0;
              const subtotal = product.priceCents * qty;
              return (
                <div
                  key={product.id}
                  className="border-2 border-gray-200 p-5 space-y-4 transition-colors"
                  style={qty > 0 ? { borderColor: '#dc2626' } : undefined}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-montserrat font-extrabold uppercase text-lg tracking-tight text-gray-900">
                        {product.name}
                      </h2>
                      {product.description && (
                        <p className="text-gray-500 text-sm mt-1 font-semibold leading-snug">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-montserrat font-extrabold text-2xl text-gray-900 leading-none">
                        {formatCents(product.priceCents)}
                      </p>
                      <p className="text-gray-400 text-xs font-semibold mt-0.5">each</p>
                    </div>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQty(product.id, -1)}
                        disabled={qty === 0}
                        aria-label="Decrease quantity"
                        className="w-10 h-10 border-2 border-gray-300 hover:border-gray-700 disabled:opacity-30 flex items-center justify-center transition-colors rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-montserrat font-extrabold text-2xl text-gray-900 w-8 text-center tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(product.id, 1)}
                        aria-label="Increase quantity"
                        className="w-10 h-10 border-2 border-red-600 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {qty > 0 && (
                      <p className="font-montserrat font-extrabold text-red-600 text-lg">
                        {formatCents(subtotal)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Running Total */}
        {!fetching && (
          <div className="border-t-2 border-gray-200 pt-5 flex justify-between items-center">
            <span className="font-montserrat font-extrabold uppercase tracking-tight text-gray-900 text-lg">
              Total
            </span>
            <span className="font-montserrat font-extrabold text-3xl text-gray-900">
              {formatCents(total)}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 p-4 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Checkout Button */}
        {!fetching && (
          <button
            onClick={handleCheckout}
            disabled={!hasItems || loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-montserrat font-extrabold uppercase tracking-wider py-6 text-xl transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <ShoppingCart size={22} />
                Checkout — {formatCents(total)}
              </>
            )}
          </button>
        )}

        <p className="text-gray-400 text-sm text-center leading-relaxed font-semibold">
          You&apos;ll be redirected to Stripe&apos;s secure checkout page.
        </p>
      </div>
    </div>
  );
}

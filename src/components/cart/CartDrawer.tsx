"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateLine, removeLine, loading } = useCart();
  const lines = cart?.lines.nodes ?? [];

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-zinc-950 border-l border-white/10 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-bold font-montserrat uppercase tracking-widest text-sm flex items-center gap-2">
            <ShoppingBag size={16} />
            Cart
            {cart && cart.totalQuantity > 0 && (
              <span className="bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.totalQuantity}
              </span>
            )}
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 gap-3">
              <ShoppingBag size={40} strokeWidth={1} />
              <p className="text-sm uppercase tracking-widest">Your cart is empty</p>
            </div>
          ) : (
            lines.map((line) => {
              const img =
                line.merchandise.image ?? line.merchandise.product.featuredImage;
              const options = line.merchandise.selectedOptions
                .filter((o) => o.value !== "Default Title")
                .map((o) => o.value)
                .join(" / ");

              return (
                <div key={line.id} className="flex gap-3">
                  {/* Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-900 overflow-hidden">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.altText ?? line.merchandise.product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={16} className="text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">
                      {line.merchandise.product.title}
                    </p>
                    {options && (
                      <p className="text-xs text-white/40 mt-0.5">{options}</p>
                    )}
                    <p className="text-xs text-white/60 mt-1">
                      {formatPrice(
                        line.cost.totalAmount.amount,
                        line.cost.totalAmount.currencyCode
                      )}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          line.quantity > 1
                            ? updateLine(line.id, line.quantity - 1)
                            : removeLine(line.id)
                        }
                        disabled={loading}
                        className="w-6 h-6 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm w-4 text-center">{line.quantity}</span>
                      <button
                        onClick={() => updateLine(line.id, line.quantity + 1)}
                        disabled={loading}
                        className="w-6 h-6 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => removeLine(line.id)}
                        disabled={loading}
                        className="ml-auto text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                        aria-label="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="border-t border-white/10 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Subtotal</span>
              <span className="font-bold">
                {cart
                  ? formatPrice(
                      cart.cost.totalAmount.amount,
                      cart.cost.totalAmount.currencyCode
                    )
                  : "—"}
              </span>
            </div>
            <p className="text-white/30 text-xs">Shipping and taxes calculated at checkout.</p>
            <a
              href={cart?.checkoutUrl}
              className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Checkout"
              )}
            </a>
          </div>
        )}
      </div>
    </>
  );
}

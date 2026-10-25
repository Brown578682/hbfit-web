"use client";

import { useState } from "react";
import { createCart, formatPrice, ShopifyProduct } from "@/lib/shopify";
import { Loader2, ShoppingBag } from "lucide-react";

interface Props {
  product: ShopifyProduct;
  optionNames: string[];
}

export default function AddToCartButton({ product, optionNames }: Props) {
  const hasVariants = product.variants.nodes.length > 1;

  // Track selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (product.variants.nodes[0]) {
      product.variants.nodes[0].selectedOptions.forEach(o => { defaults[o.name] = o.value; });
    }
    return defaults;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Find the matching variant based on selected options
  const selectedVariant = product.variants.nodes.find(v =>
    v.selectedOptions.every(o => selectedOptions[o.name] === o.value)
  ) ?? product.variants.nodes[0];

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    setError("");
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    setError("");
    try {
      const cart = await createCart(selectedVariant.id, 1);
      window.location.href = cart.checkoutUrl;
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Group option values by option name
  const optionValues: Record<string, string[]> = {};
  optionNames.forEach(name => {
    optionValues[name] = [...new Set(
      product.variants.nodes
        .flatMap(v => v.selectedOptions)
        .filter(o => o.name === name)
        .map(o => o.value)
    )];
  });

  const isAvailable = selectedVariant?.availableForSale ?? false;

  return (
    <div className="space-y-4">
      {/* Variant selectors */}
      {hasVariants && optionNames.map(name => (
        <div key={name}>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{name}</p>
          <div className="flex flex-wrap gap-2">
            {optionValues[name]?.map(value => {
              const variant = product.variants.nodes.find(v =>
                v.selectedOptions.some(o => o.name === name && o.value === value) &&
                Object.entries(selectedOptions).every(([k, v2]) => k === name || v.selectedOptions.some(o => o.name === k && o.value === v2))
              );
              const available = variant?.availableForSale ?? true;
              const isSelected = selectedOptions[name] === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(name, value)}
                  disabled={!available}
                  className={`px-4 py-2 text-sm border transition-all ${
                    isSelected
                      ? "border-white bg-white text-black font-bold"
                      : available
                        ? "border-white/20 text-white hover:border-white/60"
                        : "border-white/10 text-white/20 cursor-not-allowed line-through"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price for selected variant */}
      {hasVariants && selectedVariant && (
        <p className="text-white/60 text-sm">
          {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
          {selectedVariant.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
            <span className="ml-2 line-through text-white/30">
              {formatPrice(selectedVariant.compareAtPrice.amount, selectedVariant.compareAtPrice.currencyCode)}
            </span>
          )}
        </p>
      )}

      {/* Buy button */}
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={loading || !isAvailable}
        className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <ShoppingBag size={16} />
            {isAvailable ? "Buy Now" : "Sold Out"}
          </>
        )}
      </button>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <p className="text-white/20 text-xs text-center">Secure checkout powered by Shopify</p>
    </div>
  );
}

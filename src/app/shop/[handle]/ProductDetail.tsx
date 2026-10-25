"use client";

import { useState } from "react";
import Image from "next/image";
import { createCart, formatPrice, ShopifyProduct, ShopifyImage } from "@/lib/shopify";
import { Loader2, ShoppingBag } from "lucide-react";

interface Props {
  product: ShopifyProduct;
  allImages: ShopifyImage[];
}

export default function ProductDetail({ product, allImages }: Props) {
  const optionNames = [...new Set(product.variants.nodes.flatMap(v => v.selectedOptions.map(o => o.name)))];

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.variants.nodes[0]?.selectedOptions.forEach(o => { defaults[o.name] = o.value; });
    return defaults;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Find matching variant
  const selectedVariant = product.variants.nodes.find(v =>
    v.selectedOptions.every(o => selectedOptions[o.name] === o.value)
  ) ?? product.variants.nodes[0];

  // Gallery: use variant image if available, else fall back to all product images
  const variantImage = selectedVariant?.image ?? null;
  const galleryImages = variantImage
    ? [variantImage, ...allImages.filter(img => img.url !== variantImage.url)]
    : allImages;

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    setError("");
    // Jump gallery to variant image
    const variant = product.variants.nodes.find(v =>
      v.selectedOptions.some(o => o.name === optionName && o.value === value) &&
      Object.entries({ ...selectedOptions, [optionName]: value }).every(
        ([k, v2]) => v.selectedOptions.some(o => o.name === k && o.value === v2)
      )
    );
    if (variant?.image) {
      const idx = allImages.findIndex(img => img.url === variant.image!.url);
      setActiveGalleryIndex(idx >= 0 ? idx : 0);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    setError("");
    try {
      const cart = await createCart(selectedVariant.id, 1);
      window.location.href = cart.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Group option values
  const optionValues: Record<string, string[]> = {};
  optionNames.forEach(name => {
    optionValues[name] = [...new Set(
      product.variants.nodes.flatMap(v => v.selectedOptions).filter(o => o.name === name).map(o => o.value)
    )];
  });

  const isAvailable = selectedVariant?.availableForSale ?? false;
  const displayImages = galleryImages.length > 0 ? galleryImages : allImages;
  const activeImage = displayImages[activeGalleryIndex] ?? displayImages[0];

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Gallery */}
      <div className="space-y-2">
        <div className="aspect-square bg-zinc-900 relative overflow-hidden">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? product.title}
              fill
              className="object-cover transition-opacity duration-200"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-white/10" />
            </div>
          )}
        </div>
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayImages.slice(0, 8).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveGalleryIndex(i)}
                className={`aspect-square bg-zinc-900 relative overflow-hidden border-2 transition-all ${
                  i === activeGalleryIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="15vw" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details + controls */}
      <div className="flex flex-col">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Honor Bound FIT</p>
        <h1 className="text-2xl font-bold font-montserrat uppercase tracking-wide mb-4">{product.title}</h1>

        <p className="text-xl text-white mb-6">
          {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (
            <span className="text-white/40"> – {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}</span>
          )}
        </p>

        <div className="space-y-4">
          {optionNames.map(name => (
            <div key={name}>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{name}</p>
              <div className="flex flex-wrap gap-2">
                {optionValues[name]?.map(value => {
                  const variant = product.variants.nodes.find(v =>
                    v.selectedOptions.every(o =>
                      o.name === name ? o.value === value : selectedOptions[o.name] === o.value
                    )
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

          {selectedVariant && (
            <p className="text-white/60 text-sm">
              {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
              {selectedVariant.compareAtPrice && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
                <span className="ml-2 line-through text-white/30">
                  {formatPrice(selectedVariant.compareAtPrice.amount, selectedVariant.compareAtPrice.currencyCode)}
                </span>
              )}
            </p>
          )}

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={loading || !isAvailable}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (
              <><ShoppingBag size={16} />{isAvailable ? "Buy Now" : "Sold Out"}</>
            )}
          </button>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <p className="text-white/20 text-xs text-center">Secure checkout powered by Shopify</p>
        </div>

        {product.descriptionHtml && (
          <div
            className="mt-8 text-white/60 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}
      </div>
    </div>
  );
}

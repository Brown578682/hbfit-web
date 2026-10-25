"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShopifyProduct, formatPrice, getProductCategory, getProductColors } from "@/lib/shopify";
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react";

interface Props {
  products: ShopifyProduct[];
}

const COLOR_SWATCHES: Record<string, string> = {
  "Black": "#1a1a1a",
  "Tan": "#c8a96e",
  "Khaki/Black": "#8b7355",
};

export default function ShopGrid({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeColor, setActiveColor] = useState<string>("All");
  const [activeSort, setActiveSort] = useState<string>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build filter options from actual product data
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => getProductCategory(p.productType)));
    return ["All", ...Array.from(cats).sort()];
  }, [products]);

  const colors = useMemo(() => {
    const cols = new Set(products.flatMap(p => getProductColors(p)));
    return ["All", ...Array.from(cols).sort()];
  }, [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const catMatch = activeCategory === "All" || getProductCategory(p.productType) === activeCategory;
      const colorMatch = activeColor === "All" || getProductColors(p).includes(activeColor);
      return catMatch && colorMatch;
    });

    if (activeSort === "price-asc") {
      result = [...result].sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
    } else if (activeSort === "price-desc") {
      result = [...result].sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
    }
    // "newest" = default Shopify order

    return result;
  }, [products, activeCategory, activeColor, activeSort]);

  const activeFilters = [
    activeCategory !== "All" ? activeCategory : null,
    activeColor !== "All" ? activeColor : null,
  ].filter(Boolean);

  const clearAll = () => {
    setActiveCategory("All");
    setActiveColor("All");
    setActiveSort("newest");
  };

  return (
    <>
      {/* Filter bar */}
      <div className="border-b border-white/10 px-6 py-4 sticky top-0 bg-black z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Category pills — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs uppercase tracking-widest border transition-all ${
                  activeCategory === cat
                    ? "border-white bg-white text-black font-bold"
                    : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter/Sort toggle */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-widest border transition-all ${
              filtersOpen || activeFilters.length > 0
                ? "border-white bg-white text-black font-bold"
                : "border-white/20 text-white/60 hover:border-white/50"
            }`}
          >
            <SlidersHorizontal size={12} />
            Filter
            {activeFilters.length > 0 && (
              <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="max-w-6xl mx-auto mt-4 pb-2 space-y-4">
            {/* Color */}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs border transition-all ${
                      activeColor === color
                        ? "border-white text-white font-bold"
                        : "border-white/20 text-white/60 hover:border-white/50"
                    }`}
                  >
                    {color !== "All" && COLOR_SWATCHES[color] && (
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 inline-block"
                        style={{ background: COLOR_SWATCHES[color] }}
                      />
                    )}
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Sort</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "newest", label: "Newest" },
                  { value: "price-asc", label: "Price: Low → High" },
                  { value: "price-desc", label: "Price: High → Low" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setActiveSort(opt.value)}
                    className={`px-3 py-1.5 text-xs border transition-all ${
                      activeSort === opt.value
                        ? "border-white bg-white text-black font-bold"
                        : "border-white/20 text-white/60 hover:border-white/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="max-w-6xl mx-auto mt-3 flex items-center gap-2 flex-wrap">
            {activeFilters.map(f => (
              <span key={f} className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-xs px-2 py-1">
                {f}
                <button onClick={() => {
                  if (f === activeCategory) setActiveCategory("All");
                  if (f === activeColor) setActiveColor("All");
                }}><X size={10} /></button>
              </span>
            ))}
            <button onClick={clearAll} className="text-white/30 text-xs hover:text-white underline underline-offset-2">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <p className="text-white/30 text-xs uppercase tracking-widest">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag size={40} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm uppercase tracking-widest">No products match</p>
            <button onClick={clearAll} className="text-white/30 text-xs mt-2 hover:text-white underline underline-offset-2">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.handle}`}
                className="group block border border-white/10 hover:border-white/30 transition-all duration-200"
              >
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText ?? product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} className="text-white/10" />
                    </div>
                  )}
                  {!product.availableForSale && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-xs uppercase tracking-widest text-white/60">Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-white/80 transition-colors">
                    {product.title}
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                    {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (
                      <span> – {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

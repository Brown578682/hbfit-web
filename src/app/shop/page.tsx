import { getProducts, formatPrice } from "@/lib/shopify";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Shop — Honor Bound FIT",
  description: "Honor Bound FIT gear, apparel, and supplements.",
};

export default async function ShopPage() {
  const products = await getProducts(24);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">Honor Bound FIT</p>
        <h1 className="text-3xl font-bold font-montserrat uppercase tracking-widest">Shop</h1>
        <p className="text-white/40 text-sm mt-2">Gear built for the standard you hold yourself to.</p>
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag size={40} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm uppercase tracking-widest">Products coming soon</p>
            <p className="text-white/20 text-xs mt-2">Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.handle}`}
                className="group block border border-white/10 hover:border-white/30 transition-all duration-200"
              >
                {/* Image */}
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

                {/* Info */}
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
    </main>
  );
}

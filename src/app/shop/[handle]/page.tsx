import { getProductByHandle, getProducts, formatPrice } from "@/lib/shopify";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const products = await getProducts(100);
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product Not Found — Honor Bound FIT" };
  return {
    title: `${product.title} — Honor Bound FIT`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const images = product.images.nodes.length > 0 ? product.images.nodes : (product.featuredImage ? [product.featuredImage] : []);

  // Group variants by option name
  const optionNames = [...new Set(product.variants.nodes.flatMap(v => v.selectedOptions.map(o => o.name)))];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <ProductGallery images={images} title={product.title} />

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Honor Bound FIT</p>
            <h1 className="text-2xl font-bold font-montserrat uppercase tracking-wide mb-4">{product.title}</h1>

            <p className="text-xl text-white mb-6">
              {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
              {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && (
                <span className="text-white/40"> – {formatPrice(product.priceRange.maxVariantPrice.amount, product.priceRange.maxVariantPrice.currencyCode)}</span>
              )}
            </p>

            {/* Add to cart — client component handles variant selection */}
            <AddToCartButton product={product} optionNames={optionNames} />

            {/* Description */}
            {product.descriptionHtml && (
              <div
                className="mt-8 text-white/60 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

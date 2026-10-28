import { getProductByHandle, getProducts } from "@/lib/shopify";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "./ProductDetail";
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

  const allImages = product.images.nodes.length > 0
    ? product.images.nodes
    : product.featuredImage ? [product.featuredImage] : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-10">
        <Link href="/shop" className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/60 text-xs uppercase tracking-widest px-4 py-2 mb-8 transition-all">
          <ArrowLeft size={14} /> Back to Shop
        </Link>
        <ProductDetail product={product} allImages={allImages} />
      </div>
    </main>
  );
}

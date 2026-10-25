import { getProducts } from "@/lib/shopify";
import ShopGrid from "./ShopGrid";

export const metadata = {
  title: "Shop — Honor Bound FIT",
  description: "Honor Bound FIT gear, apparel, and supplements.",
};

export default async function ShopPage() {
  const products = await getProducts(100);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">Honor Bound FIT</p>
        <h1 className="text-3xl font-bold font-montserrat uppercase tracking-widest">Shop</h1>
        <p className="text-white/40 text-sm mt-2">Gear built for the standard you hold yourself to.</p>
      </div>

      <ShopGrid products={products} />
    </main>
  );
}

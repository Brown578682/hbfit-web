/**
 * Seed kiosk products for Honor Bound FIT.
 * Run: npx tsx scripts/seed-kiosk-products.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRODUCTS = [
  { name: "Beverage",                priceCents:  300, sortOrder: 1 },
  { name: "Bullet Bottle",           priceCents: 2000, sortOrder: 2 },
  { name: "Cray-nom Organizer",      priceCents: 1500, sortOrder: 3 },
  { name: "Coffee-4-Life Tumbler",   priceCents: 3000, sortOrder: 4, description: "Add personalization for +$5" },
  { name: "Personalization",         priceCents:  500, sortOrder: 5, description: "Custom engraving on Tumbler" },
  { name: "Cotton Blend T-Shirt",    priceCents: 3000, sortOrder: 6 },
  { name: "Moisture Wicking T-Shirt",priceCents: 3500, sortOrder: 7 },
];

async function main() {
  console.log("Seeding kiosk products…");

  for (const product of PRODUCTS) {
    const existing = await prisma.kioskProduct.findFirst({ where: { name: product.name } });
    if (existing) {
      console.log(`  ✓ Already exists: ${product.name}`);
      continue;
    }
    await prisma.kioskProduct.create({ data: product });
    console.log(`  + Created: ${product.name} ($${(product.priceCents / 100).toFixed(2)})`);
  }

  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET  /api/kiosk/products  — list all in-stock products
 * POST /api/kiosk/purchase  — body: { memberId, items: [{productId, quantity}] }
 */
export async function GET() {
  const products = await prisma.kioskProduct.findMany({
    where: { inStock: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, description: true, priceCents: true, imageUrl: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const { memberId, items } = await req.json() as {
      memberId?: string;
      items?: { productId: string; quantity: number }[];
    };

    if (!memberId || !items?.length) {
      return NextResponse.json({ error: "memberId and items required" }, { status: 400 });
    }

    // Fetch products to snapshot prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.kioskProduct.findMany({
      where: { id: { in: productIds }, inStock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all items exist and are in stock
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or out of stock` },
          { status: 400 }
        );
      }
    }

    const purchases = await prisma.$transaction(
      items.map((item) =>
        prisma.kioskPurchase.create({
          data: {
            memberId,
            productId: item.productId,
            quantity: item.quantity,
            priceCents: productMap.get(item.productId)!.priceCents * item.quantity,
          },
        })
      )
    );

    const total = purchases.reduce((sum, p) => sum + p.priceCents, 0);
    return NextResponse.json({ ok: true, purchaseCount: purchases.length, totalCents: total });
  } catch (err) {
    console.error("[kiosk/products POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

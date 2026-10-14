import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

/**
 * GET /api/kiosk/products — list all in-stock products
 */
export async function GET() {
  const products = await prisma.kioskProduct.findMany({
    where: { inStock: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, description: true, priceCents: true, imageUrl: true },
  });
  return NextResponse.json(products);
}

/**
 * POST /api/kiosk/purchase
 * Body: {
 *   memberId: string,
 *   items: { productId: string; quantity: number; notes?: string }[]
 * }
 *
 * Flow:
 *  1. Fetch member's Stripe customer + default payment method
 *  2. If no payment method → return { ok: false, noCard: true } so kiosk sends to coach
 *  3. Create PaymentIntent and confirm immediately (off-session charge on stored card)
 *  4. Write KioskPurchase rows (settled) and return success
 */
export async function POST(req: NextRequest) {
  try {
    const { memberId, items } = (await req.json()) as {
      memberId?: string;
      items?: { productId: string; quantity: number; notes?: string }[];
    };

    if (!memberId || !items?.length) {
      return NextResponse.json({ error: "memberId and items required" }, { status: 400 });
    }

    // ── 1. Fetch member + Stripe customer ───────────────────────────────────
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // ── 2. Resolve products + build line totals ──────────────────────────────
    const productIds = items.map((i) => i.productId);
    const products = await prisma.kioskProduct.findMany({
      where: { id: { in: productIds }, inStock: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or out of stock` },
          { status: 400 }
        );
      }
    }

    const totalCents = items.reduce((sum, item) => {
      return sum + productMap.get(item.productId)!.priceCents * item.quantity;
    }, 0);

    // ── 3. Charge stored card ────────────────────────────────────────────────
    let stripePaymentIntentId: string | null = null;

    if (member.stripeCustomerId) {
      const stripe = getStripe();

      // Get the customer's default payment method
      const customer = await stripe.customers.retrieve(member.stripeCustomerId) as Stripe.Customer;

      const defaultPm =
        typeof customer.invoice_settings?.default_payment_method === "string"
          ? customer.invoice_settings.default_payment_method
          : (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null)?.id ?? null;

      if (!defaultPm) {
        // No card on file — send them to a coach
        return NextResponse.json({ ok: false, noCard: true });
      }

      // Confirm off-session
      const pi = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: "usd",
        customer: member.stripeCustomerId,
        payment_method: defaultPm,
        off_session: true,
        confirm: true,
        description: `HBFIT kiosk purchase — ${member.firstName} ${member.lastName}`,
        metadata: { memberId, source: "kiosk" },
      });

      if (pi.status !== "succeeded") {
        // Card declined or requires action — send to coach
        return NextResponse.json({ ok: false, noCard: true, stripeStatus: pi.status });
      }

      stripePaymentIntentId = pi.id;
    } else {
      // No Stripe customer at all — send to coach
      return NextResponse.json({ ok: false, noCard: true });
    }

    // ── 4. Write purchase records ─────────────────────────────────────────────
    const now = new Date();
    await prisma.$transaction(
      items.map((item) =>
        prisma.kioskPurchase.create({
          data: {
            memberId,
            productId: item.productId,
            quantity: item.quantity,
            priceCents: productMap.get(item.productId)!.priceCents * item.quantity,
            notes: item.notes ?? null,
            stripePaymentIntentId,
            settledAt: now,
          },
        })
      )
    );

    return NextResponse.json({ ok: true, totalCents, stripePaymentIntentId });
  } catch (err) {
    console.error("[kiosk/products POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

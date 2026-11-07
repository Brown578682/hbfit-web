import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  }
  return _stripe;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { items: { productId: string; qty: number }[] };
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided.' }, { status: 400 });
    }

    // Look up each product from the database
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of items) {
      if (!item.productId || !item.qty || item.qty < 1) continue;

      const product = await prisma.kioskProduct.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, description: true, priceCents: true, inStock: true },
      });

      if (!product || !product.inStock) {
        return NextResponse.json(
          { error: `Product not found or out of stock: ${item.productId}` },
          { status: 400 },
        );
      }

      lineItems.push({
        price_data: {
          currency: 'usd',
          unit_amount: product.priceCents,
          product_data: { name: product.name, description: product.description ?? undefined },
        },
        quantity: item.qty,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/event-sale/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/event-sale`,
    });

    return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
  } catch (err: unknown) {
    console.error('[API /event-sale/checkout] error:', err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

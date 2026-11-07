import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  }
  return _stripe;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required.' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed.' }, { status: 402 });
    }

    const lineItems = session.line_items?.data ?? [];

    const items = lineItems.map(li => {
      const product = li.price?.product;
      const name =
        typeof product === 'object' && product !== null && 'name' in product
          ? (product as Stripe.Product).name
          : 'Unknown Item';
      return {
        name,
        qty: li.quantity ?? 1,
        amount: li.amount_total ?? 0,
      };
    });

    const receiptNumber = sessionId.slice(-8).toUpperCase();

    return NextResponse.json({
      amount:   session.amount_total ?? 0,
      currency: session.currency     ?? 'usd',
      items,
      receiptNumber,
    });
  } catch (err: unknown) {
    console.error('[API /event-sale/session] error:', err);
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_PRICE_DROP_IN, STRIPE_PRICE_TEN_PACK } from '@/lib/plans';

export const runtime = 'nodejs';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  }
  return _stripe;
}

// POST /api/drop-in/checkout
// Body: { type: 'drop-in' | 'ten-pack', email?: string, firstName?: string, lastName?: string }
// Returns: { checkoutUrl: string }
export async function POST(req: NextRequest) {
  try {
    const { type, email, firstName, lastName } = await req.json() as {
      type: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };

    if (type !== 'drop-in' && type !== 'ten-pack') {
      return NextResponse.json({ error: 'type must be "drop-in" or "ten-pack"' }, { status: 400 });
    }

    const priceId  = type === 'drop-in' ? STRIPE_PRICE_DROP_IN : STRIPE_PRICE_TEN_PACK;
    const credits  = type === 'drop-in' ? 1 : 10;
    const origin   = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://honorboundfit.com';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/drop-in/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/drop-in`,
      allow_promotion_codes: true,
      metadata: {
        type,
        credits: String(credits),
        memberEmail:     email     ?? '',
        memberFirstName: firstName ?? '',
        memberLastName:  lastName  ?? '',
      },
    };

    // Pre-fill email if provided
    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);
    return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
  } catch (err) {
    console.error('[drop-in/checkout] error:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

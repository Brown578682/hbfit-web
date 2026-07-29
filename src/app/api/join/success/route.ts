import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MEMBERSHIP_PLANS } from '@/lib/plans';

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
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    const customer = session.customer as Stripe.Customer | null;
    const planSlug = session.metadata?.planSlug ?? '';
    const plan     = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);

    const memberName = customer?.name
      ?? `${customer?.metadata?.firstName ?? ''} ${customer?.metadata?.lastName ?? ''}`.trim()
      ?? 'Member';

    return NextResponse.json({
      memberName,
      planName: plan?.name ?? planSlug,
      email:    customer?.email ?? session.customer_email ?? '',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('[API /join/success] error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

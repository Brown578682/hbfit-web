import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { MEMBERSHIP_PLANS } from '@/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://honorboundfit.com';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planSlug } = await req.json().catch(() => ({ planSlug: null }));
  if (!planSlug) return NextResponse.json({ error: 'planSlug required' }, { status: 400 });

  const plan = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);
  if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
  if (!plan.stripePriceId) return NextResponse.json({ error: 'Plan not available for online purchase' }, { status: 400 });

  // GAP plans require staff approval — send them through the GAP flow instead
  if (plan.requiresApproval) {
    return NextResponse.json({ error: 'GAP plans require staff approval. Please contact us to get started.' }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    include: {
      user: { select: { email: true } },
      memberships: { where: { status: 'ACTIVE' } },
    },
  });

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  if (member.memberships.length > 0) {
    return NextResponse.json({ error: 'You already have an active membership. Use Manage Membership to make changes.' }, { status: 400 });
  }

  // Ensure Stripe customer exists
  let stripeCustomerId = member.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: member.user?.email ?? session.user.email ?? undefined,
      name: `${member.firstName} ${member.lastName}`,
      metadata: { hbfit_member_id: member.id },
    });
    stripeCustomerId = customer.id;
    await prisma.member.update({ where: { id: member.id }, data: { stripeCustomerId } });
  }

  // Create Stripe Checkout session in subscription mode
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        hbfit_member_id: member.id,
        planSlug,
      },
    },
    success_url: `${BASE_URL}/dashboard/settings?plan_success=1`,
    cancel_url:  `${BASE_URL}/dashboard/select-plan`,
    metadata: {
      hbfit_member_id: member.id,
      planSlug,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

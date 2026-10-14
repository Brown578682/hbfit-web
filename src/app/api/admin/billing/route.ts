import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ── Pull all active Stripe subscriptions ────────────────────────────────
    const stripeSubs: Stripe.Subscription[] = [];
    let starting_after: string | undefined;
    do {
      const page = await stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        expand: ['data.customer', 'data.items.data.price', 'data.discounts'],
        ...(starting_after ? { starting_after } : {}),
      });
      stripeSubs.push(...page.data.filter((s: any) =>
        s.status !== 'incomplete' && s.status !== 'incomplete_expired'
      ));
      starting_after = page.has_more ? page.data[page.data.length - 1].id : undefined;
    } while (starting_after);

    // ── Pull member name map from DB by stripeCustomerId ───────────────────
    const members = await prisma.member.findMany({
      where: { stripeCustomerId: { not: null } },
      select: { stripeCustomerId: true, firstName: true, lastName: true, id: true },
    });
    const memberByCustomer = new Map(members.map(m => [m.stripeCustomerId!, m]));

    // ── Pull plan name map: by Stripe price ID AND by subscription ID ───────
    const dbPlans = await prisma.membershipPlan.findMany({
      select: { stripePriceId: true, name: true },
    });
    const planByPriceId = new Map(dbPlans.filter(p => p.stripePriceId).map(p => [p.stripePriceId!, p.name]));

    // Membership rows keyed by stripeSubscriptionId → plan name
    const memberships = await prisma.membership.findMany({
      where: { stripeSubscriptionId: { not: null } },
      select: { stripeSubscriptionId: true, plan: { select: { name: true } } },
    });
    const planBySubId = new Map(memberships.map(m => [m.stripeSubscriptionId!, m.plan.name]));

    // ── Build subscription rows ─────────────────────────────────────────────
    // Pre-fetch any coupon IDs we'll encounter so we can apply discounts correctly
    const couponCache = new Map<string, Stripe.Coupon>();
    const allCouponIds = new Set<string>();
    for (const sub of stripeSubs) {
      const s = sub as any;
      const discounts: any[] = s.discounts ?? (s.discount ? [s.discount] : []);
      for (const d of discounts) {
        const couponId = typeof d?.coupon === 'string' ? d.coupon
          : typeof d?.source?.coupon === 'string' ? d.source.coupon
          : null;
        if (couponId) allCouponIds.add(couponId);
      }
    }
    await Promise.all([...allCouponIds].map(async (id) => {
      try {
        const coupon = await stripe.coupons.retrieve(id);
        couponCache.set(id, coupon);
      } catch { /* non-fatal */ }
    }));

    const rows = stripeSubs.map(sub => {
      const s = sub as any;
      const customer = s.customer as Stripe.Customer;
      const member = memberByCustomer.get(customer.id);
      const name = member
        ? `${member.firstName} ${member.lastName}`
        : (customer.name ?? customer.email ?? customer.id);

      // Sum line items for total amount (recurring)
      const rawAmountCents = s.items.data.reduce((acc: number, item: any) => {
        return acc + (item.price.unit_amount ?? 0) * (item.quantity ?? 1);
      }, 0);

      // Apply any subscription-level discount (coupon amount_off or percent_off)
      let discountCents = 0;
      const discounts: any[] = s.discounts ?? (s.discount ? [s.discount] : []);
      for (const d of discounts) {
        // Coupon may be an expanded object or a bare string ID (newer Stripe API)
        const couponId = typeof d?.coupon === 'string' ? d.coupon
          : typeof d?.source?.coupon === 'string' ? d.source.coupon
          : null;
        const coupon: Stripe.Coupon | null | undefined = couponId
          ? (couponCache.get(couponId) ?? null)
          : (d?.coupon ?? d?.source?.coupon ?? null);
        if (!coupon || typeof coupon !== 'object') continue;
        if (coupon.amount_off) discountCents += coupon.amount_off;
        else if (coupon.percent_off) discountCents += Math.round(rawAmountCents * coupon.percent_off / 100);
      }
      const amountCents = Math.max(0, rawAmountCents - discountCents);

      // Plan name: sub ID → our Membership record (most reliable), then price ID → our DB, then Stripe nickname
      const firstItem = s.items.data[0];
      const firstPriceId = firstItem?.price?.id;
      const planName = planBySubId.get(s.id)
        ?? (firstPriceId ? planByPriceId.get(firstPriceId) : null)
        ?? firstItem?.price?.nickname
        ?? 'Unknown Plan';

      // SITG: check if any line item is the donation price
      const SITG_PRICE = 'price_1TyNW7Amxrz1YL7G2qsQ2UON';
      const standInTheGap = s.items.data.some((item: any) => item.price?.id === SITG_PRICE);

      // current_period_end moved to items in newer Stripe API versions (acacia+)
      const periodEnd = s.current_period_end ?? firstItem?.current_period_end ?? null;
      const nextBilling = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : null;

      const status: 'Active' | 'Past Due' | 'Canceled' | 'Trialing' =
        s.status === 'active' ? 'Active'
        : s.status === 'past_due' ? 'Past Due'
        : s.status === 'canceled' ? 'Canceled'
        : s.status === 'trialing' ? 'Trialing'
        : 'Active';

      return {
        id: s.id,
        memberId: member?.id ?? null,
        name,
        plan: planName,
        standInTheGap,
        amountCents,
        nextBilling,
        status,
        cancelAtPeriodEnd: s.cancel_at_period_end,
      };
    });

    // ── Revenue stats ───────────────────────────────────────────────────────
    const activeSubs = rows.filter(r => r.status === 'Active' || r.status === 'Trialing');
    const recurringRevenueCents = activeSubs.reduce((a, r) => a + r.amountCents, 0);

    const pastDueSubs = rows.filter(r => r.status === 'Past Due');
    const overdueCents = pastDueSubs.reduce((a, r) => a + r.amountCents, 0);

    // YTD: pull charges from Stripe for this calendar year
    const yearStart = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
    let ytdCents = 0;
    try {
      let chargeCursor: string | undefined;
      do {
        const charges = await stripe.charges.list({
          created: { gte: yearStart },
          limit: 100,
          ...(chargeCursor ? { starting_after: chargeCursor } : {}),
        });
        ytdCents += charges.data
          .filter(c => c.paid && !c.refunded)
          .reduce((a, c) => a + c.amount, 0);
        chargeCursor = charges.has_more ? charges.data[charges.data.length - 1].id : undefined;
      } while (chargeCursor);
    } catch { /* non-fatal */ }

    return NextResponse.json({
      recurringRevenueCents,
      ytdCents,
      overdueCents,
      subscriptions: rows,
    });
  } catch (err) {
    console.error('[api/admin/billing]', err);
    return NextResponse.json({ error: 'Failed to load billing data' }, { status: 500 });
  }
}

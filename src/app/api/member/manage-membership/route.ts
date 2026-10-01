import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MEMBERSHIP_PLANS } from '@/lib/plans';
import { createSetPasswordToken } from '@/lib/tokens';
import { sendFamilyMemberSetupEmail } from '@/lib/email';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

// ── reconcileSubscription ─────────────────────────────────────────────────────
// Audits the Stripe subscription's add-on quantity against the actual number of
// household members in the DB and corrects any mismatch. Called after every
// mutation so billing always reflects reality.
async function reconcileSubscription(
  subscriptionId: string,
  planSlug: string,
  householdMemberCount: number,
) {
  const plan = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);
  if (!plan) return;

  const dbPlan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
  if (!dbPlan) return;

  const addonPriceCents = dbPlan.addOnPrice;
  const capCents        = dbPlan.householdCap;   // 0 means no cap
  const basePriceCents  = dbPlan.monthlyPrice;

  if (!addonPriceCents) return; // plan has no add-on (e.g. DEP Poolee)

  // Max billable add-on units before hitting the family cap
  const headroom = capCents > 0 ? Math.max(0, capCents - basePriceCents) : Infinity;
  const maxBillable = isFinite(headroom) && addonPriceCents > 0
    ? Math.floor(headroom / addonPriceCents)
    : householdMemberCount;
  const expectedQty = Math.min(householdMemberCount, maxBillable);

  const { getFamilyAddonPriceId } = await import('@/lib/plans');
  const addonPriceId = getFamilyAddonPriceId(plan);

  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  }) as any;

  const existingAddon = sub.items.data.find((i: any) => i.price.id === addonPriceId);
  const currentQty = existingAddon?.quantity ?? 0;

  if (currentQty === expectedQty) return; // already correct — nothing to do

  try {
    if (expectedQty === 0) {
      if (existingAddon) {
        await stripe.subscriptionItems.del(existingAddon.id, { proration_behavior: 'none' } as any);
      }
    } else if (existingAddon) {
      await stripe.subscriptionItems.update(existingAddon.id, {
        quantity: expectedQty,
        proration_behavior: 'none',
      });
    } else {
      await stripe.subscriptionItems.create({
        subscription: subscriptionId,
        price: addonPriceId,
        quantity: expectedQty,
        proration_behavior: 'none',
      });
    }
    console.log(`[reconcile] ${planSlug} sub ${subscriptionId}: addon qty ${currentQty} → ${expectedQty} (${householdMemberCount} household members)`);
  } catch (err: any) {
    console.error('[reconcile] Stripe correction failed:', err?.message ?? err);
  }
}

async function getMember(email: string) {
  return prisma.member.findFirst({
    where: { user: { email: { equals: email, mode: 'insensitive' } } },
    include: {
      memberships: {
        where: { status: { in: ['ACTIVE', 'PAST_DUE', 'TRIALING'] } },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      household: {
        include: {
          members: {
            include: { user: { select: { email: true } } },
          },
        },
      },
    },
  });
}

// ── GET — full membership state for the management page ──────────────────────
export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(session.user.email);
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const ms = member.memberships[0] ?? null;
  if (!ms) return NextResponse.json({ error: 'No active membership' }, { status: 404 });

  // Pull live Stripe subscription for accurate billing amount + period
  let stripeAmount: number | null = null;
  let nextBillingDate: string | null = null;
  let cancelAtPeriodEnd = ms.cancelAtPeriodEnd ?? false;

  if (ms.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(ms.stripeSubscriptionId, {
        expand: ['items.data.price'],
      }) as any;
      stripeAmount = sub.items.data.reduce((a: number, i: any) => a + i.price.unit_amount * i.quantity, 0) as number;
      // Apply discounts
      if (sub.discount?.coupon?.amount_off) stripeAmount = stripeAmount - (sub.discount.coupon.amount_off as number);
      const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;
      if (periodEnd) nextBillingDate = new Date(periodEnd * 1000).toISOString();
      cancelAtPeriodEnd = sub.cancel_at_period_end;
    } catch { /* non-fatal */ }
  }

  // Household members (excluding self)
  const householdMembers = (member.household?.members ?? [])
    .filter(m => m.id !== member.id)
    .map(m => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      isMinor: m.isMinor,
      email: m.user?.email ?? null,
    }));

  // Available plans to switch to (exclude current, exclude GAP unless already GAP)
  const currentSlug = ms.plan.slug;
  const isGap = ms.plan.isGap;
  const switchablePlans = MEMBERSHIP_PLANS.filter(p =>
    p.slug !== currentSlug &&
    !p.joinHidden &&
    (!p.isGap || isGap) // only show GAP as a switch target if already on GAP
  );

  return NextResponse.json({
    membership: {
      id: ms.id,
      plan: ms.plan.name,
      planSlug: ms.plan.slug,
      isGap: ms.plan.isGap,
      status: ms.status,
      stripeSubscriptionId: ms.stripeSubscriptionId,
      amountCents: stripeAmount,
      nextBillingDate,
      cancelAtPeriodEnd,
    },
    householdMembers,
    switchablePlans: switchablePlans.map(p => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      description: p.description,
    })),
    addOnCents: 50_00,
    capCents: ms.plan.householdCap > 0 ? ms.plan.householdCap : null,
  });
}

// ── POST — mutation actions ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const member = await getMember(session.user.email);
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const ms = member.memberships[0] ?? null;
  if (!ms) return NextResponse.json({ error: 'No active membership' }, { status: 400 });

  const body = await req.json();
  const { action } = body;

  // ── Change plan ────────────────────────────────────────────────────────────
  if (action === 'change_plan') {
    const { planSlug } = body;
    const newPlan = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);
    if (!newPlan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    if (newPlan.isGap) return NextResponse.json({ error: 'GAP plan changes require staff verification' }, { status: 400 });

    const dbPlan = await prisma.membershipPlan.findUnique({ where: { slug: planSlug } });
    if (!dbPlan) return NextResponse.json({ error: 'Plan not in DB' }, { status: 400 });
    if (!ms.stripeSubscriptionId) return NextResponse.json({ error: 'No active subscription to change.' }, { status: 400 });

    // Swap price on existing subscription (prorate immediately)
    const sub = await stripe.subscriptions.retrieve(ms.stripeSubscriptionId as string);
    const item = sub.items.data[0];
    await stripe.subscriptions.update(ms.stripeSubscriptionId as string, {
      items: [{ id: item.id, price: newPlan.stripePriceId }],
      proration_behavior: 'create_prorations',
      metadata: { planSlug: newPlan.slug },
    });

    // Update DB membership
    await prisma.membership.update({
      where: { id: ms.id },
      data: { planId: dbPlan.id },
    });

    // Reconcile add-on quantity for the new plan (household count stays the same)
    const householdCount = (member.household?.members ?? []).filter(m => m.id !== member.id).length;
    if (ms.stripeSubscriptionId) {
      await reconcileSubscription(ms.stripeSubscriptionId, newPlan.slug, householdCount);
    }

    return NextResponse.json({ ok: true });
  }

  // ── Add family member ──────────────────────────────────────────────────────
  if (action === 'add_member') {
    const { firstName, lastName, dob, email: memberEmail } = body;
    if (!firstName || !lastName) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    // Determine if minor from DOB
    const dobDate = dob ? new Date(dob) : null;
    const age = dobDate ? (Date.now() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25) : 99;
    const isMinor = age < 18;

    // Adults require an email
    if (!isMinor && !memberEmail) {
      return NextResponse.json({ error: 'Email is required for adult family members.' }, { status: 400 });
    }

    // Check for email collision
    if (memberEmail) {
      const existing = await prisma.user.findFirst({ where: { email: { equals: memberEmail, mode: 'insensitive' } } });
      if (existing) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    // Get or create household
    let householdId = member.householdId;
    if (!householdId) {
      const hh = await prisma.household.create({
        data: { name: `${member.lastName} Household`, monthlyCap: ms.plan.householdCap },
      });
      householdId = hh.id;
      await prisma.member.update({ where: { id: member.id }, data: { householdId: hh.id, isHouseholdPrimary: true } });
    }

    // Create User record for adults (minors have no login)
    let userId: string | undefined;
    if (!isMinor && memberEmail) {
      const normalizedEmail = memberEmail.toLowerCase().trim();
      // Create a user with no password — they'll set it via the email link
      const newUser = await prisma.user.create({
        data: { email: normalizedEmail },
      });
      userId = newUser.id;
    }

    // Create the new member
    const newMember = await prisma.member.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: dobDate,
        isMinor,
        status: 'ACTIVE',
        householdId,
        source: 'member-portal',
        memberCode: `${member.memberCode}H${Date.now().toString().slice(-3)}`,
        ...(userId ? { userId } : {}),
      },
    });

    // Add add-on to subscription only if under cap — never exceed householdCap
    if (ms.stripeSubscriptionId) {
      // Count household members AFTER adding the new one
      const updatedHousehold = await prisma.member.findMany({
        where: { householdId, id: { not: member.id } },
      });
      await reconcileSubscription(ms.stripeSubscriptionId, ms.plan.slug, updatedHousehold.length);
    }

    // Send setup email to adult family members
    if (!isMinor && memberEmail) {
      try {
        const token = await createSetPasswordToken(memberEmail.toLowerCase().trim());
        const setPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/set-password?token=${token}`;
        const primaryName = `${member.firstName} ${member.lastName}`;
        await sendFamilyMemberSetupEmail({
          to: memberEmail.toLowerCase().trim(),
          firstName,
          primaryName,
          setPasswordUrl,
        });
      } catch (emailErr) {
        // Non-fatal — member is created, email can be resent manually
        console.error('Failed to send family member setup email:', emailErr);
      }
    }

    return NextResponse.json({ ok: true, memberId: newMember.id, emailSent: !isMinor && !!memberEmail });
  }

  // ── Remove family member ───────────────────────────────────────────────────
  if (action === 'remove_member') {
    const { memberId } = body;
    const target = member.household?.members.find(m => m.id === memberId && m.id !== member.id);
    if (!target) return NextResponse.json({ error: 'Member not found in your household' }, { status: 404 });

    // Unlink from household (don't delete — they may still check in)
    await prisma.member.update({
      where: { id: memberId },
      data: { householdId: null, status: 'INACTIVE' },
    });

    // Reconcile add-on qty after removal
    if (ms.stripeSubscriptionId && member.householdId) {
      const remaining = await prisma.member.findMany({
        where: { householdId: member.householdId, id: { not: member.id }, status: 'ACTIVE' },
      });
      await reconcileSubscription(ms.stripeSubscriptionId, ms.plan.slug, remaining.length);
    }

    return NextResponse.json({ ok: true });
  }

  // ── Cancel subscription ────────────────────────────────────────────────────
  if (action === 'cancel') {
    if (!ms.stripeSubscriptionId) return NextResponse.json({ error: 'No active subscription to cancel.' }, { status: 400 });
    await stripe.subscriptions.update(ms.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    await prisma.membership.update({
      where: { id: ms.id },
      data: { cancelAtPeriodEnd: true },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Undo cancel ────────────────────────────────────────────────────────────
  if (action === 'reactivate') {
    if (!ms.stripeSubscriptionId) return NextResponse.json({ error: 'No active subscription to reactivate.' }, { status: 400 });
    await stripe.subscriptions.update(ms.stripeSubscriptionId as string, {
      cancel_at_period_end: false,
    });
    await prisma.membership.update({
      where: { id: ms.id },
      data: { cancelAtPeriodEnd: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

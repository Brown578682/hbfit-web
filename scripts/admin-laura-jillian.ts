/**
 * Admin script:
 *   1. Approve Laura Fenton's GAP plan (DB + Stripe subscription + approval email)
 *   2. Create Jillian Fenton as subordinate member under Laura's household
 *   3. Send Jillian a welcome/set-password email
 */

import Stripe from 'stripe';
import { prisma } from '../src/lib/prisma';
import { createSetPasswordToken } from '../src/lib/tokens';
import { sendGapApprovedEmail, sendFamilyMemberSetupEmail } from '../src/lib/email';
import { MEMBERSHIP_PLANS } from '../src/lib/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia' as any,
});
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://honorboundfit.com';

async function main() {
  // ── 1. Find Laura ──────────────────────────────────────────────────────────
  const laura = await prisma.member.findFirst({
    where: { firstName: 'Laura', lastName: 'Fenton' },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!laura) throw new Error('Laura Fenton not found');
  const lauraEmail = laura.user?.email ?? null;
  console.log(`Found Laura: id=${laura.id} email=${lauraEmail} stripe=${laura.stripeCustomerId}`);

  // ── 2. Find GAP plan ───────────────────────────────────────────────────────
  const gapPlan = MEMBERSHIP_PLANS.find((p: any) => p.isGap);
  if (!gapPlan) throw new Error('GAP plan not found in MEMBERSHIP_PLANS');
  console.log(`GAP plan: ${gapPlan.name} priceId=${gapPlan.stripePriceId}`);

  const gapDbPlan = await prisma.membershipPlan.findFirst({
    where: { isGap: true, isActive: true },
  });
  if (!gapDbPlan) throw new Error('GAP plan not in DB');

  // ── 3. Stripe: set payment method + create subscription ───────────────────
  let subscriptionId: string | null = null;
  let billingLinkNeeded = false;
  let autoActivated = false;

  if (laura.stripeCustomerId) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: laura.stripeCustomerId,
      type: 'card',
    });
    const pm = paymentMethods.data[0] ?? null;
    console.log(`Payment methods: ${paymentMethods.data.length}, using: ${pm?.id ?? 'none'}`);

    if (pm) {
      await stripe.customers.update(laura.stripeCustomerId, {
        invoice_settings: { default_payment_method: pm.id },
      });
      const subscription = await stripe.subscriptions.create({
        customer: laura.stripeCustomerId,
        items: [{ price: gapPlan.stripePriceId }],
        default_payment_method: pm.id,
        metadata: {
          customerId: laura.stripeCustomerId,
          planSlug: gapPlan.slug,
          memberName: `${laura.firstName} ${laura.lastName}`,
          standInTheGap: 'false',
        },
      });
      subscriptionId = subscription.id;
      autoActivated = true;
      console.log(`✅ Stripe subscription created: ${subscriptionId}`);
    } else {
      billingLinkNeeded = true;
      console.log('⚠️  No payment method — billing link needed');
    }
  } else {
    billingLinkNeeded = true;
  }

  // ── 4. Update Laura in DB ──────────────────────────────────────────────────
  await prisma.member.update({
    where: { id: laura.id },
    data: {
      status: 'ACTIVE',
      gapEligible: true,
      gapVerifiedAt: new Date(),
      gapVerifiedBy: 'MARKUS (Admin)',
    },
  });

  // Upsert membership row
  const existingMembership = await prisma.membership.findFirst({
    where: { memberId: laura.id, planId: gapDbPlan.id },
  });
  if (existingMembership) {
    await prisma.membership.update({
      where: { id: existingMembership.id },
      data: {
        status: 'ACTIVE',
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      },
    });
  } else {
    await prisma.membership.create({
      data: {
        memberId: laura.id,
        planId: gapDbPlan.id,
        status: 'ACTIVE',
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      },
    });
  }
  console.log(`✅ Laura DB updated — GAP ACTIVE`);

  // ── 5. Send Laura approval email ──────────────────────────────────────────
  if (lauraEmail) {
    let setPasswordUrl = `${APP_URL}/set-password`;
    try {
      const token = await createSetPasswordToken(lauraEmail);
      setPasswordUrl = `${APP_URL}/set-password?token=${token}`;
    } catch (e) { console.warn('set-password token failed:', e); }

    await sendGapApprovedEmail({
      to: lauraEmail,
      firstName: laura.firstName,
      checkoutUrl: '',
      setPasswordUrl,
      autoActivated,
    });
    console.log(`✅ Approval email sent to ${lauraEmail}`);
  }

  // ── 6. Set Laura as household primary ─────────────────────────────────────
  let householdId = laura.householdId;
  if (!householdId) {
    const household = await prisma.household.create({
      data: { name: 'Fenton Family', monthlyCap: 20000 },
    });
    householdId = household.id;
    console.log(`Created household: ${householdId}`);
  }
  await prisma.member.update({
    where: { id: laura.id },
    data: { householdId, isHouseholdPrimary: true },
  });
  console.log(`✅ Laura set as household primary`);

  // ── 7. Create Jillian ──────────────────────────────────────────────────────
  const jillianEmail = 'jillianrfenton@icloud.com';
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: jillianEmail, mode: 'insensitive' } },
  });

  if (existingUser) {
    console.log('Jillian already exists, skipping creation');
  } else {
    const addonPlan = await prisma.membershipPlan.findFirst({
      where: { slug: { contains: 'family' } },
    });
    console.log(`Add-on plan: ${addonPlan?.name ?? 'none'}`);

    const jillianUser = await prisma.user.create({
      data: { email: jillianEmail, name: 'Jillian Fenton' },
    });

    await prisma.member.create({
      data: {
        userId: jillianUser.id,
        firstName: 'Jillian',
        lastName: 'Fenton',
        status: 'ACTIVE',
        householdId,
        isHouseholdPrimary: false,
        source: 'admin-family-addon',
        ...(addonPlan ? {
          memberships: {
            create: { planId: addonPlan.id, status: 'ACTIVE' },
          },
        } : {}),
      },
    });
    console.log(`✅ Jillian member record created`);

    // ── 8. Send Jillian welcome email ─────────────────────────────────────
    const token = await createSetPasswordToken(jillianEmail);
    const setPasswordUrl = `${APP_URL}/set-password?token=${token}`;

    await sendFamilyMemberSetupEmail({
      to: jillianEmail,
      firstName: 'Jillian',
      primaryName: 'Laura Fenton',
      setPasswordUrl,
    });
    console.log(`✅ Welcome email sent to ${jillianEmail}`);
    console.log(`   Set-password URL: ${setPasswordUrl}`);
  }

  console.log('\n✅ All done.');
}

main()
  .catch(e => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

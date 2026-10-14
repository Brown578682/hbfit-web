import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";
import { MEMBERSHIP_PLANS } from "@/lib/plans";
import { createSetPasswordToken } from "@/lib/tokens";
import { sendGapApprovedEmail } from "@/lib/email";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const APP_URL = process.env.NEXTAUTH_URL ?? "https://honorboundfit.com";

// ---------------------------------------------------------------------------
// POST /api/admin/gap/[id]/approve
// ---------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const email = member.user?.email ?? null;
  const gapPlan = MEMBERSHIP_PLANS.find((p) => p.isGap);
  if (!gapPlan) {
    return NextResponse.json({ error: "GAP plan not configured" }, { status: 500 });
  }

  let verifiedBy = "Admin";
  try {
    const body = await req.json();
    if (body?.verifiedBy) verifiedBy = body.verifiedBy;
  } catch { /* no body fine */ }

  // ── 1. Update member status ───────────────────────────────────────────────
  const gapDbPlan = await prisma.membershipPlan.findFirst({
    where: { isGap: true, isActive: true },
  });

  await prisma.member.update({
    where: { id },
    data: {
      status: MemberStatus.ACTIVE,
      gapVerifiedAt: new Date(),
      gapVerifiedBy: verifiedBy,
    },
  });

  // ── 2. Create Stripe subscription using saved payment method ─────────────
  let subscriptionId: string | null = null;
  let billingLinkNeeded = false;

  if (member.stripeCustomerId) {
    try {
      // Look for a saved payment method on the customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: member.stripeCustomerId,
        type: "card",
      });

      const pm = paymentMethods.data[0] ?? null;

      if (pm) {
        // Set as default and create subscription immediately — no email needed
        await stripe.customers.update(member.stripeCustomerId, {
          invoice_settings: { default_payment_method: pm.id },
        });

        const subscription = await stripe.subscriptions.create({
          customer: member.stripeCustomerId,
          items: [{ price: gapPlan.stripePriceId }],
          default_payment_method: pm.id,
          metadata: {
            customerId: member.stripeCustomerId,
            planSlug: gapPlan.slug,
            memberName: `${member.firstName} ${member.lastName}`,
            standInTheGap: "false",
          },
        });

        subscriptionId = subscription.id;
      } else {
        // No saved payment method — fall back to billing link
        billingLinkNeeded = true;
      }
    } catch (stripeErr) {
      console.error("[gap/approve] Stripe subscription creation failed:", stripeErr);
      billingLinkNeeded = true;
    }
  } else {
    billingLinkNeeded = true;
  }

  // ── 3. Create/update Membership row ──────────────────────────────────────
  if (gapDbPlan) {
    const existing = await prisma.membership.findFirst({
      where: { memberId: id, planId: gapDbPlan.id },
    });
    if (existing) {
      await prisma.membership.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        },
      });
    } else {
      await prisma.membership.create({
        data: {
          memberId: id,
          planId: gapDbPlan.id,
          status: "ACTIVE",
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        },
      });
    }
  }

  // ── 4. Send welcome email ────────────────────────────────────────────────
  if (email) {
    let checkoutUrl: string | undefined;

    if (billingLinkNeeded && member.stripeCustomerId) {
      // No saved PM — create a checkout session as fallback
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer: member.stripeCustomerId,
          line_items: [{ price: gapPlan.stripePriceId, quantity: 1 }],
          success_url: `${APP_URL}/join/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/join?cancelled=true`,
          subscription_data: {
            metadata: {
              customerId: member.stripeCustomerId,
              planSlug: gapPlan.slug,
              memberName: `${member.firstName} ${member.lastName}`,
              standInTheGap: "false",
            },
          },
          metadata: {
            customerId: member.stripeCustomerId,
            planSlug: gapPlan.slug,
            standInTheGap: "false",
          },
        });
        checkoutUrl = session.url ?? undefined;
      } catch (e) {
        console.error("[gap/approve] fallback checkout creation failed:", e);
      }
    }

    let setPasswordUrl = `${APP_URL}/set-password`;
    try {
      const token = await createSetPasswordToken(email);
      setPasswordUrl = `${APP_URL}/set-password?token=${token}`;
    } catch (e) {
      console.error("[gap/approve] set-password token failed:", e);
    }

    try {
      await sendGapApprovedEmail({
        to: email,
        firstName: member.firstName,
        // If billing was auto-activated, no checkout URL needed
        checkoutUrl: checkoutUrl ?? "",
        setPasswordUrl,
        autoActivated: !billingLinkNeeded,
      });
    } catch (e) {
      console.error("[gap/approve] approval email failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    autoActivated: !billingLinkNeeded,
    subscriptionId,
  });
}

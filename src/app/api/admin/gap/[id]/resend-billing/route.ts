import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { MEMBERSHIP_PLANS } from "@/lib/plans";
import { createSetPasswordToken } from "@/lib/tokens";
import { sendGapApprovedEmail } from "@/lib/email";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const APP_URL = process.env.NEXTAUTH_URL ?? "https://honorboundfit.com";

// ---------------------------------------------------------------------------
// POST /api/admin/gap/[id]/resend-billing
// For already-approved GAP members with no Stripe subscription yet —
// creates a fresh Checkout session and re-sends the approval email.
// ---------------------------------------------------------------------------
export async function POST(
  _req: NextRequest,
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
  if (!email) {
    return NextResponse.json(
      { error: "Member has no email on file" },
      { status: 422 }
    );
  }

  if (!member.stripeCustomerId) {
    return NextResponse.json(
      { error: "Member has no Stripe customer record" },
      { status: 422 }
    );
  }

  const gapPlan = MEMBERSHIP_PLANS.find((p) => p.isGap);
  if (!gapPlan) {
    return NextResponse.json({ error: "GAP plan not configured" }, { status: 500 });
  }

  // Create fresh Checkout session
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
    allow_promotion_codes: false,
  });

  const checkoutUrl = session.url ?? `${APP_URL}/join`;

  // Fresh set-password token
  let setPasswordUrl = `${APP_URL}/set-password`;
  try {
    const token = await createSetPasswordToken(email);
    setPasswordUrl = `${APP_URL}/set-password?token=${token}`;
  } catch { /* non-fatal */ }

  await sendGapApprovedEmail({
    to: email,
    firstName: member.firstName,
    checkoutUrl,
    setPasswordUrl,
  });

  return NextResponse.json({ ok: true, checkoutUrl });
}

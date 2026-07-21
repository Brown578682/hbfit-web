import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

// Plan slug → Stripe price ID mapping (set these in your Stripe dashboard + env vars)
const PLAN_PRICE_MAP: Record<string, string> = {
  'individual':         process.env.STRIPE_PRICE_INDIVIDUAL         ?? 'price_individual_placeholder',
  'couple':             process.env.STRIPE_PRICE_COUPLE             ?? 'price_couple_placeholder',
  'family':             process.env.STRIPE_PRICE_FAMILY             ?? 'price_family_placeholder',
  'individual-gap':     process.env.STRIPE_PRICE_INDIVIDUAL_GAP     ?? 'price_individual_gap_placeholder',
  'couple-gap':         process.env.STRIPE_PRICE_COUPLE_GAP         ?? 'price_couple_gap_placeholder',
  'family-gap':         process.env.STRIPE_PRICE_FAMILY_GAP         ?? 'price_family_gap_placeholder',
};

function isGapPlan(slug: string): boolean {
  return slug.endsWith('-gap');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ── Extract fields ────────────────────────────────────────────────────────
    const planSlug        = (formData.get('planSlug')        as string | null)?.trim();
    const firstName       = (formData.get('firstName')       as string | null)?.trim();
    const lastName        = (formData.get('lastName')        as string | null)?.trim();
    const email           = (formData.get('email')           as string | null)?.trim();
    const phone           = (formData.get('phone')           as string | null)?.trim();
    const dob             = (formData.get('dob')             as string | null)?.trim();
    const address         = (formData.get('address')         as string | null)?.trim();
    const city            = (formData.get('city')            as string | null)?.trim();
    const state           = (formData.get('state')           as string | null)?.trim();
    const zip             = (formData.get('zip')             as string | null)?.trim();
    const householdRaw    = (formData.get('householdMembers') as string | null) ?? '[]';
    const gapDoc          = formData.get('gapDoc') as File | null;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!planSlug || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: planSlug, firstName, lastName, email' },
        { status: 400 },
      );
    }

    const priceId = PLAN_PRICE_MAP[planSlug];
    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown plan: ${planSlug}` },
        { status: 400 },
      );
    }

    let householdMembers: unknown[] = [];
    try {
      householdMembers = JSON.parse(householdRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid householdMembers JSON' }, { status: 400 });
    }

    // ── Create Stripe customer ────────────────────────────────────────────────
    const customer = await stripe.customers.create({
      name:  `${firstName} ${lastName}`,
      email: email ?? undefined,
      phone: phone ?? undefined,
      address: {
        line1:       address ?? '',
        city:        city    ?? '',
        state:       state   ?? '',
        postal_code: zip     ?? '',
        country:     'US',
      },
      metadata: {
        planSlug,
        dob:              dob             ?? '',
        householdMembers: JSON.stringify(householdMembers),
      },
    });

    // ── GAP plan path ─────────────────────────────────────────────────────────
    if (isGapPlan(planSlug)) {
      if (!gapDoc) {
        return NextResponse.json(
          { error: 'GAP plans require a verification document (gapDoc)' },
          { status: 400 },
        );
      }

      // Save document locally; replace with S3 upload in production
      const gapDocsDir = '/tmp/gap-docs';
      await mkdir(gapDocsDir, { recursive: true });

      const buffer  = Buffer.from(await gapDoc.arrayBuffer());
      const ext     = path.extname(gapDoc.name) || '.bin';
      const safeName = `${customer.id}-${Date.now()}${ext}`;
      const filePath = path.join(gapDocsDir, safeName);

      await writeFile(filePath, buffer);

      // TODO (production): upload buffer to S3
      // const s3Key = await uploadToS3(buffer, safeName, gapDoc.type);

      // Tag customer as PENDING so staff can review
      await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          gapStatus:   'PENDING',
          gapDocPath:  filePath,   // swap for s3Key in production
          gapDocName:  gapDoc.name,
          gapDocSize:  String(gapDoc.size),
        },
      });

      return NextResponse.json(
        {
          pending:    true,
          customerId: customer.id,
          message:    'Your application has been received. Staff will review your document within 24 hours.',
        },
        { status: 202 },
      );
    }

    // ── Standard plan path — create Stripe Checkout session ──────────────────
    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode:       'subscription',
      customer:   customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/join?cancelled=true`,
      subscription_data: {
        metadata: {
          customerId:  customer.id,
          planSlug,
          memberName:  `${firstName} ${lastName}`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        customerId: customer.id,
        planSlug,
      },
    });

    return NextResponse.json(
      { checkoutUrl: session.url },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error('[API /join] error:', err);

    if (err instanceof Stripe.errors.StripeError) {
      const stripeErr = err as Stripe.errors.StripeError;
      return NextResponse.json(
        { error: stripeErr.message, code: stripeErr.code },
        { status: stripeErr.statusCode ?? 500 },
      );
    }

    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

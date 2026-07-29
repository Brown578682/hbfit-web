import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { MEMBERSHIP_PLANS, STRIPE_PRICE_SITG_DONATION } from '@/lib/plans';
import { generateMemberCode } from '@/lib/memberCode';
import { sendGapPendingEmail, sendAdminGapNotification } from '@/lib/email';

export const runtime = 'nodejs';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  }
  return _stripe;
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
    const referredByName  = (formData.get('referredByName') as string | null)?.trim() ?? '';
    const standInTheGap   = formData.get('standInTheGap') === 'true';

    // ── Validate required fields ──────────────────────────────────────────────
    if (!planSlug || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: planSlug, firstName, lastName, email' },
        { status: 400 },
      );
    }

    // ── Look up plan from MEMBERSHIP_PLANS ────────────────────────────────────
    const plan = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);
    if (!plan) {
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

    // ── Look up referrer by name ──────────────────────────────────────────────
    let referredById: string | null = null;
    if (referredByName) {
      const nameParts = referredByName.split(' ').filter(Boolean);
      const refFirst = nameParts[0] ?? '';
      const refLast  = nameParts.slice(1).join(' ');
      if (refFirst && refLast) {
        const referrer = await prisma.member.findFirst({
          where: {
            firstName: { equals: refFirst, mode: 'insensitive' },
            lastName:  { equals: refLast,  mode: 'insensitive' },
            status: 'ACTIVE',
          },
          select: { id: true },
        });
        referredById = referrer?.id ?? null;
      }
    }

    // ── Create Stripe customer ────────────────────────────────────────────────
    const customer = await getStripe().customers.create({
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
        firstName:        firstName       ?? '',
        lastName:         lastName        ?? '',
        phone:            phone           ?? '',
        dob:              dob             ?? '',
        address:          address         ?? '',
        city:             city            ?? '',
        state:            state           ?? '',
        zip:              zip             ?? '',
        householdMembers: JSON.stringify(householdMembers),
        referredById:     referredById    ?? '',
        referredByName:   referredByName  ?? '',
      },
    });

    // ── GAP plan path ─────────────────────────────────────────────────────────
    if (plan.isGap) {
      if (!gapDoc) {
        return NextResponse.json(
          { error: 'GAP plans require a verification document (gapDoc)' },
          { status: 400 },
        );
      }

      // Save document locally; replace with S3 upload in production
      const gapDocsDir = '/tmp/gap-docs';
      await mkdir(gapDocsDir, { recursive: true });

      const buffer   = Buffer.from(await gapDoc.arrayBuffer());
      const ext      = path.extname(gapDoc.name) || '.bin';
      const safeName = `${customer.id}-${Date.now()}${ext}`;
      const filePath = path.join(gapDocsDir, safeName);

      await writeFile(filePath, buffer);

      // TODO (production): upload buffer to S3
      // const s3Key = await uploadToS3(buffer, safeName, gapDoc.type);

      // Tag customer as PENDING so staff can review
      await getStripe().customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          gapStatus:  'PENDING',
          gapDocPath: filePath,   // swap for s3Key in production
          gapDocName: gapDoc.name,
          gapDocSize: String(gapDoc.size),
        },
      });

      // ── Create PENDING member record in DB ────────────────────────────────
      const dateOfBirth = dob ? new Date(dob) : null;
      const memberCode  = await generateMemberCode(dateOfBirth);

      const user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          role: 'MEMBER',
        },
      });

      const member = await prisma.member.create({
        data: {
          userId:          user.id,
          firstName,
          lastName,
          phone:           phone           ?? null,
          dateOfBirth:     dateOfBirth,
          address:         address         ?? null,
          city:            city            ?? null,
          state:           state           ?? null,
          zip:             zip             ?? null,
          status:          'PENDING',
          gapEligible:     true,
          gapDocumentUrl:  filePath,
          stripeCustomerId: customer.id,
          source:          'join-form',
          memberCode,
          referredById:    referredById ?? null,
        },
      });

      // Create Household if householdMembers provided
      if (Array.isArray(householdMembers) && householdMembers.length > 0) {
        const household = await prisma.household.create({
          data: {
            name: `${lastName} Household`,
            monthlyCap: plan.cap,
          },
        });
        await prisma.member.update({
          where: { id: member.id },
          data: { householdId: household.id, isHouseholdPrimary: true },
        });
      }

      // ── Send GAP emails (non-fatal) ───────────────────────────────────────
      try {
        await sendGapPendingEmail({ to: email ?? '', firstName: firstName ?? '', planName: plan.name });
      } catch (e) { console.error('[join/gap] pending email failed:', e); }
      try {
        await sendAdminGapNotification({
          memberName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
          email: email ?? '',
          planName: plan.name,
          docPath: filePath,
        });
      } catch (e) { console.error('[join/gap] admin notification failed:', e); }

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

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: plan.stripePriceId, quantity: 1 },
    ];
    if (standInTheGap) {
      lineItems.push({ price: STRIPE_PRICE_SITG_DONATION, quantity: 1 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode:       'subscription',
      customer:   customer.id,
      line_items: lineItems,
      success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/join?cancelled=true`,
      subscription_data: {
        metadata: {
          customerId:     customer.id,
          planSlug,
          memberName:     `${firstName} ${lastName}`,
          standInTheGap:  standInTheGap ? 'true' : 'false',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        customerId: customer.id,
        planSlug,
        standInTheGap: standInTheGap ? 'true' : 'false',
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

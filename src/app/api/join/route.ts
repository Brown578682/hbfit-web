import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { MEMBERSHIP_PLANS, STRIPE_PRICE_SITG_DONATION } from '@/lib/plans';
import { generateMemberCode } from '@/lib/memberCode';
import { sendGapPendingEmail, sendAdminGapNotification, sendWelcomeEmail } from '@/lib/email';
import { createSetPasswordToken } from '@/lib/tokens';

export const runtime = 'nodejs';

// ── Bot detection (shared with poolee route) ──────────────────────────────────
const ipJoinSubmissions = new Map<string, { count: number; windowStart: number }>();
function isJoinRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipJoinSubmissions.get(ip);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    ipJoinSubmissions.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}
function looksLikeBotName(name: string): boolean {
  if (name.length > 30) return true;
  if (/[A-Z]{5,}/.test(name)) return true;
  const altCase = name.replace(/[^a-zA-Z]/g, '');
  if (altCase.length >= 8) {
    let alternations = 0;
    for (let i = 1; i < altCase.length; i++) {
      const prevUpper = altCase[i - 1] === altCase[i - 1].toUpperCase();
      const currUpper = altCase[i] === altCase[i].toUpperCase();
      if (prevUpper !== currUpper) alternations++;
    }
    if (alternations / altCase.length > 0.7) return true;
  }
  return false;
}
function looksLikeBotEmail(email: string): boolean {
  const local = email.split('@')[0] ?? '';
  const segments = local.split('.');
  const singleChars = segments.filter((s: string) => s.length === 1).length;
  return singleChars >= 4;
}

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isJoinRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

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
    const studentsRaw     = (formData.get('students')         as string | null) ?? '[]';
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

    // ── Bot detection ────────────────────────────────────────────────────────
    const honeypot = formData.get('website') as string | null;
    if (honeypot) return NextResponse.json({ ok: true }, { status: 201 });
    if (looksLikeBotName(firstName) || looksLikeBotName(lastName)) {
      console.warn(`[join] Bot name from ${ip}: ${firstName} ${lastName}`);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    if (looksLikeBotEmail(email)) {
      console.warn(`[join] Bot email from ${ip}: ${email}`);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Primary account holder must be 18+
    if (dob) {
      const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        return NextResponse.json(
          { error: 'Primary account holder must be 18 years of age or older.' },
          { status: 400 },
        );
      }
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
    let students: { firstName: string; lastName: string; dob: string; email: string }[] = [];
    try {
      students = JSON.parse(studentsRaw);
    } catch {
      return NextResponse.json({ error: 'Invalid students JSON' }, { status: 400 });
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
    // Check parent email isn't already in DB
    const existingParent = await prisma.user.findUnique({ where: { email: email! }, select: { id: true } });
    if (existingParent) {
      return NextResponse.json(
        { error: 'An account with that email already exists. Please log in or use a different email.' },
        { status: 409 },
      );
    }

    // Check household member emails for duplicates / conflicts
    const typedHousehold = householdMembers as { firstName: string; lastName: string; dob: string; email: string; phone: string }[];
    const allEmails: string[] = [email!.toLowerCase().trim()];
    for (let i = 0; i < typedHousehold.length; i++) {
      const hm = typedHousehold[i];
      if (!hm.email) continue;
      const em = hm.email.toLowerCase().trim();
      if (em === email!.toLowerCase().trim()) {
        return NextResponse.json(
          { error: `Family Member ${i + 1}: email must be different from the primary account email.` },
          { status: 400 },
        );
      }
      if (allEmails.includes(em)) {
        return NextResponse.json(
          { error: `Family Member ${i + 1}: email is already used by another member in this form.` },
          { status: 400 },
        );
      }
      const existingHm = await prisma.user.findUnique({ where: { email: em }, select: { id: true } });
      if (existingHm) {
        return NextResponse.json(
          { error: `Family Member ${i + 1}: an account with that email already exists. Please use a different email or contact us.` },
          { status: 409 },
        );
      }
      allEmails.push(em);
    }

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

      // Upload document to S3
      const buffer   = Buffer.from(await gapDoc.arrayBuffer())
      const ext      = path.extname(gapDoc.name) || '.bin'
      const safeName = `gap-docs/${customer.id}-${Date.now()}${ext}`

      const s3 = new (await import('@aws-sdk/client-s3')).S3Client({
        region: process.env.AWS_REGION ?? 'us-east-1',
        credentials: {
          accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      await s3.send(new PutObjectCommand({
        Bucket:      process.env.AWS_S3_BUCKET ?? 'hbfit-uploads',
        Key:         safeName,
        Body:        buffer,
        ContentType: gapDoc.type || 'application/octet-stream',
      }))
      const s3Key = safeName

      // Tag customer as PENDING so staff can review
      await getStripe().customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          gapStatus:  'PENDING',
          gapDocPath: s3Key,
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
          gapDocumentUrl:  s3Key,
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

      // ── Create Stripe Setup session to collect payment method upfront ────
      // Card is saved to customer but NOT charged until admin approves.
      const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const setupSession = await getStripe().checkout.sessions.create({
        mode: 'setup',
        customer: customer.id,
        currency: 'usd',
        success_url: `${origin}/join/pending?setup=complete`,
        cancel_url:  `${origin}/join?cancelled=true`,
        metadata: {
          customerId: customer.id,
          planSlug,
          gapSetup: 'true',
        },
      });

      // ── Send GAP emails (non-fatal) ───────────────────────────────────────
      try {
        await sendGapPendingEmail({ to: email ?? '', firstName: firstName ?? '', planName: plan.name });
      } catch (e) { console.error('[join/gap] pending email failed:', e); }
      try {
        await sendAdminGapNotification({
          memberName: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
          email: email ?? '',
          planName: plan.name,
          docPath: s3Key,
        });
      } catch (e) { console.error('[join/gap] admin notification failed:', e); }

      return NextResponse.json(
        {
          pending:      true,
          checkoutUrl:  setupSession.url,
          customerId:   customer.id,
          message:      'Your application has been received. Staff will review your document within 24 hours.',
        },
        { status: 202 },
      );
    }

    // ── Create student portal accounts for Homeschool Heroes ───────────────
    if (planSlug === 'homeschool-heroes' && students.length > 0) {
      const appUrl = process.env.NEXTAUTH_URL ?? 'https://honorboundfit.com';

      // Server-side email uniqueness check before doing anything
      const parentEmail = email?.toLowerCase().trim() ?? '';
      const studentEmails = students.map(s => s.email?.toLowerCase().trim() ?? '');

      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const em = s.email?.toLowerCase().trim() ?? '';

        if (!em) {
          return NextResponse.json(
            { error: `Student ${i + 1}: email is required.` },
            { status: 400 },
          );
        }
        if (em === parentEmail) {
          return NextResponse.json(
            { error: `Student ${i + 1}: email must be different from the parent/guardian email.` },
            { status: 400 },
          );
        }
        if (studentEmails.indexOf(em) !== i) {
          return NextResponse.json(
            { error: `Student ${i + 1}: email is already used by another student in this form.` },
            { status: 400 },
          );
        }
        // Check against existing DB users
        const existing = await prisma.user.findUnique({ where: { email: em }, select: { id: true } });
        if (existing) {
          return NextResponse.json(
            { error: `Student ${i + 1}: an account with that email already exists. Please use a different email or contact us if you need help.` },
            { status: 409 },
          );
        }
      }

      for (const s of students) {
        // Guard: skip if student email is missing OR same as parent email
        // (prevents creating the student on the parent's User record)
        if (!s.email || s.email.toLowerCase() === email?.toLowerCase()) continue;
        try {
          const studentUser = await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: { email: s.email, name: s.firstName + ' ' + s.lastName, role: 'MEMBER' },
          });
          const studentMember = await prisma.member.upsert({
            where: { userId: studentUser.id },
            update: {},
            create: {
              userId: studentUser.id,
              firstName: s.firstName,
              lastName: s.lastName,
              dateOfBirth: s.dob ? new Date(s.dob) : null,
              status: 'ACTIVE',
              source: 'homeschool-heroes',
            },
          });
          // Create Membership row so plan shows in coach portal
          const dbPlan = await prisma.membershipPlan.findUnique({ where: { slug: 'homeschool-heroes' } });
          if (dbPlan) {
            const existing = await prisma.membership.findFirst({ where: { memberId: studentMember.id, planId: dbPlan.id } });
            if (!existing) {
              await prisma.membership.create({
                data: { memberId: studentMember.id, planId: dbPlan.id, status: 'ACTIVE' },
              });
            }
          }
          const token = await createSetPasswordToken(s.email);
          const setPasswordUrl = appUrl + '/set-password?token=' + token;
          await sendWelcomeEmail({
            to: s.email,
            firstName: s.firstName,
            planName: 'Homeschool Heroes',
            price: 0,
            nextBillingDate: '',
            isGap: false,
            standInTheGap: false,
            setPasswordUrl,
          });
        } catch (e) {
          console.error('[join/homeschool] student account creation failed:', e);
        }
      }
    }

    // ── Standard plan path — create Stripe Checkout session ──────────────────
    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: plan.stripePriceId, quantity: 1 },
    ];

    // HH: base covers 1 adult + 1 student. Additional members beyond that are $50 each.
    // All other plans: base covers 1, each additional household member is $50.
    // In both cases, total is capped at plan.cap.
    if (planSlug === 'homeschool-heroes') {
      const totalMembers = 1 + students.length + householdMembers.length;
      const addOns = totalMembers - plan.baseIncludes; // baseIncludes = 2
      if (addOns > 0) {
        // Cap: max add-ons = (cap - base price) / addOn rate
        const maxAddOns = plan.cap > 0 ? Math.floor((plan.cap - plan.price) / plan.addOn) : addOns;
        const cappedAddOns = Math.min(addOns, maxAddOns);
        const { getFamilyAddonPriceId } = await import('@/lib/plans');
        lineItems.push({ price: getFamilyAddonPriceId(plan), quantity: cappedAddOns });
      }
    } else if (householdMembers.length > 0) {
      const maxAddOns = plan.cap > 0 ? Math.floor((plan.cap - plan.price) / plan.addOn) : householdMembers.length;
      const cappedAddOns = Math.min(householdMembers.length, maxAddOns);
      const { getFamilyAddonPriceId } = await import('@/lib/plans');
      lineItems.push({ price: getFamilyAddonPriceId(plan), quantity: cappedAddOns });
    }

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
          // HH signups with students → parent gets hh-parent plan (HH + Open Gym access)
          planSlug:       planSlug,
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

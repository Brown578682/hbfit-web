import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSetPasswordToken } from '@/lib/tokens';
import { sendPooleeConfirmationEmail, sendAdminPooleeNotification } from '@/lib/email';

export const runtime = 'nodejs';

// ── Simple in-memory rate limiter (per IP, resets on cold start) ──────────────
const ipSubmissions = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 3;          // max submissions
const RATE_WINDOW = 60 * 60 * 1000; // per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipSubmissions.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW) {
    ipSubmissions.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ── Name sanity check — rejects random-character strings ─────────────────────
// Real names: mostly lowercase with a capital, max ~20 chars, no long uppercase runs.
function looksLikeBotName(name: string): boolean {
  if (name.length > 30) return true;
  // More than 4 consecutive uppercase letters = generated string
  if (/[A-Z]{5,}/.test(name)) return true;
  // Alternating-case gibberish: aBcDeFg pattern over 8+ chars
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

// ── Email sanity check — dots-in-local pattern used by bots ──────────────────
// Bots generate addresses like: lu.t.zt.e.re.n.s.39@gmail.com
function looksLikeBotEmail(email: string): boolean {
  const local = email.split('@')[0] ?? '';
  // More than 4 single-char segments separated by dots = bot pattern
  const segments = local.split('.');
  const singleChars = segments.filter(s => s.length === 1).length;
  if (singleChars >= 4) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      branch, shipDate, recruiterName, recruiterPhone,
      agreeToTerms, agreeToHealth,
      // Honeypot — bots fill this, humans never see it (hidden via CSS)
      website,
    } = body;

    // ── Honeypot check ───────────────────────────────────────────────────────
    if (website) {
      // Silently succeed so bots don't know they were blocked
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Required field validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() ||
        !branch || !shipDate || !recruiterName?.trim()) {
      return NextResponse.json({ error: 'All required fields must be completed.' }, { status: 400 });
    }
    if (!agreeToTerms || !agreeToHealth) {
      return NextResponse.json({ error: 'You must agree to the terms and health confirmation to continue.' }, { status: 400 });
    }

    // ── Bot name/email detection ─────────────────────────────────────────────
    if (looksLikeBotName(firstName.trim()) || looksLikeBotName(lastName.trim())) {
      console.warn(`[poolee] Bot name detected from ${ip}: ${firstName} ${lastName}`);
      return NextResponse.json({ ok: true }, { status: 201 }); // silent rejection
    }
    if (looksLikeBotEmail(email.trim())) {
      console.warn(`[poolee] Bot email detected from ${ip}: ${email}`);
      return NextResponse.json({ ok: true }, { status: 201 }); // silent rejection
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email uniqueness check
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists. Contact rich@honorboundfit.com if you need help.' }, { status: 409 });
    }

    // Upsert the poolee plan in DB (idempotent)
    const poolee_plan = await prisma.membershipPlan.upsert({
      where: { slug: 'poolee' },
      create: {
        name: 'DEP Poolee',
        slug: 'poolee',
        description: 'Free membership for active DEP poolees. Valid while DEP enrollment is active.',
        monthlyPrice: 0,
        addOnPrice: 0,
        householdCap: 0,
        isGap: false,
        isActive: true,
        requiresApproval: true,
        sortOrder: 99,
      },
      update: {},
    });

    // Create User + Member + Membership
    const user = await prisma.user.create({
      data: { email: normalizedEmail },
    });

    await prisma.member.create({
      data: {
        userId: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        status: 'PENDING',
        source: 'dep-poolee',
        notes: `Branch: ${branch} | Ship Date: ${shipDate} | Recruiter: ${recruiterName.trim()}${recruiterPhone ? ` (${recruiterPhone.trim()})` : ''}`,
        memberships: {
          create: {
            planId: poolee_plan.id,
            status: 'ACTIVE',
          },
        },
      },
    });

    // Generate set-password token for admin to forward
    const token = await createSetPasswordToken(normalizedEmail);
    const setPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/set-password?token=${token}`;

    // Send emails (non-fatal)
    await Promise.allSettled([
      sendPooleeConfirmationEmail({ to: normalizedEmail, firstName: firstName.trim() }),
      sendAdminPooleeNotification({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        branch,
        shipDate,
        recruiterName: recruiterName.trim(),
        recruiterPhone: recruiterPhone?.trim(),
        setPasswordUrl,
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error('[/api/join/poolee]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again or email rich@honorboundfit.com.' }, { status: 500 });
  }
}

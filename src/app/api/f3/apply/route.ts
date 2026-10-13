import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendF3ApplicationConfirmation, sendAdminF3Notification } from '@/lib/email';

export const runtime = 'nodejs';

// ── Rate limiting ─────────────────────────────────────────────────────────────
const ipF3Submissions = new Map<string, { count: number; windowStart: number }>();
function isF3RateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipF3Submissions.get(ip);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    ipF3Submissions.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// ── Bot detection ─────────────────────────────────────────────────────────────
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

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isF3RateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();

    // ── Honeypot ──────────────────────────────────────────────────────────────
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // ── Extract fields ────────────────────────────────────────────────────────
    const firstName             = (body.firstName            as string | undefined)?.trim() ?? '';
    const lastName              = (body.lastName             as string | undefined)?.trim() ?? '';
    const email                 = (body.email                as string | undefined)?.trim() ?? '';
    const phone                 = (body.phone                as string | undefined)?.trim() ?? '';
    const address               = (body.address              as string | undefined)?.trim() ?? '';
    const city                  = (body.city                 as string | undefined)?.trim() ?? '';
    const state                 = (body.state                as string | undefined)?.trim() ?? '';
    const zip                   = (body.zip                  as string | undefined)?.trim() ?? '';
    const numberOfFosterChildren = Number(body.numberOfFosterChildren);
    const fosteringDuration     = (body.fosteringDuration    as string | undefined)?.trim() ?? '';
    const agencyName            = (body.agencyName           as string | undefined)?.trim() || null;
    const heardAboutUs          = (body.heardAboutUs         as string | undefined)?.trim() || null;
    const additionalNotes       = (body.additionalNotes      as string | undefined)?.trim() || null;

    // ── Validate required fields ──────────────────────────────────────────────
    const missing: string[] = [];
    if (!firstName)         missing.push('firstName');
    if (!lastName)          missing.push('lastName');
    if (!email)             missing.push('email');
    if (!phone)             missing.push('phone');
    if (!address)           missing.push('address');
    if (!city)              missing.push('city');
    if (!state)             missing.push('state');
    if (!zip)               missing.push('zip');
    if (!fosteringDuration) missing.push('fosteringDuration');
    if (isNaN(numberOfFosterChildren) || numberOfFosterChildren < 0) {
      missing.push('numberOfFosterChildren');
    }
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 },
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // ── Bot detection ─────────────────────────────────────────────────────────
    if (looksLikeBotName(firstName) || looksLikeBotName(lastName)) {
      console.warn(`[f3/apply] Bot name from ${ip}: ${firstName} ${lastName}`);
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    if (looksLikeBotEmail(email)) {
      console.warn(`[f3/apply] Bot email from ${ip}: ${email}`);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // ── Save to database ──────────────────────────────────────────────────────
    await prisma.f3Application.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zip,
        numberOfFosterChildren,
        fosteringDuration,
        agencyName,
        heardAboutUs,
        additionalNotes,
        status: 'pending',
      },
    });

    // ── Fire-and-forget emails ────────────────────────────────────────────────
    sendF3ApplicationConfirmation({ to: email, firstName, lastName }).catch((e) => {
      console.error('[f3/apply] confirmation email failed:', e);
    });
    sendAdminF3Notification({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      numberOfFosterChildren,
      fosteringDuration,
      agencyName,
      heardAboutUs,
      additionalNotes,
    }).catch((e) => {
      console.error('[f3/apply] admin notification failed:', e);
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    console.error('[API /f3/apply] error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}

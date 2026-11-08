// POST /api/guest/register
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendGuestPassConfirmation, sendAdminGuestPassNotification } from '@/lib/email'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

// ── Bot detection ─────────────────────────────────────────────────────────────
const _ipGuestSubmissions = new Map<string, { count: number; windowStart: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _ipGuestSubmissions.get(ip);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    _ipGuestSubmissions.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}
function looksLikeBotName(name: string): boolean {
  if (!name || name.length < 2) return true;
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
  const lower = name.toLowerCase().replace(/[^a-z]/g, '');
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(lower)) return true;
  if (lower.length > 3 && !/[aeiou]/.test(lower)) return true;
  const vowels = (lower.match(/[aeiou]/g) || []).length;
  if (lower.length > 5 && vowels / lower.length < 0.15) return true;
  return false;
}
function looksLikeBotEmail(email: string): boolean {
  const local = email.split('@')[0] ?? '';
  const segments = local.split('.');
  const singleChars = segments.filter((s: string) => s.length === 1).length;
  if (singleChars >= 4) return true;
  const throwaway = ['mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
    'sharklasers.com','grr.la','guerrillamail.info','spam4.me','trashmail.com',
    'yopmail.com','dispostable.com','maildrop.cc','fakeinbox.com'];
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (throwaway.includes(domain)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // ── Bot-spam hardening ───────────────────────────────────────────────────
    const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });

    const body = await req.json();
    const {
      firstName, lastName, email, phone, dateOfBirth,
      visitType, interests, howHeard, marketingOptIn,
    } = body;

    // Honeypot
    if (body.hb_website || body.website) return NextResponse.json({ ok: true }, { status: 201 });

    // Timing check
    const formLoadedAt = Number(body.formLoadedAt ?? 0);
    if (formLoadedAt && Date.now() - formLoadedAt < 4000) {
      console.warn('[guest/register] timing bot from', ip);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Name check
    if (looksLikeBotName(firstName) || looksLikeBotName(lastName)) return NextResponse.json({ ok: true }, { status: 201 });

    // Email check
    if (looksLikeBotEmail(email ?? '')) return NextResponse.json({ ok: true }, { status: 201 });

    // ── Required field validation ─────────────────────────────────────────────
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !dateOfBirth) {
      return NextResponse.json({ error: 'All required fields must be completed.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!visitType) {
      return NextResponse.json({ error: 'Please select what brings you in today.' }, { status: 400 })
    }

    // Age check — 18+
    const dob = new Date(dateOfBirth)
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 18)
    if (dob > cutoff) {
      return NextResponse.json({ error: 'Guests must be 18 or older.' }, { status: 400 })
    }

    // Build notes string
    const visitLabels: Record<string, string> = {
      'free-week': 'Free Week Trial',
      'drop-in':   'Drop-In Class',
      'tour':      'Just Looking / Tour',
    }
    const noteParts: string[] = [
      `Visit type: ${visitLabels[visitType] ?? visitType}`,
    ]
    if (interests?.length > 0) noteParts.push(`Interests: ${(interests as string[]).join(', ')}`)
    if (howHeard) noteParts.push(`How heard: ${howHeard}`)

    noteParts.push(`IP: ${ip}`)

    const lead = await (prisma as any).boothLead.create({
      data: {
        firstName:      firstName.trim(),
        lastName:       lastName.trim(),
        email:          email.trim().toLowerCase(),
        phone:          phone.trim(),
        dateOfBirth:    dob,
        waiverSigned:   true,
        marketingOptIn: marketingOptIn ?? true,
        source:         `guest-pass-${visitType}`,
        notes:          noteParts.join(' | '),
      },
    })

    // Fire emails — don't fail the request if they fail
    const emailPromises = [
      sendGuestPassConfirmation({
        to:        email.trim(),
        firstName: firstName.trim(),
        visitType: visitLabels[visitType] ?? visitType,
        interests: interests ?? [],
      }).catch(err => console.error('[guest/register] visitor email failed:', err)),

      sendAdminGuestPassNotification({
        firstName:  firstName.trim(),
        lastName:   lastName.trim(),
        email:      email.trim(),
        phone:      phone.trim(),
        visitType:  visitLabels[visitType] ?? visitType,
        interests:  interests ?? [],
        howHeard:   howHeard ?? '',
        leadId:     lead.id,
      }).catch(err => console.error('[guest/register] admin email failed:', err)),
    ]

    await Promise.allSettled(emailPromises)

    return NextResponse.json({ ok: true, id: lead.id })
  } catch (err) {
    console.error('[guest/register]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

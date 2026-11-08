import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotificationEmail } from "@/lib/email";

// ── Bot detection ─────────────────────────────────────────────────────────────
const _ipContactSubmissions = new Map<string, { count: number; windowStart: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _ipContactSubmissions.get(ip);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    _ipContactSubmissions.set(ip, { count: 1, windowStart: now });
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

export async function POST(req: Request) {
  try {
    // ── Bot-spam hardening ───────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });

    const body = await req.json();
    const { name, email, subject, message } = body;

    // Honeypot
    if (body.hb_website || body.website) return NextResponse.json({ ok: true }, { status: 201 });

    // Timing check
    const formLoadedAt = Number(body.formLoadedAt ?? 0);
    if (formLoadedAt && Date.now() - formLoadedAt < 4000) {
      console.warn('[contact] timing bot from', ip);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Name check — single name field, check as a whole
    if (looksLikeBotName(name)) return NextResponse.json({ ok: true }, { status: 201 });

    // Email check
    if (looksLikeBotEmail(email ?? '')) return NextResponse.json({ ok: true }, { status: 201 });

    // ── Validation ───────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    });

    // Fire-and-forget notification email to admin
    sendContactNotificationEmail({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
    }).catch((err) => console.error("[contact] notification email failed:", err));

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

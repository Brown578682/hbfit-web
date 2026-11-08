import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CorporateTier, CorporateStatus } from "@prisma/client";
import {
  sendCorporateInviteEmail,
  sendCorporateAdminNotification,
} from "@/lib/email";

// ---------------------------------------------------------------------------
// POST /api/corporate/enroll
// Registers a new corporate account and sends invite emails to all employees.
// ---------------------------------------------------------------------------

const TIER_LIMITS: Record<CorporateTier, number> = {
  SMALL: 5,
  MEDIUM: 15,
  LARGE: 50,
};

const VALID_TIERS = new Set<string>(["SMALL", "MEDIUM", "LARGE"]);

// ── Bot detection ─────────────────────────────────────────────────────────────
const _ipCorporateSubmissions = new Map<string, { count: number; windowStart: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _ipCorporateSubmissions.get(ip);
  if (!entry || now - entry.windowStart > 60 * 60 * 1000) {
    _ipCorporateSubmissions.set(ip, { count: 1, windowStart: now });
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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) return NextResponse.json({ error: 'Too many submissions.' }, { status: 429 });

    const body = await req.json();
    const {
      companyName,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      planTier,
      managerParticipates,
      employees,
    } = body;

    // Honeypot
    if (body.hb_website || body.website) return NextResponse.json({ ok: true }, { status: 201 });

    // Timing check
    const formLoadedAt = Number(body.formLoadedAt ?? 0);
    if (formLoadedAt && Date.now() - formLoadedAt < 4000) {
      console.warn('[corporate/enroll] timing bot from', ip);
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Name check — use contact name fields (may be undefined for bots filling random data)
    if (contactFirstName && looksLikeBotName(contactFirstName)) return NextResponse.json({ ok: true }, { status: 201 });
    if (contactLastName && looksLikeBotName(contactLastName)) return NextResponse.json({ ok: true }, { status: 201 });

    // Email check
    if (looksLikeBotEmail(contactEmail ?? '')) return NextResponse.json({ ok: true }, { status: 201 });

    // ── Validation ──────────────────────────────────────────────────────────

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json(
        { error: "companyName is required" },
        { status: 400 }
      );
    }

    if (
      !contactEmail ||
      typeof contactEmail !== "string" ||
      !contactEmail.trim()
    ) {
      return NextResponse.json(
        { error: "contactEmail is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json(
        { error: "At least one employee is required" },
        { status: 400 }
      );
    }

    if (!planTier || !VALID_TIERS.has(planTier)) {
      return NextResponse.json(
        { error: "planTier must be SMALL, MEDIUM, or LARGE" },
        { status: 400 }
      );
    }

    const seatLimit = TIER_LIMITS[planTier as CorporateTier];
    // Total seats = employee list + 1 if manager is participating
    const managerSeat = managerParticipates === true ? 1 : 0;
    const totalUsed = employees.length + managerSeat;
    if (totalUsed > seatLimit) {
      return NextResponse.json(
        {
          error: `${planTier} plan supports up to ${seatLimit} total participants; ${totalUsed} provided`,
        },
        { status: 400 }
      );
    }

    // Manager email must not be duplicated in employee list when participating
    if (managerParticipates) {
      const managerEmailLower = contactEmail.trim().toLowerCase();
      const dup = (employees as Array<{ email: string }>).find(
        (e) => e.email?.trim().toLowerCase() === managerEmailLower
      );
      if (dup) {
        return NextResponse.json(
          { error: "Manager email cannot also appear in the employee list when manager is participating." },
          { status: 400 }
        );
      }
    }

    // ── Create CorporateAccount ─────────────────────────────────────────────

    const account = await prisma.corporateAccount.create({
      data: {
        companyName: companyName.trim(),
        contactFirstName: contactFirstName?.trim() ?? "",
        contactLastName: contactLastName?.trim() ?? "",
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone?.trim() ?? null,
        planTier: planTier as CorporateTier,
        status: CorporateStatus.PENDING,
        seatCount: 0,
      },
    });

    // ── Create CorporateEmployee records ────────────────────────────────────

    const now = new Date();
    const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    const createdEmployees = await Promise.all(
      (
        employees as Array<{ firstName: string; lastName: string; email: string }>
      ).map((emp) =>
        prisma.corporateEmployee.create({
          data: {
            accountId: account.id,
            firstName: emp.firstName?.trim() ?? "",
            lastName: emp.lastName?.trim() ?? "",
            email: emp.email?.trim().toLowerCase() ?? "",
            inviteToken: crypto.randomUUID(),
            inviteExpiresAt,
          },
        })
      )
    );

    // ── Send invite emails ──────────────────────────────────────────────────

    await Promise.allSettled(
      createdEmployees.map((emp) =>
        sendCorporateInviteEmail({
          to: emp.email,
          firstName: emp.firstName,
          companyName: companyName.trim(),
          inviteToken: emp.inviteToken!,
        })
      )
    );

    // ── Update seatCount ────────────────────────────────────────────────────

    await prisma.corporateAccount.update({
      where: { id: account.id },
      data: { seatCount: totalUsed },
    });

    // ── If manager participates, create their employee record too ───────────

    if (managerParticipates) {
      const managerEmployee = await prisma.corporateEmployee.create({
        data: {
          accountId: account.id,
          firstName: contactFirstName?.trim() ?? "",
          lastName: contactLastName?.trim() ?? "",
          email: contactEmail.trim().toLowerCase(),
          inviteToken: crypto.randomUUID(),
          inviteExpiresAt,
        },
      });
      // Send their invite (non-fatal)
      await sendCorporateInviteEmail({
        to: managerEmployee.email,
        firstName: managerEmployee.firstName,
        companyName: companyName.trim(),
        inviteToken: managerEmployee.inviteToken!,
      }).catch((err: unknown) => {
        console.error("[/api/corporate/enroll] manager invite email failed:", err);
      });
    }

    // ── Admin notification ──────────────────────────────────────────────────

    await sendCorporateAdminNotification({
      companyName: companyName.trim(),
      contactName: `${contactFirstName?.trim() ?? ""} ${contactLastName?.trim() ?? ""}`.trim(),
      contactEmail: contactEmail.trim(),
      planTier,
      employeeCount: totalUsed,
    }).catch((err: unknown) => {
      // Non-fatal — log but don't fail the request
      console.error("[/api/corporate/enroll] admin notification failed:", err);
    });

    return NextResponse.json({
      success: true,
      accountId: account.id,
      employeeCount: employees.length,
    });
  } catch (err) {
    console.error("[/api/corporate/enroll]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

export async function POST(req: NextRequest) {
  try {
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

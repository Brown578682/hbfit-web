import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { CorporateStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// GET  /api/admin/corporate   — list all corporate accounts (ADMIN only)
// PATCH /api/admin/corporate  — update a corporate account's status (ADMIN only)
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set<string>(["PENDING", "ACTIVE", "PAUSED", "CANCELED"]);

// ── Auth guard ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.corporateAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employees: {
          select: { status: true },
        },
      },
    });

    const result = accounts.map((account) => {
      const totalEmployees = account.employees.length;
      const activeEmployees = account.employees.filter(
        (e) => e.status === "ACTIVE"
      ).length;
      const invitedEmployees = account.employees.filter(
        (e) => e.status === "INVITED"
      ).length;

      return {
        id: account.id,
        companyName: account.companyName,
        contactFirstName: account.contactFirstName,
        contactLastName: account.contactLastName,
        contactEmail: account.contactEmail,
        contactPhone: account.contactPhone ?? null,
        planTier: account.planTier,
        status: account.status,
        seatCount: account.seatCount,
        createdAt: account.createdAt.toISOString(),
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          invited: invitedEmployees,
        },
      };
    });

    return NextResponse.json({ accounts: result, total: result.length });
  } catch (err) {
    console.error("[GET /api/admin/corporate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountId, status } = body;

    if (!accountId || typeof accountId !== "string") {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "status must be PENDING, ACTIVE, PAUSED, or CANCELED" },
        { status: 400 }
      );
    }

    const existing = await prisma.corporateAccount.findUnique({
      where: { id: accountId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Corporate account not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.corporateAccount.update({
      where: { id: accountId },
      data: { status: status as CorporateStatus },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: updated.id,
        companyName: updated.companyName,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("[PATCH /api/admin/corporate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

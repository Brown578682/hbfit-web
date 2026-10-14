import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CorporateEmployeeStatus, MemberStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// GET  /api/corporate/onboard?token=XYZ
//   Validates an invite token and returns employee + company info.
//
// POST /api/corporate/onboard
//   Completes onboarding: creates User, Member, MemberOnboarding, activates
//   CorporateEmployee, and increments the parent account's seatCount.
// ---------------------------------------------------------------------------

// ── Shared token lookup & validation ────────────────────────────────────────

async function lookupValidEmployee(token: string | null) {
  if (!token) {
    return { error: "token is required", status: 400, employee: null };
  }

  const employee = await prisma.corporateEmployee.findUnique({
    where: { inviteToken: token },
    include: { account: { select: { id: true, companyName: true } } },
  });

  if (!employee) {
    return { error: "Invalid invite token", status: 404, employee: null };
  }

  if (employee.inviteAcceptedAt) {
    return { error: "Invite has already been accepted", status: 409, employee: null };
  }

  if (employee.inviteExpiresAt && employee.inviteExpiresAt < new Date()) {
    return { error: "Invite token has expired", status: 410, employee: null };
  }

  return { error: null, status: 200, employee };
}

// ── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    const { error, status, employee } = await lookupValidEmployee(token);

    if (error || !employee) {
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
      },
      company: {
        companyName: employee.account.companyName,
      },
    });
  } catch (err) {
    console.error("[GET /api/corporate/onboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, phone, dateOfBirth } = body;

    // Validate token
    const { error, status, employee } = await lookupValidEmployee(token);
    if (error || !employee) {
      return NextResponse.json({ error }, { status });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Create User ─────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        email: employee.email,
        passwordHash,
        role: "MEMBER",
      },
    });

    // ── Create Member ───────────────────────────────────────────────────────
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: phone?.trim() ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        status: MemberStatus.ACTIVE,
        source: "corporate",
      },
    });

    // ── Create MemberOnboarding ─────────────────────────────────────────────
    await prisma.memberOnboarding.create({
      data: {
        memberId: member.id,
        currentStep: 1,
      },
    });

    // ── Activate CorporateEmployee & increment seatCount ────────────────────
    await prisma.$transaction([
      prisma.corporateEmployee.update({
        where: { id: employee.id },
        data: {
          memberId: member.id,
          status: CorporateEmployeeStatus.ACTIVE,
          inviteAcceptedAt: new Date(),
        },
      }),
      prisma.corporateAccount.update({
        where: { id: employee.account.id },
        data: { seatCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, memberId: member.id });
  } catch (err) {
    console.error("[POST /api/corporate/onboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

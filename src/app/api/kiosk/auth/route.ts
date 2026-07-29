import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

/**
 * POST /api/kiosk/auth
 * Body: { memberCode: string; pin: string }
 * Returns: { ok: true; member: { id, firstName, lastName, memberCode } }
 *       or 401 on bad credentials
 */
export async function POST(req: NextRequest) {
  try {
    const { memberCode, pin } = await req.json() as { memberCode?: string; pin?: string };

    if (!memberCode || !pin) {
      return NextResponse.json({ error: "memberCode and pin required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { memberCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        memberCode: true,
        memberPinHash: true,
        status: true,
        householdId: true,
      },
    });

    if (!member || !member.memberPinHash) {
      return NextResponse.json({ error: "Invalid code or PIN" }, { status: 401 });
    }

    if (member.status !== "ACTIVE" && member.status !== "TRIALING" as any) {
      return NextResponse.json({ error: "Membership is not active" }, { status: 403 });
    }

    const ok = await bcrypt.compare(pin, member.memberPinHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid code or PIN" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      member: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        memberCode: member.memberCode,
        householdId: member.householdId,
      },
    });
  } catch (err) {
    console.error("[kiosk/auth]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

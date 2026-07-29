import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPin, verifyPin } from "@/lib/memberCode";

/**
 * GET /api/member/pin
 * Returns { memberCode, hasPin } for the authenticated member.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { memberCode: true, memberPinHash: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({
    memberCode: member.memberCode ?? null,
    hasPin: !!member.memberPinHash,
  });
}

/**
 * POST /api/member/pin
 * Body: { pin: string, currentPin?: string }
 * Sets or changes the member's 4-digit kiosk PIN.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { pin?: string; currentPin?: string };
  const { pin, currentPin } = body;

  // Validate new PIN
  if (!pin || !/^[0-9]{4}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be exactly 4 digits (0–9)." },
      { status: 400 }
    );
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, memberCode: true, memberPinHash: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // If a PIN is already set, require and verify the current PIN
  if (member.memberPinHash) {
    if (!currentPin) {
      return NextResponse.json(
        { error: "Current PIN is required to change your PIN." },
        { status: 400 }
      );
    }
    const valid = await verifyPin(currentPin, member.memberPinHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current PIN is incorrect." },
        { status: 400 }
      );
    }
  }

  const newHash = await hashPin(pin);

  await prisma.member.update({
    where: { id: member.id },
    data: { memberPinHash: newHash },
  });

  return NextResponse.json({ ok: true, memberCode: member.memberCode ?? null });
}

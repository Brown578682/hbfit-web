import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/member/preferred-coach
 * Returns { preferredCoachId, coach } for the authenticated member.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { preferredCoachId: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  let coach = null;
  if (member.preferredCoachId) {
    coach = await prisma.staff.findUnique({
      where: { id: member.preferredCoachId },
      select: { id: true, firstName: true, lastName: true, title: true, bio: true, photoUrl: true },
    });
  }

  return NextResponse.json({
    preferredCoachId: member.preferredCoachId ?? null,
    coach: coach ?? null,
  });
}

/**
 * PUT /api/member/preferred-coach
 * Body: { preferredCoachId: string | "" }
 * Saves the member's preferred coach (Staff.id) or clears it.
 */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { preferredCoachId } = await req.json() as { preferredCoachId?: string };

  const member = await prisma.member.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  await prisma.member.update({
    where: { id: member.id },
    data: { preferredCoachId: preferredCoachId || null },
  });

  return NextResponse.json({ ok: true });
}

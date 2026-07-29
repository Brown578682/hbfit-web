import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MemberStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// POST /api/admin/gap/[id]/approve
// ---------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find the member
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Look up the GAP membership plan
  const gapPlan = await prisma.membershipPlan.findFirst({
    where: { isGap: true, isActive: true },
  });

  // Parse optional body for verifiedBy name
  let verifiedBy = "Admin";
  try {
    const body = await req.json();
    if (body?.verifiedBy) verifiedBy = body.verifiedBy;
  } catch {
    // no body is fine
  }

  // Run everything in a transaction
  await prisma.$transaction(async (tx) => {
    // Update member status
    await tx.member.update({
      where: { id },
      data: {
        status: MemberStatus.ACTIVE,
        gapVerifiedAt: new Date(),
        gapVerifiedBy: verifiedBy,
      },
    });

    // Create membership if we found a GAP plan
    if (gapPlan) {
      await tx.membership.create({
        data: {
          memberId: id,
          planId: gapPlan.id,
          status: "ACTIVE",
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

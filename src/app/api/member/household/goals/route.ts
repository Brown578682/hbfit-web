import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/member/household/goals
 * Returns goals for all members in the same household (excluding the caller).
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true, householdId: true },
  });

  if (!member?.householdId) {
    return NextResponse.json([]); // no household
  }

  const household = await prisma.household.findUnique({
    where: { id: member.householdId },
    include: {
      members: {
        where: { id: { not: member.id } }, // exclude self
        select: {
          id: true,
          firstName: true,
          lastName: true,
          goals: {
            where: { completedAt: null },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              description: true,
              targetDate: true,
              createdAt: true,
              milestones: { select: { achievedAt: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(household?.members ?? []);
}

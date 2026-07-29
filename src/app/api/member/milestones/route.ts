import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// GET /api/member/milestones — this member's milestones
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const milestones = await prisma.milestone.findMany({
    where: { memberId: member.id, achievedAt: { not: null } },
    orderBy: { achievedAt: "desc" },
    include: { goal: { select: { title: true } } },
  });

  return NextResponse.json(milestones);
}

// POST /api/member/milestones — log a new PR or custom milestone
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { type, title, description, targetValue, unit, goalId } = body;

  if (!type || !title) return NextResponse.json({ error: "type and title required" }, { status: 400 });

  // For lift PRs — check if it actually beats previous best
  if (type === "LIFT_PR" && targetValue) {
    const prev = await prisma.milestone.findFirst({
      where: { memberId: member.id, type: "LIFT_PR", title },
      orderBy: { targetValue: "desc" },
    });
    if (prev?.targetValue && targetValue <= prev.targetValue) {
      return NextResponse.json(
        { error: `Current PR is ${prev.targetValue}${unit ?? ""}. Enter a higher value.` },
        { status: 400 }
      );
    }
  }

  const milestone = await prisma.milestone.create({
    data: {
      memberId: member.id,
      goalId: goalId ?? null,
      type,
      title,
      description,
      targetValue,
      unit,
      achievedAt: new Date(),
    },
  });

  // Push congrats to the member
  await sendPushToUser(session.user.id, {
    title: "🏆 New Milestone!",
    body: title,
    url: "/dashboard/progress",
    tag: `milestone-${milestone.id}`,
  });

  return NextResponse.json(milestone);
}

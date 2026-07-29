import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/member/goals
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const goals = await prisma.memberGoal.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "asc" },
    include: { milestones: { where: { achievedAt: { not: null } }, orderBy: { achievedAt: "desc" }, take: 1 } },
  });

  return NextResponse.json(goals);
}

// POST /api/member/goals — save selected goal suggestions (bulk upsert)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { goals } = body as {
    goals: Array<{
      suggestionId: string;
      title: string;
      description?: string;
      targetValue?: number;
      unit?: string;
      category: string;
      sport?: string;
      targetDate?: string;
    }>;
  };

  if (!Array.isArray(goals)) return NextResponse.json({ error: "goals array required" }, { status: 400 });

  // Store category + sport in description field as a structured prefix
  const created = await Promise.all(
    goals.map((g) =>
      prisma.memberGoal.create({
        data: {
          memberId: member.id,
          title: g.title,
          description: [
            g.description ?? "",
            `[category:${g.category}]`,
            g.sport ? `[sport:${g.sport}]` : "",
            g.unit ? `[unit:${g.unit}]` : "",
            g.targetValue != null ? `[target:${g.targetValue}]` : "",
          ]
            .filter(Boolean)
            .join(" "),
          targetDate: g.targetDate ? new Date(g.targetDate) : null,
        },
      })
    )
  );

  return NextResponse.json(created);
}

// DELETE /api/member/goals — remove a goal
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { goalId } = await req.json();
  const goal = await prisma.memberGoal.findUnique({ where: { id: goalId } });
  if (!goal || goal.memberId !== member.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.memberGoal.delete({ where: { id: goalId } });
  return NextResponse.json({ ok: true });
}

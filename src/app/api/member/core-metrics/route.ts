import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/member/core-metrics?limit=10
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  const metrics = await prisma.coreMetrics.findMany({
    where: { memberId: member.id },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });

  return NextResponse.json(metrics);
}

// POST /api/member/core-metrics
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    assessmentType = "ONGOING",
    checkInId,
    age, heightIn, weightLbs, bodyFatPct,
    squatLbs, benchLbs, deadliftLbs,
    mileSec, fourHundredSec,
    wodTimeSec, wodPullUps,
    notes,
  } = body;

  const entry = await prisma.coreMetrics.create({
    data: {
      memberId: member.id,
      checkInId: checkInId ?? null,
      assessmentType,
      age: age ?? null,
      heightIn: heightIn ?? null,
      weightLbs: weightLbs ?? null,
      bodyFatPct: bodyFatPct ?? null,
      squatLbs: squatLbs ?? null,
      benchLbs: benchLbs ?? null,
      deadliftLbs: deadliftLbs ?? null,
      mileSec: mileSec ?? null,
      fourHundredSec: fourHundredSec ?? null,
      wodTimeSec: wodTimeSec ?? null,
      wodPullUps: wodPullUps ?? null,
      notes: notes ?? null,
    },
  });

  // Auto-detect lift PRs as milestones
  const liftChecks: Array<{ field: "squatLbs" | "benchLbs" | "deadliftLbs"; label: string }> = [
    { field: "squatLbs",   label: "Squat 1RM" },
    { field: "benchLbs",   label: "Bench 1RM" },
    { field: "deadliftLbs", label: "Deadlift 1RM" },
  ];
  for (const { field, label } of liftChecks) {
    const val = entry[field];
    if (!val) continue;
    const prev = await prisma.coreMetrics.findFirst({
      where: { memberId: member.id, id: { not: entry.id }, [field]: { not: null } },
      orderBy: { [field]: "desc" },
    });
    const prevVal = prev?.[field] as number | null;
    if (!prevVal || val > prevVal) {
      await prisma.milestone.create({
        data: {
          memberId: member.id,
          type: "LIFT_PR",
          title: `New ${label} PR — ${val} lbs`,
          description: prevVal ? `Previous best: ${prevVal} lbs (+${(val - prevVal).toFixed(1)} lbs)` : "First recorded lift.",
          targetValue: val,
          unit: "lbs",
          achievedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json(entry);
}

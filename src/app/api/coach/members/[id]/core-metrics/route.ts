import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/coach/members/[id]/core-metrics
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: memberId } = await params;
  const metrics = await prisma.coreMetrics.findMany({
    where: { memberId },
    orderBy: { recordedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(metrics);
}

// POST /api/coach/members/[id]/core-metrics — coach records an assessment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findUnique({ where: { userId: session.user.id } });
  const { id: memberId } = await params;

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
      memberId,
      checkInId: checkInId ?? null,
      assessmentType,
      recordedBy: staff?.id ?? null,
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

  return NextResponse.json(entry);
}

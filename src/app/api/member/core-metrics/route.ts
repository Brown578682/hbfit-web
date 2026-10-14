import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** Calculate age in whole years from a Date */
function calcAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// GET /api/member/core-metrics?limit=10
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, dateOfBirth: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");

  const metrics = await prisma.coreMetrics.findMany({
    where: { memberId: member.id },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });

  // Compute current age from DOB so the client can pre-fill without a manual entry
  const ageFromDob = member.dateOfBirth ? calcAge(member.dateOfBirth) : null;

  // Pull the most recent recorded height so we don't ask adults to re-enter it
  const lastWithHeight = metrics.find((m) => m.heightIn != null);
  const heightFromRecord = lastWithHeight?.heightIn ?? null;

  return NextResponse.json({ metrics, ageFromDob, heightFromRecord });
}

// POST /api/member/core-metrics
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true, dateOfBirth: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    assessmentType = "ONGOING",
    checkInId,
    heightIn, weightLbs, bodyFatPct,
    squatLbs, benchLbs, deadliftLbs,
    mileSec, fourHundredSec,
    wodTimeSec, wodPullUps,
    notes,
  } = body;

  // Always derive age from DOB — never trust client-supplied value
  const age = member.dateOfBirth ? calcAge(member.dateOfBirth) : (body.age ?? null);

  const entry = await prisma.coreMetrics.create({
    data: {
      memberId: member.id,
      checkInId: checkInId ?? null,
      assessmentType,
      age:          age ?? null,
      heightIn:     heightIn ?? null,
      weightLbs:    weightLbs ?? null,
      bodyFatPct:   bodyFatPct ?? null,
      squatLbs:     squatLbs ?? null,
      benchLbs:     benchLbs ?? null,
      deadliftLbs:  deadliftLbs ?? null,
      mileSec:      mileSec ?? null,
      fourHundredSec: fourHundredSec ?? null,
      wodTimeSec:   wodTimeSec ?? null,
      wodPullUps:   wodPullUps ?? null,
      notes:        notes ?? null,
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

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPushToCoaches } from "@/lib/push";

// GET /api/member/checkins — fetch this member's journey check-ins
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checkIns = await prisma.journeyCheckIn.findMany({
    where: { memberId: member.id },
    orderBy: { scheduledDate: "asc" },
  });

  return NextResponse.json(checkIns);
}

// POST /api/member/checkins — member submits their portion of a check-in
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { checkInId, weight, bodyFat, muscleMass, bigWins, areasToImprove, effortRating, motivationNote } = body;

  const checkIn = await prisma.journeyCheckIn.findUnique({ where: { id: checkInId } });
  if (!checkIn || checkIn.memberId !== member.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.journeyCheckIn.update({
    where: { id: checkInId },
    data: {
      weight,
      bodyFat,
      muscleMass,
      bigWins,
      areasToImprove,
      effortRating,
      motivationNote,
      memberCompletedAt: new Date(),
    },
  });

  // Also save a ProgressEntry snapshot
  if (weight || bodyFat || muscleMass) {
    await prisma.progressEntry.create({
      data: {
        memberId: member.id,
        weight: weight ?? undefined,
        bodyFat: bodyFat ?? undefined,
        notes: `${checkIn.type} check-in`,
      },
    });
  }

  // Auto-detect milestones
  await checkMilestones(member.id);

  // Notify coaches
  const memberName = `${member.firstName} ${member.lastName}`;
  await sendPushToCoaches({
    title: "📋 Check-In Complete",
    body: `${memberName} completed their ${checkIn.type.replace("DAY", "Day ")} check-in. Add your notes.`,
    url: `/coach/members/${member.id}`,
    tag: `checkin-${checkInId}`,
  });

  return NextResponse.json(updated);
}

// Auto-milestone detection after a new metric submission
async function checkMilestones(memberId: string) {
  const onboarding = await prisma.memberOnboarding.findUnique({ where: { memberId } });
  if (!onboarding?.goalStatement) return;

  const entries = await prisma.progressEntry.findMany({
    where: { memberId },
    orderBy: { recordedAt: "asc" },
  });
  if (entries.length < 2) return;

  const first = entries[0];
  const latest = entries[entries.length - 1];

  // Weight loss milestones: 25%, 50%, 75%, 100%
  if (first.weight && latest.weight && latest.weight < first.weight) {
    const goals = await prisma.memberGoal.findMany({ where: { memberId } });
    for (const goal of goals) {
      if (!goal.title.toLowerCase().includes("weight")) continue;
      const existing = await prisma.milestone.findMany({ where: { memberId, goalId: goal.id } });
      const lost = first.weight - latest.weight;
      // Try to parse target from title e.g. "Lose 20 lbs"
      const match = goal.title.match(/(\d+)/);
      if (!match) continue;
      const target = parseFloat(match[1]);
      const pct = (lost / target) * 100;
      const thresholds = [25, 50, 75, 100];
      for (const t of thresholds) {
        if (pct >= t && !existing.find((m) => m.title.includes(`${t}%`))) {
          await prisma.milestone.create({
            data: {
              memberId,
              goalId: goal.id,
              type: "WEIGHT_LOSS_PCT",
              title: `${t}% toward weight loss goal`,
              description: `Lost ${lost.toFixed(1)} lbs of ${target} lb goal`,
              targetValue: t,
              unit: "%",
              achievedAt: new Date(),
            },
          });
        }
      }
    }
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// GET /api/member/onboarding — fetch this member's onboarding record
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: { onboarding: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(member.onboarding ?? null);
}

// PUT /api/member/onboarding — save onboarding progress (upsert per-step)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    currentStep,
    complete,
    // Step 2 — intake
    reasonsForJoining, daysPerWeek, preferredDays, preferredTime,
    priorTraining, priorTrainingNotes, injuries,
    // Step 3 — goals
    whatNotWorking, vision90Days, whyImportant, goalStatement,
    // Step 5 — nutrition
    proteinGoalG, waterGoalOz,
  } = body;

  const record = await prisma.memberOnboarding.upsert({
    where: { memberId: member.id },
    create: {
      memberId: member.id,
      currentStep: currentStep ?? 1,
      completedAt: complete ? new Date() : null,
      reasonsForJoining, daysPerWeek, preferredDays: preferredDays ? JSON.stringify(preferredDays) : undefined,
      preferredTime, priorTraining, priorTrainingNotes, injuries,
      whatNotWorking, vision90Days, whyImportant, goalStatement,
      proteinGoalG, waterGoalOz,
    },
    update: {
      currentStep: currentStep ?? undefined,
      completedAt: complete ? new Date() : undefined,
      reasonsForJoining, daysPerWeek, preferredDays: preferredDays ? JSON.stringify(preferredDays) : undefined,
      preferredTime, priorTraining, priorTrainingNotes, injuries,
      whatNotWorking, vision90Days, whyImportant, goalStatement,
      proteinGoalG, waterGoalOz,
    },
  });

  // When onboarding completes, schedule journey check-ins and send welcome push
  if (complete) {
    await scheduleJourneyCheckIns(member.id);
    await sendPushToUser(session.user.id, {
      title: "🎖️ Welcome to Honor Bound FIT!",
      body: "Your mission has begun. We'll check in with you at Day 30, 60, and 90.",
      url: "/dashboard",
      tag: "onboarding-complete",
    });
  }

  return NextResponse.json(record);
}

async function scheduleJourneyCheckIns(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return;

  const start = member.joinedAt ?? new Date();
  const types = [
    { type: "DAY1" as const, days: 0 },
    { type: "DAY30" as const, days: 30 },
    { type: "DAY60" as const, days: 60 },
    { type: "DAY90" as const, days: 90 },
  ];

  for (const { type, days } of types) {
    const existing = await prisma.journeyCheckIn.findFirst({ where: { memberId, type } });
    if (existing) continue;
    const scheduledDate = new Date(start);
    scheduledDate.setDate(scheduledDate.getDate() + days);
    await prisma.journeyCheckIn.create({ data: { memberId, type, scheduledDate } });
  }
}

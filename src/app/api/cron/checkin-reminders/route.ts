import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// GET /api/cron/checkin-reminders
// Called nightly by a cron job (secured via CRON_SECRET header)
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find check-ins scheduled for tomorrow that haven't been completed by the member
  const upcoming = await prisma.journeyCheckIn.findMany({
    where: {
      scheduledDate: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 86400000) },
      memberCompletedAt: null,
    },
    include: { member: { include: { user: true } } },
  });

  // Find overdue check-ins (past scheduled date, not yet member-completed)
  const overdue = await prisma.journeyCheckIn.findMany({
    where: {
      scheduledDate: { lt: today },
      memberCompletedAt: null,
    },
    include: { member: { include: { user: true } } },
  });

  const sent: string[] = [];

  for (const ci of upcoming) {
    const label = ci.type.replace("DAY", "Day ");
    await sendPushToUser(ci.member.userId, {
      title: `📋 Your ${label} Check-In is Tomorrow`,
      body: "Log your progress, wins, and notes. Takes 2 minutes.",
      url: `/dashboard/checkin/${ci.id}`,
      tag: `checkin-reminder-${ci.id}`,
    });
    sent.push(`${ci.member.firstName} ${ci.member.lastName} — ${label} (tomorrow)`);
  }

  for (const ci of overdue) {
    const label = ci.type.replace("DAY", "Day ");
    const daysOverdue = Math.floor((today.getTime() - new Date(ci.scheduledDate).getTime()) / 86400000);
    if (daysOverdue > 7) continue; // Don't nag after a week
    await sendPushToUser(ci.member.userId, {
      title: `⏰ ${label} Check-In Waiting`,
      body: `Your check-in was ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} ago. Don't skip the debrief.`,
      url: `/dashboard/checkin/${ci.id}`,
      tag: `checkin-overdue-${ci.id}`,
    });
    sent.push(`${ci.member.firstName} ${ci.member.lastName} — ${label} (${daysOverdue}d overdue)`);
  }

  return NextResponse.json({ sent, total: sent.length });
}

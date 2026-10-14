import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendPushToUser, sendPushToCoaches } from "@/lib/push";

// GET  /api/messages  — member's thread list
// POST /api/messages  — start a new thread
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { user: { id: session.user.id } },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const threads = await prisma.messageThread.findMany({
    where: { memberId: member.id },
    orderBy: { updatedAt: "desc" },
    include: {
      entries: { orderBy: { sentAt: "desc" }, take: 1 },
      coach: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({
    threads: threads.map(t => ({
      id:        t.id,
      subject:   t.subject,
      coachName: t.coach ? `${t.coach.firstName} ${t.coach.lastName}` : null,
      updatedAt: t.updatedAt.toISOString(),
      lastEntry: t.entries[0]
        ? { body: t.entries[0].body, senderType: t.entries[0].senderType, sentAt: t.entries[0].sentAt.toISOString() }
        : null,
      hasUnread: t.entries.some(e => e.senderType === "COACH" && !e.readAt),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { user: { id: session.user.id } },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { subject, body, coachId } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  // Validate coachId if provided
  let resolvedCoachId: string | null = null;
  let coachUserId: string | null = null;
  if (coachId) {
    const staffRecord = await prisma.staff.findUnique({
      where: { id: coachId },
      select: { id: true, userId: true },
    });
    if (staffRecord) {
      resolvedCoachId = staffRecord.id;
      coachUserId = staffRecord.userId;
    }
  }

  const thread = await prisma.messageThread.create({
    data: {
      memberId: member.id,
      coachId:  resolvedCoachId,
      subject:  subject.trim(),
      entries: {
        create: {
          senderType: "MEMBER",
          senderName: `${member.firstName} ${member.lastName}`,
          body:       body.trim(),
        },
      },
    },
  });

  const pushPayload = {
    title: `New message from ${member.firstName} ${member.lastName}`,
    body:  body.trim().slice(0, 100),
    url:   "/coach/messages",
    tag:   `thread-${thread.id}`,
  };

  // Push to the selected coach or all coaches
  if (coachUserId) {
    await sendPushToUser(coachUserId, pushPayload).catch(() => {});
  } else {
    await sendPushToCoaches(pushPayload).catch(() => {});
  }

  return NextResponse.json({ ok: true, threadId: thread.id }, { status: 201 });
}

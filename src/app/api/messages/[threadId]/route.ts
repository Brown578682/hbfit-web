import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendPushToUser, sendPushToCoaches } from "@/lib/push";

// GET  /api/messages/[threadId]  — full thread
// POST /api/messages/[threadId]  — member reply
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { user: { id: session.user.id } },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, memberId: member.id },
    include: { entries: { orderBy: { sentAt: "asc" } } },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark coach replies as read
  await prisma.messageEntry.updateMany({
    where: { threadId, senderType: "COACH", readAt: null },
    data:  { readAt: new Date() },
  });

  return NextResponse.json({
    id:      thread.id,
    subject: thread.subject,
    entries: thread.entries.map(e => ({
      id:         e.id,
      senderType: e.senderType,
      senderName: e.senderName,
      body:       e.body,
      sentAt:     e.sentAt.toISOString(),
      readAt:     e.readAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.member.findFirst({
    where: { user: { id: session.user.id } },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message body is required." }, { status: 400 });

  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, memberId: member.id },
    select: { id: true, coachId: true, coach: { select: { userId: true } } },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.messageEntry.create({
      data: {
        threadId,
        senderType: "MEMBER",
        senderName: `${member.firstName} ${member.lastName}`,
        body:       body.trim(),
      },
    }),
    prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
  ]);

  const pushPayload = {
    title: `Reply from ${member.firstName} ${member.lastName}`,
    body:  body.trim().slice(0, 100),
    url:   "/coach/messages",
    tag:   `thread-${threadId}`,
  };

  if (thread.coach?.userId) {
    await sendPushToUser(thread.coach.userId, pushPayload).catch(() => {});
  } else {
    await sendPushToCoaches(pushPayload).catch(() => {});
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

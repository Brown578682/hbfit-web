import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendPushToUser } from "@/lib/push";

// GET  /api/coach/messages/[threadId] — full thread
// POST /api/coach/messages/[threadId] — coach reply
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      member: { select: { firstName: true, lastName: true } },
      entries: { orderBy: { sentAt: "asc" } },
    },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark member entries as read
  await prisma.messageEntry.updateMany({
    where: { threadId, senderType: "MEMBER", readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    id:         thread.id,
    subject:    thread.subject,
    memberName: `${thread.member.firstName} ${thread.member.lastName}`,
    entries: thread.entries.map(e => ({
      id:         e.id,
      senderType: e.senderType,
      senderName: e.senderName,
      body:       e.body,
      sentAt:     e.sentAt.toISOString(),
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

  const { body, coachName } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { member: { select: { firstName: true, lastName: true, user: { select: { id: true } } } } },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.messageEntry.create({
      data: { threadId, senderType: "COACH", senderName: coachName?.trim() || "Coach", body: body.trim() },
    }),
    prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
  ]);

  // Push notification to member
  const membUserId = thread.member.user?.id;
  if (membUserId) {
    await sendPushToUser(membUserId, {
      title: `Reply from ${coachName || "Coach"}`,
      body: body.trim().slice(0, 100),
      url: "/dashboard/messages",
      tag: `thread-${threadId}`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

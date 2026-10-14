import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  — full thread with all entries
// POST — coach reply
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      member: { select: { firstName: true, lastName: true } },
      entries: { orderBy: { sentAt: "asc" } },
    },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark member entries as read by coach
  await prisma.messageEntry.updateMany({
    where: { threadId, senderType: "MEMBER", readAt: null },
    data:  { readAt: new Date() },
  });

  return NextResponse.json({
    id:         thread.id,
    subject:    thread.subject,
    memberName: `${thread.member.firstName} ${thread.member.lastName}`,
    entries: thread.entries.map((e) => ({
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

  const { body, coachName } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Reply body is required." }, { status: 400 });

  const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.messageEntry.create({
      data: {
        threadId,
        senderType: "COACH",
        senderName: coachName?.trim() || "Coach",
        body:       body.trim(),
      },
    }),
    prisma.messageThread.update({
      where: { id: threadId },
      data:  { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}

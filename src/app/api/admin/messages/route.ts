import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/admin/messages
// Returns all KioskMessages newest first with member name
// ---------------------------------------------------------------------------
export async function GET() {
  const messages = await prisma.kioskMessage.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      member: { select: { firstName: true, lastName: true } },
    },
  });

  const result = messages.map((msg) => ({
    id: msg.id,
    memberId: msg.memberId,
    memberName: `${msg.member.firstName} ${msg.member.lastName}`,
    message: msg.message,
    sentAt: msg.sentAt.toISOString(),
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
  }));

  const unreadCount = result.filter((m) => !m.readAt).length;

  return NextResponse.json({ messages: result, unreadCount });
}

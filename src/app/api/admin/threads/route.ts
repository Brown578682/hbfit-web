import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const threads = await prisma.messageThread.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      member: { select: { firstName: true, lastName: true } },
      entries: { orderBy: { sentAt: "desc" }, take: 1 },
    },
  });

  const result = threads.map((t) => ({
    id:         t.id,
    subject:    t.subject,
    memberName: `${t.member.firstName} ${t.member.lastName}`,
    memberId:   t.memberId,
    updatedAt:  t.updatedAt.toISOString(),
    lastEntry:  t.entries[0]
      ? {
          body:       t.entries[0].body,
          senderType: t.entries[0].senderType,
          sentAt:     t.entries[0].sentAt.toISOString(),
        }
      : null,
    hasUnread: t.entries.some((e) => e.senderType === "MEMBER" && !e.readAt),
  }));

  return NextResponse.json({
    threads:     result,
    unreadCount: result.filter((t) => t.hasUnread).length,
  });
}

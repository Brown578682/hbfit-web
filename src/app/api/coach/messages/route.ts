import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/coach/messages — threads assigned to this coach (or all if admin)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  // Find this user's staff record
  const staffRecord = isAdmin ? null : await prisma.staff.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const threads = await prisma.messageThread.findMany({
    where: isAdmin
      ? {}  // admin sees all
      : { OR: [{ coachId: staffRecord?.id ?? "" }, { coachId: null }] },
    orderBy: { updatedAt: "desc" },
    include: {
      member: { select: { firstName: true, lastName: true } },
      entries: { orderBy: { sentAt: "desc" }, take: 1 },
    },
  });

  const result = threads.map(t => ({
    id:         t.id,
    subject:    t.subject,
    memberName: `${t.member.firstName} ${t.member.lastName}`,
    updatedAt:  t.updatedAt.toISOString(),
    hasUnread:  t.entries.some(e => e.senderType === "MEMBER" && !e.readAt),
    lastEntry:  t.entries[0]
      ? { body: t.entries[0].body, senderType: t.entries[0].senderType, sentAt: t.entries[0].sentAt.toISOString() }
      : null,
  }));

  return NextResponse.json({
    threads: result,
    unreadCount: result.filter(t => t.hasUnread).length,
  });
}

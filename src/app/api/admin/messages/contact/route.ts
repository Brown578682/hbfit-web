import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const messages = await prisma.contactMessage.findMany({
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id:        m.id,
      name:      m.name,
      email:     m.email,
      subject:   m.subject,
      message:   m.message,
      sentAt:    m.sentAt.toISOString(),
      readAt:    m.readAt?.toISOString() ?? null,
      repliedAt: m.repliedAt?.toISOString() ?? null,
    })),
    unreadCount: messages.filter((m) => !m.readAt).length,
  });
}

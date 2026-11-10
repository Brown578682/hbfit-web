import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { ids } = await req.json() as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
  }
  // Delete members and their associated users
  const members = await prisma.member.findMany({
    where: { id: { in: ids } },
    select: { userId: true },
  });
  const userIds = members.map(m => m.userId).filter(Boolean) as string[];
  await prisma.member.deleteMany({ where: { id: { in: ids } } });
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
  return NextResponse.json({ ok: true, deleted: ids.length });
}

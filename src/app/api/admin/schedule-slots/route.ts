import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/admin/schedule-slots — all slots with classType + instructor
export async function GET() {
  const slots = await prisma.scheduleSlot.findMany({
    orderBy: [{ startHour: 'asc' }, { startMinute: 'asc' }],
    include: {
      classType:  { select: { id: true, name: true, color: true } },
      instructor: { select: { id: true, firstName: true, lastName: true } },
    },
  })
  return NextResponse.json(slots)
}

// GET /api/admin/schedule-slots/[id]/bookings
// Returns upcoming confirmed/waitlisted booking count for a slot — used by coach UI before deactivating
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const slot = await prisma.scheduleSlot.findUnique({ where: { id } })
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = new Date()
  const count = await prisma.classBooking.count({
    where: {
      status: { in: ['CONFIRMED', 'WAITLISTED'] },
      session: {
        scheduleSlotId: slot.slotKey,
        startTime: { gt: now },
        isCanceled: false,
      },
    },
  })

  return NextResponse.json({ count })
}

// GET /api/classes/upcoming — member's upcoming booked classes
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotById } from '@/lib/schedule-data'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.member.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!member) return NextResponse.json([])

  const now = new Date()
  const bookings = await prisma.classBooking.findMany({
    where: {
      memberId: member.id,
      status: { in: ['CONFIRMED', 'WAITLISTED'] },
      session: { startTime: { gte: now }, isCanceled: false },
    },
    include: {
      session: {
        include: { classType: true },
      },
    },
    orderBy: { session: { startTime: 'asc' } },
    take: 10,
  })

  return NextResponse.json(
    bookings.map(b => ({
      bookingId:       b.id,
      status:          b.status,
      waitlistPosition: b.waitlistPosition,
      slotId:          b.session.scheduleSlotId,
      sessionId:       b.session.id,
      startTime:       b.session.startTime,
      endTime:         b.session.endTime,
      className:       b.session.classType.name,
      capacity:        b.session.capacity,
      slot:            b.session.scheduleSlotId ? getSlotById(b.session.scheduleSlotId) ?? null : null,
    }))
  )
}

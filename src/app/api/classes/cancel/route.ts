// POST /api/classes/cancel  { bookingId }
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookingId } = await req.json()
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const booking = await prisma.classBooking.findUnique({
    where: { id: bookingId },
    include: { session: true },
  })

  // Must exist, belong to this member, and not already cancelled
  if (!booking || booking.memberId !== member.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.status === 'CANCELED') {
    return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
  }

  const wasConfirmed = booking.status === 'CONFIRMED'

  await prisma.classBooking.update({
    where: { id: bookingId },
    data: { status: 'CANCELED', waitlistPosition: null },
  })

  // Auto-promote first waitlisted member if a confirmed spot opened up
  if (wasConfirmed) {
    const nextUp = await prisma.classBooking.findFirst({
      where: { sessionId: booking.sessionId, status: 'WAITLISTED' },
      orderBy: { waitlistPosition: 'asc' },
    })
    if (nextUp) {
      await prisma.classBooking.update({
        where: { id: nextUp.id },
        data: { status: 'CONFIRMED', waitlistPosition: null },
      })
      // Renumber remaining waitlist
      const remaining = await prisma.classBooking.findMany({
        where: { sessionId: booking.sessionId, status: 'WAITLISTED' },
        orderBy: { waitlistPosition: 'asc' },
      })
      for (let i = 0; i < remaining.length; i++) {
        await prisma.classBooking.update({
          where: { id: remaining[i].id },
          data: { waitlistPosition: i + 1 },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}

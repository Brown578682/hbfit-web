// GET /api/classes/availability?slotId=s1&date=2026-07-29
// Returns booking status for a given slot + date for the current member

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotById } from '@/lib/schedule-data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slotId = searchParams.get('slotId')
  const date   = searchParams.get('date')   // YYYY-MM-DD

  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = getSlotById(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown slot' }, { status: 404 })

  const session = await getSession()

  // Build start time from date + slot
  const startTime = new Date(`${date}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)

  // Find or describe the session
  const classSession = await prisma.classSession.findFirst({
    where: { scheduleSlotId: slotId, startTime },
    include: {
      bookings: {
        where: { status: { not: 'CANCELED' } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const confirmed = classSession?.bookings.filter(b => b.status === 'CONFIRMED').length ?? 0
  const waitlisted = classSession?.bookings.filter(b => b.status === 'WAITLISTED').length ?? 0
  const spotsLeft = Math.max(0, slot.capacity - confirmed)
  const isFull = spotsLeft === 0

  // Member's own booking
  let myBooking: { status: string; waitlistPosition: number | null } | null = null
  if (session && classSession) {
    const member = await prisma.member.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (member) {
      const b = classSession.bookings.find(b => b.memberId === member.id)
      if (b) myBooking = { status: b.status, waitlistPosition: b.waitlistPosition }
    }
  }

  return NextResponse.json({
    slotId,
    date,
    capacity: slot.capacity,
    confirmed,
    waitlisted,
    spotsLeft,
    isFull,
    myBooking,
    sessionId: classSession?.id ?? null,
  })
}

function pad(n: number) { return n.toString().padStart(2, '0') }

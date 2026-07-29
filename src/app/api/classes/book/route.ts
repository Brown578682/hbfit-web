// POST /api/classes/book  { slotId, date }
// DELETE /api/classes/book  { slotId, date }  (cancel)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotById } from '@/lib/schedule-data'

function pad(n: number) { return n.toString().padStart(2, '0') }

async function getOrCreateSession(slotId: string, date: string) {
  const slot = getSlotById(slotId)!
  const startTime = new Date(`${date}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)
  const endTime   = new Date(startTime.getTime() + slot.durationMin * 60 * 1000)

  // Find or upsert the ClassType
  const classType = await prisma.classType.upsert({
    where: { name: slot.typeName } as any,
    update: {},
    create: { name: slot.typeName, duration: slot.durationMin, isActive: true },
  })

  // Find or create the ClassSession
  const existing = await prisma.classSession.findFirst({
    where: { scheduleSlotId: slotId, startTime },
  })
  if (existing) return existing

  return prisma.classSession.create({
    data: {
      classTypeId:    classType.id,
      scheduleSlotId: slotId,
      startTime,
      endTime,
      capacity:       slot.capacity,
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slotId, date } = await req.json()
  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = getSlotById(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown slot' }, { status: 404 })

  // Booking window: up to 30 min after class starts
  const startTime = new Date(`${date}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)
  const cutoff    = new Date(startTime.getTime() + 30 * 60 * 1000)
  if (new Date() > cutoff) return NextResponse.json({ error: 'Booking window has closed for this class' }, { status: 400 })

  const member = await prisma.member.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!member) return NextResponse.json({ error: 'Member record not found' }, { status: 404 })

  const classSession = await getOrCreateSession(slotId, date)

  // Check for existing booking
  const existing = await prisma.classBooking.findUnique({
    where: { sessionId_memberId: { sessionId: classSession.id, memberId: member.id } },
  })
  if (existing && existing.status !== 'CANCELED') {
    return NextResponse.json({ error: 'Already booked', booking: existing }, { status: 409 })
  }

  // Count confirmed bookings
  const confirmedCount = await prisma.classBooking.count({
    where: { sessionId: classSession.id, status: 'CONFIRMED' },
  })
  const isFull = confirmedCount >= slot.capacity

  // Count waitlist
  const waitlistCount = await prisma.classBooking.count({
    where: { sessionId: classSession.id, status: 'WAITLISTED' },
  })

  const status: 'CONFIRMED' | 'WAITLISTED' = isFull ? 'WAITLISTED' : 'CONFIRMED'
  const waitlistPosition = isFull ? waitlistCount + 1 : null

  const booking = existing
    ? await prisma.classBooking.update({
        where: { id: existing.id },
        data: { status, waitlistPosition, createdAt: new Date() },
      })
    : await prisma.classBooking.create({
        data: { sessionId: classSession.id, memberId: member.id, status, waitlistPosition },
      })

  return NextResponse.json({ booking, spotsLeft: Math.max(0, slot.capacity - confirmedCount - (isFull ? 0 : 1)) })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slotId, date } = await req.json()
  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = getSlotById(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown slot' }, { status: 404 })

  const member = await prisma.member.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!member) return NextResponse.json({ error: 'Member record not found' }, { status: 404 })

  const startTime = new Date(`${date}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)
  const classSession = await prisma.classSession.findFirst({ where: { scheduleSlotId: slotId, startTime } })
  if (!classSession) return NextResponse.json({ error: 'No session found' }, { status: 404 })

  const booking = await prisma.classBooking.findUnique({
    where: { sessionId_memberId: { sessionId: classSession.id, memberId: member.id } },
  })
  if (!booking || booking.status === 'CANCELED') {
    return NextResponse.json({ error: 'No active booking found' }, { status: 404 })
  }

  const wasConfirmed = booking.status === 'CONFIRMED'

  await prisma.classBooking.update({
    where: { id: booking.id },
    data: { status: 'CANCELED', waitlistPosition: null },
  })

  // Auto-promote first waitlisted member if confirmed spot opened up
  if (wasConfirmed) {
    const nextUp = await prisma.classBooking.findFirst({
      where: { sessionId: classSession.id, status: 'WAITLISTED' },
      orderBy: { waitlistPosition: 'asc' },
    })
    if (nextUp) {
      await prisma.classBooking.update({
        where: { id: nextUp.id },
        data: { status: 'CONFIRMED', waitlistPosition: null },
      })
      // Renumber remaining waitlist
      const remaining = await prisma.classBooking.findMany({
        where: { sessionId: classSession.id, status: 'WAITLISTED' },
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

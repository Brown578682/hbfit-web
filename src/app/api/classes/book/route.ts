// POST /api/classes/book  { slotId, date }
// DELETE /api/classes/book  { slotId, date }  (cancel)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotByKey } from '@/lib/schedule-db'

export const runtime = 'nodejs'

function pad(n: number) { return n.toString().padStart(2, '0') }

// All schedule times are Eastern Time. Build a UTC Date by treating the
// local wall-clock time as ET (EDT = UTC-4 in summer, EST = UTC-5 in winter).
function toETDate(date: string, hour: number, minute: number): Date {
  // Construct an ISO string with ET offset and let JS parse to UTC
  // We detect DST by checking if the date falls in EDT window (second Sun Mar → first Sun Nov)
  const probe = new Date(`${date}T12:00:00Z`)
  const month = probe.getUTCMonth() + 1 // 1-12
  const day   = probe.getUTCDate()
  const dow   = probe.getUTCDay() // 0=Sun
  // Rough DST check: EDT runs ~Mar 8–Nov 1
  const inEDT = month > 3 || (month === 3 && day >= 8) ?
    month < 11 || (month === 11 && day < 1 && dow !== 0) : false
  const offset = inEDT ? '-04:00' : '-05:00'
  return new Date(`${date}T${pad(hour)}:${pad(minute)}:00${offset}`)
}

async function getOrCreateSession(slotKey: string, date: string, slot: NonNullable<Awaited<ReturnType<typeof getSlotByKey>>>) {
  const startTime = toETDate(date, slot.startHour, slot.startMinute)
  const endTime   = new Date(startTime.getTime() + slot.durationMin * 60 * 1000)

  const classType = await prisma.classType.upsert({
    where:  { name: slot.typeName } as any,
    update: {},
    create: { name: slot.typeName, duration: slot.durationMin, isActive: true },
  })

  const existing = await prisma.classSession.findFirst({
    where: { scheduleSlotId: slotKey, startTime },
  })
  if (existing) return { session: existing, classType }

  const session = await prisma.classSession.create({
    data: { classTypeId: classType.id, scheduleSlotId: slotKey, startTime, endTime, capacity: slot.capacity, instructorId: slot.instructorId ?? undefined },
  })
  return { session, classType }
}

export async function POST(req: NextRequest) {
  const authSession = await getSession()
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slotId, date } = await req.json()
  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = await getSlotByKey(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown or inactive slot' }, { status: 404 })

  // Booking window: up to 30 min after class starts (times are Eastern — use toETDate to avoid UTC misread)
  const startTime = toETDate(date, slot.startHour, slot.startMinute)
  const cutoff    = new Date(startTime.getTime() + 30 * 60 * 1000)
  if (new Date() > cutoff) return NextResponse.json({ error: 'Booking window has closed for this class' }, { status: 400 })

  const member = await prisma.member.findUnique({
    where: { userId: authSession.user.id },
    select: { id: true },
  })
  if (!member) return NextResponse.json({ error: 'Member record not found' }, { status: 404 })

  const { session: classSession } = await getOrCreateSession(slotId, date, slot)

  // Check for existing booking
  const existingBooking = await prisma.classBooking.findUnique({
    where: { sessionId_memberId: { sessionId: classSession.id, memberId: member.id } },
  })
  if (existingBooking && existingBooking.status !== 'CANCELED') {
    return NextResponse.json({ error: 'Already booked', booking: existingBooking }, { status: 409 })
  }

  const confirmedCount = await prisma.classBooking.count({
    where: { sessionId: classSession.id, status: 'CONFIRMED' },
  })
  const isFull = confirmedCount >= slot.capacity

  const waitlistCount = await prisma.classBooking.count({
    where: { sessionId: classSession.id, status: 'WAITLISTED' },
  })

  const status: 'CONFIRMED' | 'WAITLISTED' = isFull ? 'WAITLISTED' : 'CONFIRMED'
  const waitlistPosition = isFull ? waitlistCount + 1 : null

  const booking = existingBooking
    ? await prisma.classBooking.update({
        where: { id: existingBooking.id },
        data: { status, waitlistPosition, createdAt: new Date() },
      })
    : await prisma.classBooking.create({
        data: { sessionId: classSession.id, memberId: member.id, status, waitlistPosition },
      })

  return NextResponse.json({ booking, spotsLeft: Math.max(0, slot.capacity - confirmedCount - (isFull ? 0 : 1)) })
}

export async function DELETE(req: NextRequest) {
  const authSession = await getSession()
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slotId, date } = await req.json()
  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = await getSlotByKey(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown slot' }, { status: 404 })

  const member = await prisma.member.findUnique({ where: { userId: authSession.user.id }, select: { id: true } })
  if (!member) return NextResponse.json({ error: 'Member record not found' }, { status: 404 })

  const startTime  = new Date(`${date}T${pad(slot.startHour)}:${pad(slot.startMinute)}:00`)
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

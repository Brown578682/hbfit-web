// GET /api/cron/recurring-bookings
// Runs daily (via Vercel Cron or external trigger).
// For every active RecurringBooking, finds all slots that fall on a day
// 7 days from now and creates a ClassBooking if none exists.
// Also fires push notifications to confirm.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/push'
import { SCHEDULE_DATA } from '@/lib/schedule-data'

function pad(n: number) { return n.toString().padStart(2, '0') }

function toETDate(date: string, hour: number, minute: number): Date {
  const probe = new Date(`${date}T12:00:00Z`)
  const month = probe.getUTCMonth() + 1
  const day   = probe.getUTCDate()
  const inEDT = month > 3 || (month === 3 && day >= 8)
    ? month < 11 || (month === 11 && day < 1 && probe.getUTCDay() !== 0)
    : false
  const offset = inEDT ? '-04:00' : '-05:00'
  return new Date(`${date}T${pad(hour)}:${pad(minute)}:00${offset}`)
}

function formatTime(h: number, m: number) {
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${pad(m)} ${suffix}`
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Target date = 7 days from today in Eastern Time
  const now = new Date()
  const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const target = new Date(nowET)
  target.setDate(target.getDate() + 7)
  const targetDow = target.getDay() // 0=Sun, 1=Mon…6=Sat
  const dateStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`

  // All active recurring bookings
  const recurring = await prisma.recurringBooking.findMany({
    where: { active: true },
    include: { member: { include: { user: true } } },
  })

  const booked: string[] = []
  const skipped: string[] = []

  for (const rb of recurring) {
    const slot = SCHEDULE_DATA.find(s => s.id === rb.slotId)
    if (!slot) continue
    // Only act on slots that run on the target day of week
    if (!slot.days.includes(targetDow)) continue

    const startTime = toETDate(dateStr, slot.startHour, slot.startMinute)
    const endTime = new Date(startTime.getTime() + slot.durationMin * 60 * 1000)

    // Find or create ClassType
    const classType = await prisma.classType.upsert({
      where: { name: slot.typeName },
      update: {},
      create: { name: slot.typeName, duration: slot.durationMin, isActive: true },
    })

    // Find or create ClassSession
    let classSession = await prisma.classSession.findFirst({
      where: { scheduleSlotId: slot.id, startTime },
    })
    if (!classSession) {
      classSession = await prisma.classSession.create({
        data: {
          classTypeId: classType.id,
          scheduleSlotId: slot.id,
          startTime,
          endTime,
          capacity: slot.capacity,
        },
      })
    }

    // Skip if already booked (any non-canceled status)
    const existing = await prisma.classBooking.findUnique({
      where: { sessionId_memberId: { sessionId: classSession.id, memberId: rb.memberId } },
    })
    if (existing && existing.status !== 'CANCELED') {
      skipped.push(`${rb.member.firstName} ${rb.member.lastName} — ${slot.id} ${dateStr}`)
      continue
    }

    // Count confirmed bookings to determine status
    const confirmedCount = await prisma.classBooking.count({
      where: { sessionId: classSession.id, status: 'CONFIRMED' },
    })
    const isFull = confirmedCount >= slot.capacity
    const waitlistCount = isFull
      ? await prisma.classBooking.count({ where: { sessionId: classSession.id, status: 'WAITLISTED' } })
      : 0

    const status = isFull ? 'WAITLISTED' : 'CONFIRMED'
    const waitlistPosition = isFull ? waitlistCount + 1 : null

    if (existing) {
      await prisma.classBooking.update({
        where: { id: existing.id },
        data: { status, waitlistPosition, createdAt: new Date() },
      })
    } else {
      await prisma.classBooking.create({
        data: { sessionId: classSession.id, memberId: rb.memberId, status, waitlistPosition },
      })
    }

    // Push confirmation
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const timeStr = formatTime(slot.startHour, slot.startMinute)
    const msg = status === 'CONFIRMED'
      ? `✅ Auto-booked: ${slot.typeName} on ${dayNames[targetDow]} at ${timeStr}`
      : `⏳ Waitlisted for ${slot.typeName} on ${dayNames[targetDow]} at ${timeStr} (#${waitlistPosition})`

    if (!rb.member.userId) {
      booked.push(`${rb.member.firstName} ${rb.member.lastName} — ${slot.id} ${dateStr} (${status})`)
      continue // no portal user — skip push
    }
    await sendPushToUser(rb.member.userId, {
      title: 'HBFIT — Recurring Class Booked',
      body: msg,
      url: '/dashboard',
    }).catch(() => {})

    booked.push(`${rb.member.firstName} ${rb.member.lastName} — ${slot.id} ${dateStr} (${status})`)
  }

  return NextResponse.json({ date: dateStr, booked, skipped })
}

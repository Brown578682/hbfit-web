import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotByKey } from '@/lib/schedule-db'

export const runtime = 'nodejs'

// Mirror the same ET→UTC conversion used in the book route so lookups match stored sessions
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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slotId = searchParams.get('slotId')
  const date   = searchParams.get('date')

  if (!slotId || !date) return NextResponse.json({ error: 'slotId and date required' }, { status: 400 })

  const slot = await getSlotByKey(slotId)
  if (!slot) return NextResponse.json({ error: 'Unknown or inactive slot' }, { status: 404 })

  const session = await getSession()

  const startTime = toETDate(date, slot.startHour, slot.startMinute)

  const classSession = await prisma.classSession.findFirst({
    where: { scheduleSlotId: slotId, startTime },
    include: {
      bookings: {
        where: { status: { not: 'CANCELED' } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const confirmed  = classSession?.bookings.filter(b => b.status === 'CONFIRMED').length ?? 0
  const waitlisted = classSession?.bookings.filter(b => b.status === 'WAITLISTED').length ?? 0
  const spotsLeft  = Math.max(0, slot.capacity - confirmed)
  const isFull     = spotsLeft === 0

  let myBooking: { status: string; waitlistPosition: number | null } | null = null
  if (session && classSession) {
    const member = await prisma.member.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (member) {
      const b = classSession.bookings.find(b => b.memberId === member.id)
      if (b) myBooking = { status: b.status, waitlistPosition: b.waitlistPosition }
    }
  }

  const isCanceled   = classSession?.isCanceled ?? false
  const cancelReason = classSession?.cancelReason ?? null

  return NextResponse.json({ slotId, date, capacity: slot.capacity, confirmed, waitlisted, spotsLeft, isFull, myBooking, sessionId: classSession?.id ?? null, isCanceled, cancelReason })
}

function pad(n: number) { return n.toString().padStart(2, '0') }


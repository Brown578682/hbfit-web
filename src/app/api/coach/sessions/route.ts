import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

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

// Generate all dates in [start, end) range as YYYY-MM-DD strings (in ET)
function etDateRange(start: Date, end: Date): string[] {
  const dates: string[] = []
  const cur = new Date(start.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  cur.setHours(0, 0, 0, 0)
  const endET = new Date(end.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  endET.setHours(23, 59, 59, 999)
  while (cur <= endET) {
    dates.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`)
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const todayStartUTC = new Date(); todayStartUTC.setUTCHours(0, 0, 0, 0)
  const start = new Date(searchParams.get('start') || todayStartUTC.toISOString())
  const end   = new Date(searchParams.get('end')   || new Date(Date.now() + 14 * 86400000).toISOString())
  const coachOnly = searchParams.get('mine') === 'true'

  const session = await getSession()
  const isDev = process.env.NODE_ENV === 'development'
  let filterStaffId: string | undefined
  const explicitStaffId = searchParams.get('staffId')
  if (explicitStaffId && (isDev || (session?.user as any)?.role === 'ADMIN')) {
    filterStaffId = explicitStaffId
  } else if (coachOnly && session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { staff: true } })
    filterStaffId = user?.staff?.id
  }

  // Load all active slots (optionally filtered by instructor)
  const slots = await prisma.scheduleSlot.findMany({
    where: {
      isActive: true,
      ...(filterStaffId ? { instructorId: filterStaffId } : {}),
    },
    include: {
      classType: true,
      instructor: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  // Load existing ClassSessions in range for booking counts & IDs
  const existingSessions = await prisma.classSession.findMany({
    where: {
      startTime: { gte: start, lte: end },
      isCanceled: false,
      scheduleSlotId: { not: null },
    },
    include: {
      _count: { select: { bookings: true } },
    },
  })

  // Index existing sessions by slotKey+startTime ISO string
  const sessionIndex = new Map<string, typeof existingSessions[0]>()
  for (const s of existingSessions) {
    if (s.scheduleSlotId) {
      sessionIndex.set(`${s.scheduleSlotId}|${s.startTime.toISOString()}`, s)
    }
  }

  // Generate synthetic events from slots × dates
  const dates = etDateRange(start, end)
  const events: object[] = []

  for (const dateStr of dates) {
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay() // 0=Sun
    for (const slot of slots) {
      const days = slot.days as number[]
      if (!days.includes(dow)) continue

      const startTime = toETDate(dateStr, slot.startHour, slot.startMinute)
      const endTime   = new Date(startTime.getTime() + slot.durationMin * 60 * 1000)

      // Skip if outside requested range
      if (startTime < start || startTime > end) continue

      const key = `${slot.slotKey}|${startTime.toISOString()}`
      const existing = sessionIndex.get(key)

      events.push({
        id:           existing?.id ?? `virtual-${slot.slotKey}-${dateStr}`,
        scheduleSlotId: slot.slotKey,
        classType:    { id: slot.classTypeId, name: slot.classType.name, duration: slot.durationMin, isActive: true },
        instructor:   slot.instructor ? { firstName: slot.instructor.firstName, lastName: slot.instructor.lastName } : null,
        instructorId: slot.instructorId ?? null,
        startTime:    startTime.toISOString(),
        endTime:      endTime.toISOString(),
        capacity:     slot.capacity,
        isCanceled:   false,
        location:     null,
        notes:        null,
        _count:       { bookings: existing?._count.bookings ?? 0 },
      })
    }
  }

  // Also include any manually-created sessions (no scheduleSlotId) in range
  const manualSessions = await prisma.classSession.findMany({
    where: {
      startTime: { gte: start, lte: end },
      isCanceled: false,
      scheduleSlotId: null,
      ...(filterStaffId ? { instructorId: filterStaffId } : {}),
    },
    include: {
      classType: true,
      instructor: { select: { firstName: true, lastName: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  for (const s of manualSessions) {
    events.push({ ...s, startTime: s.startTime.toISOString(), endTime: s.endTime.toISOString() })
  }

  // Sort by startTime
  events.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = (session.user as any).role === 'ADMIN'
  const body = await req.json()
  const { classTypeId, startTime, endTime, capacity, location, notes } = body

  let instructorId = body.instructorId ?? null
  if (!isAdmin) {
    const staffRecord = await prisma.staff.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!staffRecord) return NextResponse.json({ error: 'No staff record found for your account' }, { status: 403 })
    instructorId = staffRecord.id
  }

  const classSession = await prisma.classSession.create({
    data: {
      classTypeId,
      instructorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: capacity ?? 12,
      location: location ?? null,
      notes: notes ?? null,
    },
    include: { classType: true, instructor: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(classSession)
}


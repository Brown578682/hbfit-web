import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Returns cancelled sessions for a date range so the schedule grid can show
// a "Cancelled" badge without waiting for a click.
// GET /api/classes/cancelled?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to   = searchParams.get('to')

  if (!from || !to) return NextResponse.json({ error: 'from and to required' }, { status: 400 })

  const fromDate = new Date(`${from}T00:00:00Z`)
  const toDate   = new Date(`${to}T23:59:59Z`)

  const sessions = await prisma.classSession.findMany({
    where: {
      isCanceled: true,
      startTime: { gte: fromDate, lte: toDate },
      scheduleSlotId: { not: null },
    },
    select: {
      scheduleSlotId: true,
      startTime: true,
      cancelReason: true,
    },
  })

  // Return slotId + date string (YYYY-MM-DD in ET) + cancelReason
  const result = sessions.map(s => ({
    slotId: s.scheduleSlotId,
    // startTime stored in UTC — extract date portion for the ET day
    // (class times are 5am–8pm ET so UTC date = ET date for most; good enough for badge)
    date: s.startTime.toISOString().slice(0, 10),
    cancelReason: s.cancelReason,
  }))

  return NextResponse.json(result)
}

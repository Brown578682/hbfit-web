// GET /api/admin/forecast
// Returns day-by-day deposit forecast for the current calendar month.
// Each active membership's next billing date is projected from currentPeriodStart + 28 days.
// Result: array of { day: number, amount: number (cents), members: string[] }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthStart = new Date(year, month, 1)
  const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59, 999)

  // All active memberships with plan price + billing anchor
  const memberships = await prisma.membership.findMany({
    where: { status: 'ACTIVE', currentPeriodStart: { not: null } },
    include: {
      plan: { select: { monthlyPrice: true } },
      member: { select: { firstName: true, lastName: true } },
    },
  })

  // Build day buckets: day 1..daysInMonth
  const buckets: { amount: number; members: string[] }[] = Array.from(
    { length: daysInMonth }, () => ({ amount: 0, members: [] })
  )

  const CYCLE_DAYS = 28

  for (const m of memberships) {
    if (!m.currentPeriodStart || !m.plan) continue
    const price = m.plan.monthlyPrice ?? 0
    const name  = `${m.member.firstName} ${m.member.lastName}`

    // Walk 28-day cycles forward from currentPeriodStart until we find
    // all billing dates that land in this calendar month
    let billingDate = new Date(m.currentPeriodStart)

    // Step forward to find dates within this month (could be 0 or 1 per member per month)
    // Go back far enough to catch one full cycle
    while (billingDate < monthStart) {
      billingDate = new Date(billingDate.getTime() + CYCLE_DAYS * 86400000)
    }
    // Now collect any billing dates in this month
    while (billingDate <= monthEnd) {
      const d = billingDate.getDate() // 1-indexed
      buckets[d - 1].amount  += price
      buckets[d - 1].members.push(name)
      billingDate = new Date(billingDate.getTime() + CYCLE_DAYS * 86400000)
    }
  }

  const today = now.getDate()
  const result = buckets.map((b, i) => ({
    day: i + 1,
    amount: b.amount,
    members: b.members,
    isPast:  i + 1 < today,
    isToday: i + 1 === today,
  }))

  return NextResponse.json({
    year,
    month,
    monthName: now.toLocaleDateString('en-US', { month: 'long' }),
    daysInMonth,
    today,
    days: result,
    totalForecast: result.reduce((s, d) => s + d.amount, 0),
    totalCollected: result.filter(d => d.isPast || d.isToday).reduce((s, d) => s + d.amount, 0),
  })
}

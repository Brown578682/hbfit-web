import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // ── Calendar month window ──────────────────────────────────────────────────
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // ── Member counts ──────────────────────────────────────────────────────────
    const [memberCount, activeCount, leadCount] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({ where: { status: { in: ['LEAD', 'VISITOR'] } } }),
    ])

    // ── Referrals this month ───────────────────────────────────────────────────
    const referralCount = await prisma.member.count({
      where: {
        referredById: { not: null },
        joinedAt: { gte: monthStart, lte: monthEnd },
      },
    })

    // ── Churn rate: members who went INACTIVE this month / active at start ─────
    // Approximation: cancellations this month ÷ active members
    const canceledThisMonth = await prisma.membership.count({
      where: {
        status: { in: ['CANCELED', 'UNPAID'] },
        canceledAt: { gte: monthStart, lte: monthEnd },
      },
    })
    const churnRate = activeCount > 0
      ? Math.round((canceledThisMonth / (activeCount + canceledThisMonth)) * 100)
      : 0

    // ── Revenue — calendar month ───────────────────────────────────────────────
    //
    // Membership dues PAID: active subscriptions whose currentPeriodStart falls
    // within this calendar month (i.e. a billing cycle started this month).
    // Each represents one 4-week payment that was collected.
    const paidMemberships = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        currentPeriodStart: { gte: monthStart, lte: monthEnd },
      },
      include: { plan: { select: { monthlyPrice: true } } },
    })
    const membershipPaid = paidMemberships.reduce(
      (sum, m) => sum + (m.plan?.monthlyPrice ?? 0), 0
    )

    // Membership dues PENDING: past-due or unpaid subscriptions — use plan price
    // as the expected-but-uncollected amount
    const pendingMemberships = await prisma.membership.findMany({
      where: { status: { in: ['PAST_DUE', 'UNPAID'] } },
      include: { plan: { select: { monthlyPrice: true } } },
    })
    const membershipPending = pendingMemberships.reduce(
      (sum, m) => sum + (m.plan?.monthlyPrice ?? 0), 0
    )

    // Merchandise: kiosk purchases settled this calendar month
    const kioskPurchases = await prisma.kioskPurchase.findMany({
      where: { settledAt: { gte: monthStart, lte: monthEnd } },
      select: { priceCents: true, quantity: true },
    })
    const merchandise = kioskPurchases.reduce(
      (sum, p) => sum + p.priceCents * p.quantity, 0
    )

    // Services: no model yet — placeholder 0
    const services = 0

    // ── Response ───────────────────────────────────────────────────────────────
    return NextResponse.json({
      // Counts
      memberCount,
      activeCount,
      leadCount,
      referralCount,
      churnRate,

      // Revenue (cents) — all based on calendar month
      revenue: {
        membershipPaid,
        membershipPending,
        merchandise,
        services,
        // Convenience: month label for display
        month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    })
  } catch (err) {
    console.error('[/api/admin/stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

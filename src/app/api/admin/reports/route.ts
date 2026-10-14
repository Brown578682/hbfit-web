import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

export async function GET() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // ── Membership stats ───────────────────────────────────────────────────
    const [memberStatusCounts, membersByPlan, newMembersByMonth] = await Promise.all([
      // Active vs migrating
      prisma.member.groupBy({ by: ['status'], _count: { id: true } }),

      // Members per plan (active memberships)
      prisma.membership.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: { select: { name: true } } },
      }),

      // New members by month for last 6 months
      prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('month', "joinedAt") as month, COUNT(*) as count
        FROM "Member"
        WHERE "joinedAt" >= ${sixMonthsAgo}
        GROUP BY 1 ORDER BY 1
      `,
    ]);

    const activeCount = memberStatusCounts.find(s => s.status === 'ACTIVE')?._count.id ?? 0;
    const migratingCount = memberStatusCounts.find(s => s.status === 'MIGRATING')?._count.id ?? 0;

    const planCounts: Record<string, number> = {};
    for (const m of membersByPlan) {
      const name = m.plan.name;
      planCounts[name] = (planCounts[name] ?? 0) + 1;
    }

    // ── Revenue (Stripe) ───────────────────────────────────────────────────
    // MRR: pull active subs with discounts
    const stripeSubs: Stripe.Subscription[] = [];
    let cursor: string | undefined;
    do {
      const page = await stripe.subscriptions.list({
        status: 'active', limit: 100,
        expand: ['data.items.data.price', 'data.discounts'],
        ...(cursor ? { starting_after: cursor } : {}),
      });
      stripeSubs.push(...page.data);
      cursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
    } while (cursor);

    let mrrCents = 0;
    for (const sub of stripeSubs) {
      const s = sub as any;
      const raw = s.items.data.reduce((a: number, item: any) =>
        a + (item.price.unit_amount ?? 0) * (item.quantity ?? 1), 0);
      let disc = 0;
      const discounts: any[] = s.discounts ?? [];
      for (const d of discounts) {
        const coupon = d?.coupon ?? d?.source?.coupon;
        if (!coupon) continue;
        if (coupon.amount_off) disc += coupon.amount_off;
        else if (coupon.percent_off) disc += Math.round(raw * coupon.percent_off / 100);
      }
      mrrCents += Math.max(0, raw - disc);
    }

    // YTD revenue from charges
    const yearStartTs = Math.floor(yearStart.getTime() / 1000);
    let ytdCents = 0;
    let chargeCursor: string | undefined;
    do {
      const charges = await stripe.charges.list({
        created: { gte: yearStartTs }, limit: 100,
        ...(chargeCursor ? { starting_after: chargeCursor } : {}),
      });
      ytdCents += charges.data.filter(c => c.paid && !c.refunded).reduce((a, c) => a + c.amount, 0);
      chargeCursor = charges.has_more ? charges.data[charges.data.length - 1].id : undefined;
    } while (chargeCursor);

    // Revenue by month (last 6 months via charges)
    const sixMonthsAgoTs = Math.floor(sixMonthsAgo.getTime() / 1000);
    const revenueByMonth: Record<string, number> = {};
    let revCursor: string | undefined;
    do {
      const charges = await stripe.charges.list({
        created: { gte: sixMonthsAgoTs }, limit: 100,
        ...(revCursor ? { starting_after: revCursor } : {}),
      });
      for (const c of charges.data) {
        if (!c.paid || c.refunded) continue;
        const key = new Date(c.created * 1000).toISOString().slice(0, 7); // "2026-07"
        revenueByMonth[key] = (revenueByMonth[key] ?? 0) + c.amount;
      }
      revCursor = charges.has_more ? charges.data[charges.data.length - 1].id : undefined;
    } while (revCursor);

    // ── Attendance ─────────────────────────────────────────────────────────
    const [checkinsByMonth, bookingsByDay, totalBookings, totalCheckins, topMembers] = await Promise.all([
      prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT DATE_TRUNC('month', "checkedAt") as month, COUNT(*) as count
        FROM "CheckIn"
        WHERE "checkedAt" >= ${sixMonthsAgo}
        GROUP BY 1 ORDER BY 1
      `,

      prisma.$queryRaw<{ day: string; count: bigint }[]>`
        SELECT TO_CHAR(cs."startTime", 'Dy') as day,
               EXTRACT(DOW FROM cs."startTime") as dow,
               COUNT(cb.id) as count
        FROM "ClassBooking" cb
        JOIN "ClassSession" cs ON cs.id = cb."sessionId"
        WHERE cb.status = 'CONFIRMED'
        GROUP BY 1, 2 ORDER BY 2
      `,

      prisma.classBooking.count({ where: { status: 'CONFIRMED' } }),
      prisma.checkIn.count(),

      // Top 5 most booked members
      prisma.$queryRaw<{ name: string; count: bigint }[]>`
        SELECT m."firstName" || ' ' || m."lastName" as name, COUNT(cb.id) as count
        FROM "ClassBooking" cb
        JOIN "Member" m ON m.id = cb."memberId"
        WHERE cb.status = 'CONFIRMED'
        GROUP BY 1 ORDER BY count DESC LIMIT 5
      `,
    ]);

    return NextResponse.json({
      membership: {
        activeCount,
        migratingCount,
        planCounts,
        newByMonth: newMembersByMonth.map(r => ({
          month: r.month.toISOString().slice(0, 7),
          count: Number(r.count),
        })),
      },
      revenue: {
        mrrCents,
        ytdCents,
        byMonth: Object.entries(revenueByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, cents]) => ({ month, cents })),
      },
      attendance: {
        totalBookings,
        totalCheckins,
        byDay: bookingsByDay.map(r => ({ day: r.day, count: Number(r.count) })),
        checkinsByMonth: checkinsByMonth.map(r => ({
          month: r.month.toISOString().slice(0, 7),
          count: Number(r.count),
        })),
        topMembers: topMembers.map(r => ({ name: r.name, count: Number(r.count) })),
      },
    });
  } catch (err) {
    console.error('[api/admin/reports]', err);
    return NextResponse.json({ error: 'Failed to load report data' }, { status: 500 });
  }
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const OCT_START = new Date('2026-10-01T00:00:00.000Z')
const OCT_END   = new Date('2026-10-31T23:59:59.999Z')

async function main() {
  // 1. Member snapshot
  const totalActive    = await prisma.member.count({ where: { status: 'ACTIVE' } })
  const totalInactive  = await prisma.member.count({ where: { status: 'INACTIVE' } })
  const totalMigrating = await prisma.member.count({ where: { status: 'MIGRATING' } })

  // 2. New members joined in October
  const newMembers = await prisma.member.findMany({
    where: { joinedAt: { gte: OCT_START, lte: OCT_END } },
    include: {
      memberships: { where: { status: 'ACTIVE' }, include: { plan: { select: { name: true, slug: true, monthlyPrice: true } } } },
      household: { select: { name: true } }
    },
    orderBy: { joinedAt: 'asc' }
  })

  // 3. Memberships canceled in October (lost members)
  const canceledMemberships = await prisma.membership.findMany({
    where: { status: 'CANCELED', canceledAt: { gte: OCT_START, lte: OCT_END } },
    include: {
      member: { select: { firstName: true, lastName: true, status: true } },
      plan: { select: { name: true } }
    }
  })

  // 4. Plan breakdown (active members + their active memberships)
  const activeMembers = await prisma.member.findMany({
    where: { status: 'ACTIVE' },
    include: {
      memberships: { where: { status: 'ACTIVE' }, include: { plan: { select: { name: true, slug: true, monthlyPrice: true } } } },
      household: { select: { id: true, name: true } }
    }
  })

  const planCounts: Record<string, { name: string, count: number, unitPriceCents: number }> = {}
  const householdsSeen = new Set<string>()
  let minors = 0, adults = 0

  for (const m of activeMembers) {
    if (m.isMinor) minors++; else adults++
    if (m.householdId && m.isHouseholdPrimary) householdsSeen.add(m.householdId)
    for (const ms of m.memberships) {
      const slug = ms.plan.slug
      if (!planCounts[slug]) planCounts[slug] = { name: ms.plan.name, count: 0, unitPriceCents: ms.plan.monthlyPrice }
      planCounts[slug].count++
    }
  }

  const noActivePlan = activeMembers.filter(m => m.memberships.length === 0)

  // 5. Household add-ons
  const allHouseholds = await prisma.household.findMany({
    include: { members: { where: { status: 'ACTIVE' }, select: { isHouseholdPrimary: true, firstName: true, lastName: true, isMinor: true } } }
  })
  let addOnCount = 0
  for (const h of allHouseholds) {
    addOnCount += h.members.filter(m => !m.isHouseholdPrimary).length
  }

  // 6. Check-ins in October (field is `checkedAt`)
  const checkIns = await prisma.checkIn.findMany({
    where: { checkedAt: { gte: OCT_START, lte: OCT_END } },
    include: { member: { select: { firstName: true, lastName: true } } },
    orderBy: { checkedAt: 'asc' }
  })

  const uniqueCheckinMembers = new Set(checkIns.map(c => c.memberId))
  const byWeek: Record<string, number> = {
    'Week 1 (Oct 1–7)': 0, 'Week 2 (Oct 8–14)': 0,
    'Week 3 (Oct 15–21)': 0, 'Week 4 (Oct 22–31)': 0
  }
  for (const c of checkIns) {
    const day = new Date(c.checkedAt).getUTCDate()
    if (day <= 7) byWeek['Week 1 (Oct 1–7)']++
    else if (day <= 14) byWeek['Week 2 (Oct 8–14)']++
    else if (day <= 21) byWeek['Week 3 (Oct 15–21)']++
    else byWeek['Week 4 (Oct 22–31)']++
  }

  const attendanceCounts: Record<string, { name: string, count: number }> = {}
  for (const c of checkIns) {
    if (!attendanceCounts[c.memberId]) attendanceCounts[c.memberId] = { name: `${c.member.firstName.trim()} ${c.member.lastName.trim()}`, count: 0 }
    attendanceCounts[c.memberId].count++
  }
  const topAttenders = Object.values(attendanceCounts).sort((a, b) => b.count - a.count).slice(0, 10)

  // 7. GAP members
  const gapMembers = await prisma.member.findMany({
    where: { status: 'ACTIVE', gapEligible: true },
    select: { firstName: true, lastName: true, gapCategory: true, gapVerifiedAt: true }
  })

  // 8. Revenue estimate
  let subRevenue = 0
  for (const m of activeMembers) {
    for (const ms of m.memberships) subRevenue += ms.plan.monthlyPrice
  }
  const addOnRevenue = addOnCount * 5000

  console.log(JSON.stringify({
    snapshot: { totalActive, totalInactive, totalMigrating, adults, minors, households: householdsSeen.size },
    newMembers: newMembers.map(m => ({
      name: `${m.firstName.trim()} ${m.lastName.trim()}`,
      joinedAt: m.joinedAt,
      isMinor: m.isMinor,
      isPrimary: m.isHouseholdPrimary,
      household: m.household?.name,
      plan: m.memberships[0]?.plan?.name ?? (m.isHouseholdPrimary ? '—' : 'household add-on')
    })),
    canceledMemberships: canceledMemberships.map(ms => ({
      member: `${ms.member.firstName.trim()} ${ms.member.lastName.trim()}`,
      memberStatus: ms.member.status,
      plan: ms.plan.name,
      canceledAt: ms.canceledAt
    })),
    planBreakdown: planCounts,
    noActivePlan: noActivePlan.map(m => `${m.firstName.trim()} ${m.lastName.trim()}`),
    addOns: { count: addOnCount },
    checkIns: {
      total: checkIns.length,
      uniqueMembers: uniqueCheckinMembers.size,
      byWeek,
      topAttenders
    },
    gapMembers: gapMembers.map(m => ({
      name: `${m.firstName.trim()} ${m.lastName.trim()}`,
      category: m.gapCategory,
      verifiedAt: m.gapVerifiedAt
    })),
    revenue: {
      subscriptionsCents: subRevenue,
      addOnsCents: addOnRevenue,
      totalCents: subRevenue + addOnRevenue,
      totalDollars: ((subRevenue + addOnRevenue) / 100).toFixed(2)
    }
  }, null, 2))
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); await pool.end() })

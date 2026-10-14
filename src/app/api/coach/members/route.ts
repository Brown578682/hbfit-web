import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const planSlug = searchParams.get('plan') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (status) where.status = status
  if (planSlug) {
    where.memberships = { some: { plan: { slug: planSlug }, status: 'ACTIVE' } }
  }

  const members = await prisma.member.findMany({
    where,
    include: {
      user: { select: { email: true, role: true, username: true } },
      memberships: {
        include: { plan: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      household: {
        include: {
          members: {
            include: {
              user: { select: { email: true, username: true } },
              memberships: {
                include: { plan: { select: { id: true, name: true, slug: true } } },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
              _count: { select: { checkIns: true } },
            },
          },
        },
      },
      _count: { select: { checkIns: true, bookings: true } },
    },
    orderBy: [{ isHouseholdPrimary: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }],
  })

  const total = await prisma.member.count({ where })

  // Build grouped output: primaries with dependents nested
  // Track which member IDs we've already emitted as dependents
  const dependentIds = new Set<string>()
  members.forEach(m => {
    if (m.isHouseholdPrimary && m.household) {
      m.household.members.forEach(dep => {
        if (dep.id !== m.id) dependentIds.add(dep.id)
      })
    }
  })

  const toSafe = (m: any, isPrimary: boolean) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user?.email ?? m.user?.username ?? '',
    isMinor: m.isMinor,
    status: m.status,
    joinedAt: m.joinedAt,
    lastVisit: m.lastVisit,
    gapEligible: m.gapEligible,
    gapCategory: m.gapCategory,
    isHouseholdPrimary: isPrimary,
    householdId: m.householdId,
    currentPlan: m.memberships[0]?.plan ?? null,
    checkInCount: m._count?.checkIns ?? 0,
    accessLevel: m.accessLevel,
    dependents: [] as any[],
  })

  const rows: any[] = []
  members.forEach(m => {
    if (dependentIds.has(m.id)) return // will be nested under primary

    const row = toSafe(m, m.isHouseholdPrimary)

    // Attach household dependents if primary
    if (m.isHouseholdPrimary && m.household) {
      m.household.members
        .filter((dep: any) => dep.id !== m.id)
        .sort((a: any, b: any) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
        .forEach((dep: any) => {
          row.dependents.push(toSafe(dep, false))
        })
    }

    rows.push(row)
  })

  // Available plan slugs for filter dropdown
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ members: rows, total, plans })
}

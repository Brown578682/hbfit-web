import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 50

  const where: any = {}
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (status) where.status = status

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: { select: { email: true, role: true } },
        memberships: { include: { plan: { select: { name: true, slug: true } } }, orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { checkIns: true, bookings: true } },
      },
      orderBy: [{ status: 'asc' }, { lastName: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.member.count({ where }),
  ])

  // Strip sensitive fields
  const safe = members.map(m => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    email: m.user.email,
    phone: m.phone,
    status: m.status,
    joinedAt: m.joinedAt,
    lastVisit: m.lastVisit,
    gapEligible: m.gapEligible,
    gapCategory: m.gapCategory,
    zip: m.zip,
    city: m.city,
    state: m.state,
    currentPlan: m.memberships[0]?.plan ?? null,
    checkInCount: m._count.checkIns,
    bookingCount: m._count.bookings,
    referredById: m.referredById,
  }))

  return NextResponse.json({ members: safe, total, page, pages: Math.ceil(total / limit) })
}

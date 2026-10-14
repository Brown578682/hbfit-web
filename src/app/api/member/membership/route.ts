import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json(null, { status: 401 })

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    include: {
      memberships: {
        where: { status: { in: ['ACTIVE', 'PAST_DUE', 'TRIALING'] } },
        include: { plan: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!member || member.memberships.length === 0) return NextResponse.json(null)

  const m = member.memberships[0]
  return NextResponse.json({
    plan:             m.plan.name,
    status:           m.status,
    currentPeriodEnd: m.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: m.cancelAtPeriodEnd,
  })
}

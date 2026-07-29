import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true, createdAt: true } },
      memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
      checkIns: { orderBy: { checkedAt: 'desc' }, take: 30 },
      bookings: { include: { session: { include: { classType: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      progress: { orderBy: { recordedAt: 'desc' }, take: 10 },
      coachNotes: { include: { coach: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } },
      goals: { orderBy: { createdAt: 'desc' } },
      referredBy: { select: { id: true, firstName: true, lastName: true } },
      referrals: { select: { id: true, firstName: true, lastName: true, status: true, joinedAt: true } },
    },
  })

  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Strip sensitive fields — no stripeCustomerId, no gapDocumentUrl, no stripeSubscriptionId
  const { stripeCustomerId, gapDocumentUrl, ...safe } = member as any
  safe.memberships = safe.memberships.map((m: any) => {
    const { stripeSubscriptionId, ...rest } = m
    return rest
  })

  return NextResponse.json(safe)
}

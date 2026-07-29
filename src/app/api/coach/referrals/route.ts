import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Get all members with referral relationships
  const members = await prisma.member.findMany({
    select: {
      id: true, firstName: true, lastName: true, status: true, joinedAt: true,
      referredById: true,
      _count: { select: { referrals: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  return NextResponse.json(members)
}

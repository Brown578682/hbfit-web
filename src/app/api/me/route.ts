import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null }, { status: 401 })
  // Include staffId if this user has a Staff record
  const staffRecord = await prisma.staff.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  }).catch(() => null)
  // Include classCredits if this user has a Member record
  const memberRecord = await prisma.member.findUnique({
    where: { userId: session.user.id },
    select: { classCredits: true },
  }).catch(() => null)
  return NextResponse.json({ user: { ...session.user, staffId: staffRecord?.id ?? null, classCredits: memberRecord?.classCredits ?? 0 } })
}

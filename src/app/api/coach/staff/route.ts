import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && (!session?.user || (session.user as any).role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const staff = await prisma.staff.findMany({
    where: { isActive: true },
    include: { user: { select: { email: true } } },
    orderBy: { lastName: 'asc' },
  })

  return NextResponse.json(staff.map(s => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    title: s.title,
    email: s.user.email,
  })))
}

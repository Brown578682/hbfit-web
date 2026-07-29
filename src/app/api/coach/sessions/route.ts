import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start') || new Date().toISOString()
  const end = searchParams.get('end') || new Date(Date.now() + 14 * 86400000).toISOString()
  const coachOnly = searchParams.get('mine') === 'true'

  const session = await getSession()
  const isDev = process.env.NODE_ENV === 'development'
  let staffId: string | undefined
  // Admin (or dev) can pass an explicit staffId to view any coach's sessions
  const explicitStaffId = searchParams.get('staffId')
  if (explicitStaffId && (isDev || (session?.user as any)?.role === 'ADMIN')) {
    staffId = explicitStaffId
  } else if (coachOnly && session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { staff: true } })
    staffId = user?.staff?.id
  }

  const sessions = await prisma.classSession.findMany({
    where: {
      startTime: { gte: new Date(start), lte: new Date(end) },
      isCanceled: false,
      ...(staffId ? { instructorId: staffId } : {}),
    },
    include: {
      classType: true,
      instructor: { select: { firstName: true, lastName: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const { classTypeId, instructorId, startTime, endTime, capacity, location, notes } = await req.json()
  const session = await prisma.classSession.create({
    data: { classTypeId, instructorId, startTime: new Date(startTime), endTime: new Date(endTime), capacity: capacity ?? 12, location, notes },
    include: { classType: true, instructor: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(session)
}

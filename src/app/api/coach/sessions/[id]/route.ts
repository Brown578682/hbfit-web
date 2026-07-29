import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      classType: true,
      instructor: true,
      bookings: {
        include: {
          member: { select: { id: true, firstName: true, lastName: true, phone: true, status: true, gapEligible: true, checkInCode: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(session)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const session = await prisma.classSession.update({ where: { id }, data: body })
  return NextResponse.json(session)
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const types = await prisma.classType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(types)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { name, description, color, duration } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const type = await prisma.classType.create({
    data: { name, description, color: color ?? '#f59e0b', duration: duration ?? 60 },
  })
  return NextResponse.json(type, { status: 201 })
}

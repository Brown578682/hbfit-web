// GET  /api/member/recurring          — list member's active recurring bookings
// POST /api/member/recurring          — add { slotId }
// DELETE /api/member/recurring        — remove { slotId }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getSlotByKey } from '@/lib/schedule-db'

export const runtime = 'nodejs'

async function getMember(userId: string) {
  return prisma.member.findUnique({ where: { userId }, select: { id: true } })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const member = await getMember(session.user.id)
  if (!member) return NextResponse.json([])

  const rows = await prisma.recurringBooking.findMany({
    where: { memberId: member.id, active: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(rows.map(r => r.slotId))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await req.json()
  if (!slotId || !await getSlotByKey(slotId)) return NextResponse.json({ error: 'Invalid slotId' }, { status: 400 })

  const member = await getMember(session.user.id)
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  await prisma.recurringBooking.upsert({
    where: { memberId_slotId: { memberId: member.id, slotId } },
    update: { active: true },
    create: { memberId: member.id, slotId, active: true },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await req.json()

  const member = await getMember(session.user.id)
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  await prisma.recurringBooking.updateMany({
    where: { memberId: member.id, slotId },
    data: { active: false },
  })
  return NextResponse.json({ ok: true })
}

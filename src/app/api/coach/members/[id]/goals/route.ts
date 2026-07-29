import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const user = session?.user ? await prisma.user.findUnique({ where: { email: session.user.email! }, include: { staff: true } }) : null

  const { title, description, targetDate } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const goal = await prisma.memberGoal.create({
    data: { memberId: id, setByCoach: user?.staff?.id, title: title.trim(), description: description?.trim(), targetDate: targetDate ? new Date(targetDate) : null },
  })
  return NextResponse.json(goal)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = await params
  const { goalId, completedAt, title, description, targetDate } = await req.json()
  if (!goalId) return NextResponse.json({ error: 'goalId required' }, { status: 400 })

  const goal = await prisma.memberGoal.update({
    where: { id: goalId },
    data: { completedAt: completedAt ? new Date(completedAt) : null, title, description, targetDate: targetDate ? new Date(targetDate) : undefined },
  })
  return NextResponse.json(goal)
}

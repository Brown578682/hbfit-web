import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const notes = await prisma.coachNote.findMany({
    where: { memberId: id },
    include: { coach: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { staff: true },
  })
  if (!user?.staff) return NextResponse.json({ error: 'No staff record' }, { status: 403 })

  const { content, isPrivate } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const note = await prisma.coachNote.create({
    data: { memberId: id, coachId: user.staff.id, content: content.trim(), isPrivate: isPrivate ?? false },
    include: { coach: { select: { firstName: true, lastName: true } } },
  })
  return NextResponse.json(note)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = await params
  const { searchParams } = new URL(req.url)
  const noteId = searchParams.get('noteId')
  if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 })

  await prisma.coachNote.delete({ where: { id: noteId } })
  return NextResponse.json({ ok: true })
}

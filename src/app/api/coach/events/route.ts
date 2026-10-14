import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, ...rest } = body

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  // Auto-generate unique slug
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  const slug = `${base}-${suffix}`

  const event = await prisma.event.create({
    data: { title, slug, ...rest },
  })
  return NextResponse.json(event)
}

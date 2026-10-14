// PATCH /api/admin/booth/leads/[id]  — update notes (admin + coach)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const { notes } = await req.json()

  const lead = await (prisma as any).boothLead.update({
    where: { id },
    data:  { notes: notes?.trim() || null },
  })

  return NextResponse.json({ ok: true, id: lead.id, notes: lead.notes })
}

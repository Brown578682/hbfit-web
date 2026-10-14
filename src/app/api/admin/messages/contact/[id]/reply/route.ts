// POST /api/admin/messages/contact/[id]/reply
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendContactReply } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { body, fromName } = await req.json()

  if (!body?.trim()) {
    return NextResponse.json({ error: 'Reply body is required.' }, { status: 400 })
  }

  const msg = await prisma.contactMessage.findUnique({ where: { id } })
  if (!msg) return NextResponse.json({ error: 'Message not found.' }, { status: 404 })

  // Send email via Resend
  await sendContactReply({
    to:           msg.email,
    toName:       msg.name,
    fromName:     fromName?.trim() || 'Honor Bound FIT',
    subject:      msg.subject ? `Re: ${msg.subject}` : 'Re: Your message to Honor Bound FIT',
    replyBody:    body.trim(),
    originalMsg:  msg.message,
  })

  // Mark read + replied
  await prisma.contactMessage.update({
    where: { id },
    data:  { readAt: msg.readAt ?? new Date(), repliedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}

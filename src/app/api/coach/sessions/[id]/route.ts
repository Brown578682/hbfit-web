import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendPushToUser } from '@/lib/push'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY!)

async function notifyBookedMembers(
  sessionId: string,
  type: 'edited' | 'canceled',
  details: { className: string; originalStart: Date; newStart?: Date; cancelReason?: string }
) {
  const bookings = await prisma.classBooking.findMany({
    where: { sessionId, status: { in: ['CONFIRMED', 'WAITLISTED'] } },
    include: { member: { include: { user: { select: { id: true, email: true } } } } },
  })
  if (!bookings.length) return

  const dateStr = details.originalStart.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York',
  })
  const timeStr = details.originalStart.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
  })

  for (const booking of bookings) {
    const firstName = booking.member.firstName
    const userId = booking.member.user?.id
    const email = booking.member.user?.email

    if (userId) {
      if (type === 'canceled') {
        await sendPushToUser(userId, {
          title: `Class Canceled: ${details.className}`,
          body: `Your ${dateStr} at ${timeStr} class has been canceled.${details.cancelReason ? ` Reason: ${details.cancelReason}` : ''}`,
          url: '/schedule',
          tag: `session-canceled-${sessionId}`,
        }).catch(() => {})
      } else {
        const newTimeStr = details.newStart?.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York',
        })
        await sendPushToUser(userId, {
          title: `Class Updated: ${details.className}`,
          body: `Your ${dateStr} class has been updated.${newTimeStr ? ` New time: ${newTimeStr}.` : ''}`,
          url: '/schedule',
          tag: `session-edited-${sessionId}`,
        }).catch(() => {})
      }
    }

    if (email) {
      const subject = type === 'canceled'
        ? `Class Canceled: ${details.className} on ${dateStr}`
        : `Class Updated: ${details.className} on ${dateStr}`

      const bodyHtml = type === 'canceled'
        ? `<p>Hi ${firstName},</p>
           <p>Your <strong>${details.className}</strong> class scheduled for <strong>${dateStr} at ${timeStr}</strong> has been <strong>canceled</strong>.</p>
           ${details.cancelReason ? `<p><em>Reason: ${details.cancelReason}</em></p>` : ''}
           <p>Head to the <a href="https://honorboundfit.com/schedule">schedule page</a> to book another class.</p>`
        : `<p>Hi ${firstName},</p>
           <p>Your <strong>${details.className}</strong> class on <strong>${dateStr}</strong> has been updated by your coach.</p>
           ${details.newStart ? `<p>New time: <strong>${details.newStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })}</strong></p>` : ''}
           <p>Check the <a href="https://honorboundfit.com/schedule">schedule</a> for full details.</p>`

      await resend.emails.send({
        from: 'Honor Bound FIT <noreply@honorboundfit.com>',
        to: email,
        subject,
        html: `<!DOCTYPE html><html><body style="background:#000;color:#e5e5e5;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <p style="font-family:Montserrat,sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;margin:0 0 24px">
            <span style="color:#1d4ed8">HB</span><span style="color:#dc2626">F</span><span style="color:#fff">I</span><span style="color:#dc2626">T</span>
          </p>
          ${bodyHtml}
          <hr style="border:none;border-top:1px solid #27272a;margin:32px 0"/>
          <p style="font-size:12px;color:#52525b">Honor Bound FIT · Fredericksburg, VA · <a href="https://honorboundfit.com" style="color:#52525b">honorboundfit.com</a></p>
        </body></html>`,
      }).catch(() => {})
    }
  }
}

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
  const authSession = await getSession()
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = (authSession.user as any).role === 'ADMIN'

  if (!isAdmin) {
    const staffRecord = await prisma.staff.findUnique({
      where: { userId: authSession.user.id },
      select: { id: true },
    })
    if (!staffRecord) return NextResponse.json({ error: 'No staff record' }, { status: 403 })
    const classSession = await prisma.classSession.findUnique({ where: { id }, select: { instructorId: true } })
    if (!classSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (classSession.instructorId !== staffRecord.id) {
      return NextResponse.json({ error: 'You can only edit your own sessions' }, { status: 403 })
    }
  }

  const before = await prisma.classSession.findUnique({ where: { id }, include: { classType: true } })
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.classSession.update({ where: { id }, data: body })

  const isCanceling = body.isCanceled === true && !before.isCanceled
  const isEditing = !isCanceling && (body.startTime || body.endTime)

  if (isCanceling || isEditing) {
    notifyBookedMembers(id, isCanceling ? 'canceled' : 'edited', {
      className: before.classType.name,
      originalStart: before.startTime,
      newStart: body.startTime ? new Date(body.startTime) : undefined,
      cancelReason: body.cancelReason ?? undefined,
    }).catch(() => {})
  }

  return NextResponse.json(updated)
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendPushToUser } from '@/lib/push'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { isActive, instructorId, startHour, startMinute, durationMin, days, capacity } = body

  const slot = await prisma.scheduleSlot.findUnique({ where: { id } })
  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  if (session.user.role !== 'ADMIN') {
    const staff = await prisma.staff.findUnique({ where: { userId: session.user.id }, select: { id: true } })
    if (slot.instructorId !== staff?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.scheduleSlot.update({
    where: { id },
    data: {
      ...(isActive       !== undefined && { isActive }),
      ...(instructorId   !== undefined && { instructorId: instructorId || null }),
      ...(startHour      !== undefined && { startHour }),
      ...(startMinute    !== undefined && { startMinute }),
      ...(durationMin    !== undefined && { durationMin }),
      ...(days           !== undefined && { days }),
      ...(capacity       !== undefined && { capacity }),
    },
    include: {
      classType:  { select: { id: true, name: true, color: true } },
      instructor: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  let canceledCount = 0
  let affectedMembers = 0

  if (isActive === false) {
    const now = new Date()
    const futureSessions = await prisma.classSession.findMany({
      where: { scheduleSlotId: slot.slotKey, startTime: { gt: now }, isCanceled: false },
      include: {
        classType: true,
        bookings: {
          where: { status: { in: ['CONFIRMED', 'WAITLISTED'] } },
          include: { member: { include: { user: { select: { id: true, email: true } } } } },
        },
      },
    })

    const result = await prisma.classSession.updateMany({
      where: { scheduleSlotId: slot.slotKey, startTime: { gt: now }, isCanceled: false },
      data: { isCanceled: true, cancelReason: 'Recurring slot deactivated' },
    })
    canceledCount = result.count

    const notified = new Set<string>()
    for (const cs of futureSessions) {
      for (const booking of cs.bookings) {
        const userId = booking.member.user?.id
        const email = booking.member.user?.email
        const firstName = booking.member.firstName
        if (!userId && !email) continue

        const dateStr = cs.startTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York' })
        const timeStr = cs.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })

        if (userId && !notified.has(`push:${userId}`)) {
          notified.add(`push:${userId}`)
          affectedMembers++
          await sendPushToUser(userId, {
            title: `Class Canceled: ${cs.classType.name}`,
            body: `Your recurring ${cs.classType.name} classes have been removed from the schedule.`,
            url: '/schedule',
            tag: `slot-deactivated-${slot.slotKey}`,
          }).catch(() => {})
        }

        if (email && !notified.has(`email:${email}`)) {
          notified.add(`email:${email}`)
          await resend.emails.send({
            from: 'Honor Bound FIT <noreply@honorboundfit.com>',
            to: email,
            subject: `Schedule Update: ${cs.classType.name} removed from rotation`,
            html: `<!DOCTYPE html><html><body style="background:#000;color:#e5e5e5;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px">
              <p style="font-family:Montserrat,sans-serif;font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;margin:0 0 24px">
                <span style="color:#1d4ed8">HB</span><span style="color:#dc2626">F</span><span style="color:#fff">I</span><span style="color:#dc2626">T</span>
              </p>
              <p>Hi ${firstName},</p>
              <p>The recurring <strong>${cs.classType.name}</strong> class has been removed from the schedule. All future sessions, including your upcoming one on <strong>${dateStr} at ${timeStr}</strong>, have been canceled.</p>
              <p>Head to the <a href="https://honorboundfit.com/schedule" style="color:#60a5fa">schedule page</a> to find another class that works for you.</p>
              <hr style="border:none;border-top:1px solid #27272a;margin:32px 0"/>
              <p style="font-size:12px;color:#52525b">Honor Bound FIT &middot; Fredericksburg, VA</p>
            </body></html>`,
          }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json({ slot: updated, canceledCount, affectedMembers })
}

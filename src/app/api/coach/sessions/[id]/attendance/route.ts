import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const { bookingId, checkedIn } = await req.json()

  const booking = await prisma.classBooking.update({
    where: { id: bookingId },
    data: { checkedIn },
  })

  // If checking in, also create a CheckIn record
  if (checkedIn) {
    const fullBooking = await prisma.classBooking.findUnique({ where: { id: bookingId } })
    if (fullBooking) {
      await prisma.checkIn.upsert({
        where: { id: `${sessionId}-${fullBooking.memberId}` },
        create: { id: `${sessionId}-${fullBooking.memberId}`, memberId: fullBooking.memberId, method: 'class', checkedAt: new Date() },
        update: { checkedAt: new Date() },
      })
    }
  }

  return NextResponse.json(booking)
}

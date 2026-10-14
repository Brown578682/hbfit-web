// POST /api/booth/register
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, dateOfBirth } = await req.json()

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !dateOfBirth) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Age check — must be 18+
    const dob = new Date(dateOfBirth)
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 18)
    if (dob > cutoff) {
      return NextResponse.json({ error: 'Participants must be 18 or older.' }, { status: 400 })
    }

    const source = `booth-${new Date().toISOString().slice(0, 10)}`

    const lead = await (prisma as any).boothLead.create({
      data: {
        firstName:     firstName.trim(),
        lastName:      lastName.trim(),
        email:         email.trim().toLowerCase(),
        phone:         phone.trim(),
        dateOfBirth:   dob,
        waiverSigned:  true,
        marketingOptIn: true,
        source,
      },
    })

    return NextResponse.json({ ok: true, id: lead.id })
  } catch (err) {
    console.error('[booth/register]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

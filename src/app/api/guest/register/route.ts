// POST /api/guest/register
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendGuestPassConfirmation, sendAdminGuestPassNotification } from '@/lib/email'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth,
      visitType, interests, howHeard, marketingOptIn,
    } = await req.json()

    // Required field validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !dateOfBirth) {
      return NextResponse.json({ error: 'All required fields must be completed.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!visitType) {
      return NextResponse.json({ error: 'Please select what brings you in today.' }, { status: 400 })
    }

    // Age check — 18+
    const dob = new Date(dateOfBirth)
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 18)
    if (dob > cutoff) {
      return NextResponse.json({ error: 'Guests must be 18 or older.' }, { status: 400 })
    }

    // Build notes string
    const visitLabels: Record<string, string> = {
      'free-week': 'Free Week Trial',
      'drop-in':   'Drop-In Class',
      'tour':      'Just Looking / Tour',
    }
    const noteParts: string[] = [
      `Visit type: ${visitLabels[visitType] ?? visitType}`,
    ]
    if (interests?.length > 0) noteParts.push(`Interests: ${(interests as string[]).join(', ')}`)
    if (howHeard) noteParts.push(`How heard: ${howHeard}`)

    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown'
    noteParts.push(`IP: ${ip}`)

    const lead = await (prisma as any).boothLead.create({
      data: {
        firstName:      firstName.trim(),
        lastName:       lastName.trim(),
        email:          email.trim().toLowerCase(),
        phone:          phone.trim(),
        dateOfBirth:    dob,
        waiverSigned:   true,
        marketingOptIn: marketingOptIn ?? true,
        source:         `guest-pass-${visitType}`,
        notes:          noteParts.join(' | '),
      },
    })

    // Fire emails — don't fail the request if they fail
    const emailPromises = [
      sendGuestPassConfirmation({
        to:        email.trim(),
        firstName: firstName.trim(),
        visitType: visitLabels[visitType] ?? visitType,
        interests: interests ?? [],
      }).catch(err => console.error('[guest/register] visitor email failed:', err)),

      sendAdminGuestPassNotification({
        firstName:  firstName.trim(),
        lastName:   lastName.trim(),
        email:      email.trim(),
        phone:      phone.trim(),
        visitType:  visitLabels[visitType] ?? visitType,
        interests:  interests ?? [],
        howHeard:   howHeard ?? '',
        leadId:     lead.id,
      }).catch(err => console.error('[guest/register] admin email failed:', err)),
    ]

    await Promise.allSettled(emailPromises)

    return NextResponse.json({ ok: true, id: lead.id })
  } catch (err) {
    console.error('[guest/register]', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}

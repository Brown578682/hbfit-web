import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { flow } = await req.json().catch(() => ({ flow: null }))

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    select: {
      id: true,
      stripeCustomerId: true,
      firstName: true,
      lastName: true,
      user: { select: { email: true } },
    },
  })

  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  let stripeCustomerId = member.stripeCustomerId

  // Auto-create a Stripe customer for migrated members who don't have one yet
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: member.user?.email ?? session.user.email ?? undefined,
      name:  `${member.firstName} ${member.lastName}`,
      metadata: { hbfit_member_id: member.id },
    })
    stripeCustomerId = customer.id
    await prisma.member.update({
      where: { id: member.id },
      data:  { stripeCustomerId },
    })
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://honorboundfit.com'}/dashboard/settings`

  const params: Stripe.BillingPortal.SessionCreateParams = {
    customer:   stripeCustomerId!,
    return_url: returnUrl,
  }

  // flow=payment_method → drop directly into the update payment method screen
  if (flow === 'payment_method') {
    params.flow_data = { type: 'payment_method_update' }
  }

  const portalSession = await stripe.billingPortal.sessions.create(params)

  return NextResponse.json({ url: portalSession.url })
}

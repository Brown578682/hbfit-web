import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })

export async function GET() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json(null, { status: 401 })

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    select: {
      status: true,
      stripeCustomerId: true,
      billingStartDate: true,
      memberships: {
        where: { status: { in: ['ACTIVE', 'PAST_DUE', 'TRIALING'] } },
        include: { plan: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!member) return NextResponse.json(null, { status: 404 })

  // Only show the banner for ACTIVE members (formerly MIGRATING) who came from migration
  // They need a card if: no stripeCustomerId, OR stripeCustomerId but no default payment method
  let needsPaymentMethod = false

  if (!member.stripeCustomerId) {
    // No Stripe presence at all — definitely needs a card
    needsPaymentMethod = true
  } else {
    // Has a Stripe customer — check if they have a default payment method
    try {
      const customer = await stripe.customers.retrieve(member.stripeCustomerId, {
        expand: ['default_source', 'invoice_settings.default_payment_method'],
      }) as Stripe.Customer

      const hasDefaultPM =
        customer.invoice_settings?.default_payment_method != null ||
        customer.default_source != null

      if (!hasDefaultPM) {
        // Also check if any payment methods are attached
        const paymentMethods = await stripe.paymentMethods.list({
          customer: member.stripeCustomerId,
          type: 'card',
          limit: 1,
        })
        needsPaymentMethod = paymentMethods.data.length === 0
      }
    } catch {
      // If Stripe lookup fails, be conservative — don't nag them
      needsPaymentMethod = false
    }
  }

  return NextResponse.json({
    needsPaymentMethod,
    needsPlan: member.status === 'LEAD',
    billingStartDate: member.billingStartDate?.toISOString() ?? null,
    plan: member.memberships[0]?.plan?.name ?? null,
  })
}

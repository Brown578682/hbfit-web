import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const member = await prisma.member.findUnique({
    where: { id },
    select: { stripeCustomerId: true }
  })

  if (!member?.stripeCustomerId) {
    return NextResponse.json([])
  }

  // Last 90 days
  const since = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)

  const charges = await stripe.charges.list({
    customer: member.stripeCustomerId,
    limit: 100,
    created: { gte: since },
  })

  const transactions = charges.data.map(ch => ({
    id: ch.id,
    date: ch.created,
    amount: ch.amount / 100,
    amountRefunded: ch.amount_refunded / 100,
    status: ch.status,
    description: ch.description ?? null,
    receiptUrl: ch.receipt_url ?? null,
  }))

  return NextResponse.json(transactions)
}

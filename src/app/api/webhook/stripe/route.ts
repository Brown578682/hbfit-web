import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { MEMBERSHIP_PLANS } from '@/lib/plans';
import { generateMemberCode } from '@/lib/memberCode';
import { sendWelcomeEmail, sendDropInWelcomeEmail } from '@/lib/email';
import { createSetPasswordToken } from '@/lib/tokens';

export const runtime = 'nodejs';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  }
  return _stripe;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Determine AccessLevel from plan slug */
function accessLevelForPlan(slug: string): 'FULL' | 'HH_AND_OG' | 'TRIBAL_ELDERS_ONLY' | 'OPEN_GYM_ONLY' {
  if (slug === 'homeschool-heroes') return 'HH_AND_OG';
  if (slug === 'tribal-elders')     return 'TRIBAL_ELDERS_ONLY';
  if (slug === 'open-gym')          return 'OPEN_GYM_ONLY';
  return 'FULL'; // base, gap, and anything unrecognised
}

/** Is this DOB a minor (under 18)? */
function isMinorDob(dob: Date | null): boolean {
  if (!dob) return false;
  const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return age < 18;
}

/** Upsert a User+Member pair and return the Member id. */
async function upsertMember(opts: {
  email?: string | null;        // optional — minors and portal-less members have none
  firstName: string;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  stripeCustomerId?: string | null;
  referredById?: string | null;
  householdId?: string | null;
  isHouseholdPrimary?: boolean;
  isMinor?: boolean;
  accessLevel?: 'FULL' | 'HH_AND_OG' | 'TRIBAL_ELDERS_ONLY' | 'OPEN_GYM_ONLY';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'LEAD' | 'VISITOR';
}): Promise<string> {
  const {
    email,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    address,
    city,
    state,
    zip,
    stripeCustomerId,
    referredById,
    householdId,
    isHouseholdPrimary = false,
    isMinor: isMinorFlag = false,
    accessLevel = 'FULL' as ('FULL' | 'HH_AND_OG' | 'TRIBAL_ELDERS_ONLY' | 'OPEN_GYM_ONLY'),
    status = 'ACTIVE',
  } = opts;

  // Check if member already exists by stripeCustomerId
  if (stripeCustomerId) {
    const existing = await prisma.member.findUnique({
      where: { stripeCustomerId },
      select: { id: true },
    });
    if (existing) return existing.id;
  }

  const memberCode = await generateMemberCode(dateOfBirth ?? null);

  // Create User only if email provided (adults with portal access)
  let userId: string | undefined;
  if (email) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: `${firstName} ${lastName}` },
      create: { email, name: `${firstName} ${lastName}`, role: 'MEMBER' },
    });
    userId = user.id;
  }

  const member = await prisma.member.create({
    data: {
      ...(userId ? { userId } : {}),
      firstName,
      lastName,
      phone:             phone       ?? null,
      dateOfBirth:       dateOfBirth ?? null,
      address:           address     ?? null,
      city:              city        ?? null,
      state:             state       ?? null,
      zip:               zip         ?? null,
      status,
      isMinor:           isMinorFlag || isMinorDob(dateOfBirth ?? null),
      accessLevel:       accessLevel as any,
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
      source:            'join-form',
      memberCode,
      referredById:      referredById ?? null,
      householdId:       householdId  ?? null,
      isHouseholdPrimary,
    },
  });

  return member.id;
}

/** Create the 4 journey check-in records for a new member. */
async function createJourneyCheckIns(memberId: string, startDate: Date) {
  const checkIns = [
    { type: 'DAY1'  as const, offsetDays: 0  },
    { type: 'DAY30' as const, offsetDays: 30 },
    { type: 'DAY60' as const, offsetDays: 60 },
    { type: 'DAY90' as const, offsetDays: 90 },
  ];

  await prisma.journeyCheckIn.createMany({
    data: checkIns.map(({ type, offsetDays }) => {
      const scheduledDate = new Date(startDate);
      scheduledDate.setDate(scheduledDate.getDate() + offsetDays);
      return { memberId, type, scheduledDate };
    }),
    skipDuplicates: true,
  });
}

// ── Webhook handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature') ?? '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    const rawBody = await req.arrayBuffer();
    event = getStripe().webhooks.constructEvent(Buffer.from(rawBody), sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook/stripe] signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // ── checkout.session.completed ──────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object as Stripe.Checkout.Session;

    // ── Drop-in / 10-pack credit top-up (one-time payment, no customer required) ──
    if (session.metadata?.type === 'drop-in' || session.metadata?.type === 'ten-pack') {
      const credits      = parseInt(session.metadata.credits ?? '1', 10);
      const memberEmail  = session.metadata.memberEmail || session.customer_email || '';
      const memberFirst  = session.metadata.memberFirstName || '';
      const memberLast   = session.metadata.memberLastName  || '';

      if (memberEmail) {
        // Find or create the user
        let user = await prisma.user.findUnique({ where: { email: memberEmail }, select: { id: true } });
        let isNewAccount = false;

        if (!user) {
          user = await prisma.user.create({
            data: { email: memberEmail, name: `${memberFirst} ${memberLast}`.trim() || memberEmail, role: 'MEMBER' },
            select: { id: true },
          });
          isNewAccount = true;
        }

        // Find or create the member record
        let member = await prisma.member.findUnique({ where: { userId: user.id }, select: { id: true } });

        if (!member) {
          // Generate member code
          const now = new Date();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const yy = String(now.getFullYear()).slice(-2);
          const rand = Math.floor(Math.random() * 900 + 100);
          const memberCode = `${mm}${yy}${rand}`;

          member = await prisma.member.create({
            data: {
              userId:      user.id,
              firstName:   memberFirst || memberEmail.split('@')[0],
              lastName:    memberLast  || '',
              status:      'ACTIVE',
              accessLevel: 'FULL',
              source:      'drop-in',
              memberCode,
              classCredits: credits,
            },
            select: { id: true },
          });
          isNewAccount = true;
        } else {
          // Existing member — just increment credits
          await prisma.member.update({
            where: { id: member.id },
            data: { classCredits: { increment: credits } },
          });
        }

        console.log(`[webhook] +${credits} class credits → member ${member.id} (${memberEmail})${isNewAccount ? ' [new account]' : ''}`);

        // Send set-password email for new accounts
        if (isNewAccount) {
          try {
            const appUrl = process.env.NEXTAUTH_URL ?? 'https://honorboundfit.com';
            const token = await createSetPasswordToken(memberEmail);
            const setPasswordUrl = `${appUrl}/set-password?token=${token}`;
            const displayName = memberFirst || memberEmail.split('@')[0];

            await sendDropInWelcomeEmail({
              to:             memberEmail,
              firstName:      displayName,
              credits,
              setPasswordUrl,
            });
          } catch (emailErr) {
            console.error('[webhook] drop-in welcome email failed:', emailErr);
          }
        }
      }
      return NextResponse.json({ received: true });
    }

    const customerId = (typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id) ?? null;

    if (!customerId) {
      console.error('[webhook/stripe] checkout.session.completed: no customer id');
      return NextResponse.json({ received: true });
    }

    const planSlug = session.metadata?.planSlug ?? '';
    const plan     = MEMBERSHIP_PLANS.find(p => p.slug === planSlug);

    // Fetch full customer to get metadata
    const customer = await getStripe().customers.retrieve(customerId) as Stripe.Customer;
    const meta     = customer.metadata ?? {};

    const firstName        = meta.firstName  ?? customer.name?.split(' ')[0] ?? '';
    const lastName         = meta.lastName   ?? customer.name?.split(' ').slice(1).join(' ') ?? '';
    const email            = meta.email      ?? customer.email ?? '';
    const phone            = meta.phone      || null;
    const dob              = meta.dob        || null;
    const address          = meta.address    || null;
    const city             = meta.city       || null;
    const state            = meta.state      || null;
    const zip              = meta.zip        || null;
    const referredById     = meta.referredById  || null;
    const householdRaw     = meta.householdMembers ?? '[]';

    const dateOfBirth = dob ? new Date(dob) : null;

    let householdMembersArr: Array<{ firstName: string; lastName: string; dob?: string }> = [];
    try {
      householdMembersArr = JSON.parse(householdRaw);
    } catch { /* ignore */ }

    if (!email) {
      console.error('[webhook/stripe] checkout.session.completed: no email on customer', customerId);
      return NextResponse.json({ received: true });
    }

    try {
      // Check if member already exists (e.g. from PENDING GAP application)
      const existing = await prisma.member.findUnique({
        where: { stripeCustomerId: customerId },
      });

      let memberId: string;

      if (existing) {
        // Activate existing PENDING member
        await prisma.member.update({
          where: { id: existing.id },
          data: { status: 'ACTIVE' },
        });
        memberId = existing.id;
      } else {
        // Create household first if needed so we can link primary member
        let householdId: string | null = null;
        if (householdMembersArr.length > 0) {
          const household = await prisma.household.create({
            data: {
              name:       `${lastName} Household`,
              monthlyCap: plan?.cap ?? 20000,
            },
          });
          householdId = household.id;
        }

        memberId = await upsertMember({
          email,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          address,
          city,
          state,
          zip,
          stripeCustomerId: customerId,
          referredById,
          householdId,
          isHouseholdPrimary: householdMembersArr.length > 0,
          accessLevel: accessLevelForPlan(planSlug) as any,
          status: 'ACTIVE',
        });

        // Create household members — no synthetic emails, no fake stripeCustomerIds
        for (const hm of householdMembersArr) {
          if (!hm.firstName || !hm.lastName) continue;
          const hmDob = hm.dob ? new Date(hm.dob) : null;
          const hmEmail = (hm as any).email?.trim() || null; // real email if provided
          const hmIsMinor = isMinorDob(hmDob);
          // HH students get HH_AND_OG access; adults on HH household also get HH_AND_OG;
          // adults on Base/GAP household get FULL
          const hmAccess = (planSlug === 'homeschool-heroes' || planSlug === 'hh-parent')
            ? 'HH_AND_OG'
            : accessLevelForPlan(planSlug);

          await upsertMember({
            email:       hmEmail,
            firstName:   hm.firstName.trim(),
            lastName:    hm.lastName.trim(),
            dateOfBirth: hmDob,
            householdId: (await prisma.member.findUnique({ where: { id: memberId }, select: { householdId: true } }))?.householdId ?? null,
            isMinor:     hmIsMinor,
            accessLevel: hmAccess as any,
            status:      'ACTIVE',
          });
        }
      }

      // ── Create/update Membership record ──────────────────────────────────
      if (plan) {
        // Look up the MembershipPlan record in DB by slug
        const dbPlan = await prisma.membershipPlan.findUnique({ where: { slug: plan.slug } });
        if (dbPlan) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;

          const existingMembership = subId
            ? await prisma.membership.findUnique({ where: { stripeSubscriptionId: subId } })
            : null;

          if (!existingMembership) {
            await prisma.membership.create({
              data: {
                memberId,
                planId:               dbPlan.id,
                status:               'ACTIVE',
                stripeSubscriptionId: subId ?? undefined,
                currentPeriodStart:   new Date(),
              },
            });
          }
        }
      }

      // ── Create Journey Check-Ins (only if not already created) ───────────
      const existingCheckIns = await prisma.journeyCheckIn.findFirst({ where: { memberId } });
      if (!existingCheckIns) {
        await createJourneyCheckIns(memberId, new Date());
      }

      // ── Send welcome email ────────────────────────────────────────────────
      if (email && plan) {
        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 28);
        const nextBillingDate = nextBilling.toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
        const standInTheGap = session.metadata?.standInTheGap === 'true';

        // Generate set-password token for this member
        const appUrl = process.env.NEXTAUTH_URL ?? 'https://honorboundfit.com';
        let setPasswordUrl = `${appUrl}/set-password`;
        try {
          const token = await createSetPasswordToken(email);
          setPasswordUrl = `${appUrl}/set-password?token=${token}`;
        } catch (tokenErr) {
          console.error('[webhook/stripe] set-password token generation failed:', tokenErr);
        }

        try {
          await sendWelcomeEmail({
            to: email,
            firstName,
            planName: plan.name,
            price: plan.price,
            nextBillingDate,
            isGap: plan.isGap,
            standInTheGap,
            setPasswordUrl,
          });
        } catch (emailErr) {
          // Non-fatal — log but don't fail the webhook
          console.error('[webhook/stripe] welcome email failed:', emailErr);
        }
      }
    } catch (err) {
      console.error('[webhook/stripe] checkout.session.completed error:', err);
      return NextResponse.json({ error: 'Internal error processing checkout' }, { status: 500 });
    }
  }

  // ── customer.subscription.updated ──────────────────────────────────────────
  else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const sub = subscription as any // field names vary by API version
    const customerId   = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null

    if (customerId) {
      try {
        const member = await prisma.member.findUnique({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        })

        if (member) {
          const statusMap: Record<string, string> = {
            active:   'ACTIVE',
            past_due: 'PAST_DUE',
            canceled: 'CANCELED',
            trialing: 'TRIALING',
            paused:   'PAUSED',
          }
          const newStatus = statusMap[subscription.status] ?? 'ACTIVE'

          await prisma.membership.updateMany({
            where: { memberId: member.id, stripeSubscriptionId: subscription.id },
            data: {
              status:             newStatus as any,
              cancelAtPeriodEnd:  subscription.cancel_at_period_end,
              currentPeriodStart: sub.current_period_start
                ? new Date(sub.current_period_start * 1000) : undefined,
              currentPeriodEnd:   sub.current_period_end
                ? new Date(sub.current_period_end   * 1000)
                : sub.cancel_at
                  ? new Date(sub.cancel_at * 1000) : undefined,
              canceledAt:         sub.canceled_at
                ? new Date(sub.canceled_at * 1000) : undefined,
            },
          })

          if (newStatus === 'CANCELED') {
            await prisma.member.update({
              where: { id: member.id },
              data: { status: 'INACTIVE' },
            })
          }
        }
      } catch (err) {
        console.error('[webhook/stripe] customer.subscription.updated error:', err)
        return NextResponse.json({ error: 'Internal error processing subscription update' }, { status: 500 })
      }
    }
  }

  // ── customer.subscription.deleted ──────────────────────────────────────────
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId   = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null;

    if (customerId) {
      try {
        const member = await prisma.member.findUnique({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });

        if (member) {
          // Update member status to INACTIVE
          await prisma.member.update({
            where: { id: member.id },
            data:  { status: 'INACTIVE' },
          });

          // Update membership status to CANCELED
          await prisma.membership.updateMany({
            where: { memberId: member.id, stripeSubscriptionId: subscription.id },
            data:  { status: 'CANCELED', canceledAt: new Date(), cancelAtPeriodEnd: false },
          });
        }
      } catch (err) {
        console.error('[webhook/stripe] customer.subscription.deleted error:', err);
        return NextResponse.json({ error: 'Internal error processing cancellation' }, { status: 500 });
      }
    }
  }

  // ── invoice.payment_failed ─────────────────────────────────────────────────
  else if (event.type === 'invoice.payment_failed') {
    // Cast to `any` because the Invoice type shape varies across Stripe API versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice      = event.data.object as any;
    const customerId   = typeof invoice.customer === 'string'
      ? (invoice.customer as string)
      : (invoice.customer as Stripe.Customer | null)?.id ?? null;
    const subId        = typeof invoice.subscription === 'string'
      ? (invoice.subscription as string)
      : (invoice.subscription as Stripe.Subscription | null)?.id ?? null;

    if (customerId) {
      try {
        const member = await prisma.member.findUnique({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });

        if (member && subId) {
          await prisma.membership.updateMany({
            where: { memberId: member.id, stripeSubscriptionId: subId },
            data:  { status: 'PAST_DUE' },
          });
        }
      } catch (err) {
        console.error('[webhook/stripe] invoice.payment_failed error:', err);
        return NextResponse.json({ error: 'Internal error processing payment failure' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

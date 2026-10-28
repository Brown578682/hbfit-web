/**
 * Admin script: 
 *   1. Approve Laura Fenton's GAP plan → charges her saved card via /api/admin/gap/[id]/approve
 *   2. Create Jillian Fenton as a subordinate member under Laura's household
 *   3. Send Jillian a welcome email with set-password link
 */

import { PrismaClient } from '@prisma/client';
import { createSetPasswordToken } from '../src/lib/tokens.js';
import { sendFamilyMemberSetupEmail } from '../src/lib/email.js';

const prisma = new PrismaClient();
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://honorboundfit.com';

async function main() {
  // ── 1. Find Laura ──────────────────────────────────────────────────────────
  const laura = await prisma.member.findFirst({
    where: { firstName: 'Laura', lastName: 'Fenton' },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!laura) throw new Error('Laura Fenton not found');
  console.log(`Found Laura: id=${laura.id} email=${laura.user?.email} stripeCustomerId=${laura.stripeCustomerId}`);

  // ── 2. Approve via API endpoint (handles Stripe + email) ───────────────────
  const approveRes = await fetch(`http://localhost:3000/api/admin/gap/${laura.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verifiedBy: 'MARKUS (Admin)' }),
  });
  const approveData = await approveRes.json();
  console.log('GAP approve result:', approveData);

  if (!approveRes.ok) throw new Error(`Approve failed: ${JSON.stringify(approveData)}`);

  // ── 3. Set Laura as household primary ─────────────────────────────────────
  let householdId = laura.householdId;
  if (!householdId) {
    const household = await prisma.household.create({
      data: { name: 'Fenton Family', monthlyCap: 20000 },
    });
    householdId = household.id;
    await prisma.member.update({
      where: { id: laura.id },
      data: { householdId, isHouseholdPrimary: true },
    });
    console.log(`Created household: ${householdId}`);
  } else {
    await prisma.member.update({
      where: { id: laura.id },
      data: { isHouseholdPrimary: true },
    });
    console.log(`Using existing household: ${householdId}`);
  }

  // ── 4. Create Jillian's User + Member ─────────────────────────────────────
  const jillianEmail = 'jillianrfenton@icloud.com';

  // Check if already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: jillianEmail, mode: 'insensitive' } },
  });
  if (existingUser) {
    console.log('Jillian already exists, skipping creation');
  } else {
    // Find the GAP family addon plan
    const addonPlan = await prisma.membershipPlan.findFirst({
      where: { slug: { contains: 'family' } },
    });
    console.log(`Add-on plan: ${addonPlan?.name} (${addonPlan?.id})`);

    const jillianUser = await prisma.user.create({
      data: { email: jillianEmail, name: 'Jillian Fenton' },
    });

    const jillianMember = await prisma.member.create({
      data: {
        userId: jillianUser.id,
        firstName: 'Jillian',
        lastName: 'Fenton',
        status: 'ACTIVE',
        householdId,
        isHouseholdPrimary: false,
        source: 'admin-add-on',
        gapEligible: false,
        ...(addonPlan ? {
          memberships: {
            create: {
              planId: addonPlan.id,
              status: 'ACTIVE',
            },
          },
        } : {}),
      },
    });

    console.log(`Created Jillian: id=${jillianMember.id}`);

    // ── 5. Send Jillian welcome email with set-password link ─────────────────
    const token = await createSetPasswordToken(jillianEmail);
    const setPasswordUrl = `${APP_URL}/set-password?token=${token}`;

    await sendFamilyMemberSetupEmail({
      to: jillianEmail,
      firstName: 'Jillian',
      primaryName: 'Laura Fenton',
      setPasswordUrl,
    });

    console.log(`Welcome email sent to ${jillianEmail}`);
    console.log(`Set-password URL: ${setPasswordUrl}`);
  }

  console.log('\n✅ All done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

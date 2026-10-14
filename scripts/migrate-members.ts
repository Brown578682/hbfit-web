import { PrismaClient, MemberStatus, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Resend } from 'resend'
import { createSetPasswordToken } from '../src/lib/tokens'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com')
    ? { rejectUnauthorized: false }
    : false,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

// Today = July 29, 2026. Both Julia and Laura paid today.
// Billing cycle = 28 days. Next charge = July 29 + 28 = Aug 26, 2026.
const BILLING_START = new Date('2026-08-26T00:00:00.000Z')
const LAST_BILLED   = new Date('2026-07-29T00:00:00.000Z')
const BASE_URL      = 'https://honorboundfit.com'

const members = [
  {
    firstName:    'Julia',
    lastName:     'Love-Parrish',
    email:        'parrish.j21@gmail.com',
    phone:        '(808) 330-1356',
    plan:         'Monthly recurring - Unlimited',
    gymDeskId:    '10591983',
    checkInCode:  '6132',
  },
  {
    firstName:    'Laura',
    lastName:     'Fenton',
    email:        'fenton544757@yahoo.com',
    phone:        '(412) 601-0988',
    plan:         'Family Plan',
    gymDeskId:    '10060877',
    checkInCode:  '0526',
  },
]

async function run() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const results: { name: string; email: string; inviteUrl: string; emailId?: string; error?: string }[] = []

  for (const m of members) {
    console.log(`\nProcessing: ${m.firstName} ${m.lastName} (${m.email})`)

    // 1. Check if user already exists (email case-insensitive)
    let user = await prisma.user.findFirst({
      where: { email: { equals: m.email, mode: 'insensitive' } },
    })

    if (!user) {
      // Create user account (no password — they'll set it via invite)
      user = await prisma.user.create({
        data: {
          email: m.email.toLowerCase(),
          name:  `${m.firstName} ${m.lastName}`,
          role:  Role.MEMBER,
        },
      })
      console.log(`  Created user: ${user.id}`)
    } else {
      console.log(`  Found existing user: ${user.id}`)
    }

    // 2. Check/create Member record
    let member = await prisma.member.findUnique({ where: { userId: user.id } })

    if (!member) {
      member = await prisma.member.create({
        data: {
          userId:           user.id,
          firstName:        m.firstName,
          lastName:         m.lastName,
          phone:            m.phone,
          email2:           null,
          gymDeskId:        m.gymDeskId,
          checkInCode:      m.checkInCode,
          source:           'GymDesk Migration',
          status:           MemberStatus.MIGRATING,
          billingStartDate: BILLING_START,
          gymDeskLastBilled: LAST_BILLED,
        },
      })
      console.log(`  Created member: ${member.id}`)
    } else {
      // Update existing member to MIGRATING status
      member = await prisma.member.update({
        where: { id: member.id },
        data: {
          status:            MemberStatus.MIGRATING,
          billingStartDate:  BILLING_START,
          gymDeskLastBilled: LAST_BILLED,
          gymDeskId:         m.gymDeskId,
        },
      })
      console.log(`  Updated member to MIGRATING: ${member.id}`)
    }

    // 3. Generate a secure invite token via the canonical tokens.ts function
    const token   = await createSetPasswordToken(user.email)

    const inviteUrl = `${BASE_URL}/set-password?token=${token}&migrating=1`
    console.log(`  Invite URL: ${inviteUrl}`)

    // 4. Send transition email
    const billingDateStr = 'August 26, 2026'
    const firstName = m.firstName

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');
  body { margin:0; padding:0; background:#000; font-family: 'Montserrat', Arial, sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#000; }
  .header { background:#000; padding:32px 40px 24px; text-align:center; }
  .mark { font-family:'Montserrat',Arial,sans-serif; font-size:32px; font-weight:900; letter-spacing:0.05em; line-height:1; }
  .body { padding:0 40px 40px; color:#fff; }
  h1 { font-size:24px; font-weight:700; margin:0 0 16px; }
  p { font-size:15px; line-height:1.7; color:#ccc; margin:0 0 16px; }
  .highlight { color:#fff; font-weight:600; }
  .notice { background:#111; border-left:3px solid #e53e3e; padding:16px 20px; margin:24px 0; border-radius:4px; }
  .notice p { color:#fff; margin:0; font-size:14px; }
  .btn { display:inline-block; background:#e53e3e; color:#fff !important; text-decoration:none; padding:14px 32px; border-radius:6px; font-weight:700; font-size:16px; margin:8px 0; }
  .footer { padding:24px 40px; text-align:center; color:#555; font-size:12px; }
  .footer a { color:#555; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="mark">
      <span style="color:#3b82f6;">HB</span><span style="color:#e53e3e;">F</span><span style="color:#ffffff;">I</span><span style="color:#e53e3e;">T</span>
    </div>
  </div>
  <div class="body">
    <h1>Your Honor Bound FIT portal is ready, ${firstName}.</h1>
    <p>We're moving to a new member platform — and we've made it seamless for you.</p>
    <div class="notice">
      <p>Your current membership continues through <span class="highlight">${billingDateStr}</span>. We'll start billing your new account on <span class="highlight">${billingDateStr}</span> — no interruption, no double billing.</p>
    </div>
    <p>Click below to set up your account. It takes less than 2 minutes: create your password, add your payment method, and you're in.</p>
    <p style="text-align:center; margin:32px 0;">
      <a href="${inviteUrl}" class="btn">Set Up My Account →</a>
    </p>
    <p>Once you're in, you'll have full access to:</p>
    <ul style="color:#ccc; font-size:15px; line-height:2; padding-left:20px;">
      <li>Class schedule & booking</li>
      <li>Check-in history</li>
      <li>Progress tracking & goals</li>
      <li>Direct messaging with your coach</li>
    </ul>
    <p style="margin-top:32px;">Questions? Reply to this email or reach out at the gym.</p>
    <p>— Rich Brown<br><span style="color:#666; font-size:13px;">Honor Bound FIT</span></p>
  </div>
  <div class="footer">
    <p>Honor Bound FIT · Fredericksburg, VA<br>
    <a href="${BASE_URL}/unsubscribe">Unsubscribe</a></p>
  </div>
</div>
</body>
</html>`

    try {
      // Send to member
      const { data: memberSend, error: memberErr } = await resend.emails.send({
        from:    'Rich Brown <noreply@honorboundfit.com>',
        to:      m.email,
        bcc:     'Brown57@gmail.com',
        subject: 'Your Honor Bound FIT portal is ready — set up your account',
        html,
      })
      if (memberErr) throw new Error(JSON.stringify(memberErr))
      console.log(`  Email sent: ${memberSend?.id}`)
      results.push({ name: `${m.firstName} ${m.lastName}`, email: m.email, inviteUrl, emailId: memberSend?.id })
    } catch (err: any) {
      console.error(`  Email error: ${err.message}`)
      results.push({ name: `${m.firstName} ${m.lastName}`, email: m.email, inviteUrl, error: err.message })
    }
  }

  console.log('\n=== RESULTS ===')
  for (const r of results) {
    console.log(`${r.name} (${r.email}): ${r.emailId ? `✅ Email ID ${r.emailId}` : `❌ ${r.error}`}`)
    console.log(`  Invite: ${r.inviteUrl}`)
  }

  await prisma.$disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })

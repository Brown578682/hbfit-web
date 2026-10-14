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

const BASE_URL = 'https://honorboundfit.com'
const TODAY    = new Date('2026-07-29T00:00:00.000Z')

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + n)
  return r
}

function billingEnd(lastPayment: string | null): Date {
  if (!lastPayment) return TODAY
  const d = new Date(lastPayment)
  const end = addDays(d, 28)
  return end > TODAY ? end : TODAY
}

// ── STEP 1: Fix Julia Love-Parrish to Open Gym ──────────────────────────────
async function fixJulia() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'parrish.j21@gmail.com', mode: 'insensitive' } },
    include: { member: true },
  })
  if (!user?.member) {
    console.log('⚠️  Julia not found')
    return
  }
  // Store plan name in notes field (no dedicated plan field on Member model)
  await prisma.member.update({
    where: { id: user.member.id },
    data: { notes: 'Plan: Open Gym' },
  })
  console.log('✅ Julia Love-Parrish → Open Gym')
}

// ── STEP 2: Batch remaining members ─────────────────────────────────────────
// Skip: Julia/Laura (done), complimentary coaches (Randy, Heather, Alyse, Erika),
//       Ginger Wible (comp), Richard Lim (trial only), Joshua Parrish (shares Julia's email).
// Deduplicate shared emails (Bourdow family, Quinn family).
const members = [
  // Individual unlimited
  { firstName: 'Cookie',    lastName: 'Ainsworth',    email: 'cookielyn38@gmail.com',         plan: 'Unlimited',    gymDeskId: '11710230', checkInCode: '4244', lastPayment: '2026-07-21', phone: '(850) 687-7930' },
  { firstName: 'Stacy',     lastName: 'Harms',        email: 'harmsstacy@yahoo.com',           plan: 'Unlimited',    gymDeskId: '10797341', checkInCode: '6389', lastPayment: '2026-07-20', phone: '823-102-1020' },
  { firstName: 'Melissa',   lastName: 'Hess',         email: 'hessassinating007@yahoo.com',    plan: 'Unlimited',    gymDeskId: '10279804', checkInCode: '6236', lastPayment: '2026-06-27', phone: '(570) 567-4385' },
  { firstName: 'Isaac',     lastName: 'Russell',      email: 'isaacrussell055@gmail.com',      plan: 'Unlimited',    gymDeskId: '8857463',  checkInCode: '8289', lastPayment: '2026-07-06', phone: '(571) 299-0088' },
  { firstName: 'Linda',     lastName: 'Everetts',     email: 'lmeveretts@comcast.net',         plan: 'Unlimited',    gymDeskId: '7172970',  checkInCode: '1280', lastPayment: '2026-06-29', phone: '540-226-1280' },
  { firstName: 'Dan',       lastName: 'Nichols',      email: 'nicholsdan84@gmail.com',         plan: 'Unlimited',    gymDeskId: '7166551',  checkInCode: '1725', lastPayment: '2026-07-07', phone: '(540) 207-3505' },
  { firstName: 'Geoffrey',  lastName: 'Wood',         email: 'geoffrey.w.wood1@gmail.com',     plan: 'Unlimited',    gymDeskId: '7025835',  checkInCode: '6512', lastPayment: '2026-06-30', phone: '(360) 204-4919' },
  { firstName: 'Mark',      lastName: 'Millich',      email: 'mark_millich@yahoo.com',         plan: 'Unlimited',    gymDeskId: '7013702',  checkInCode: '3820', lastPayment: '2026-07-15', phone: '(703) 498-8172' },
  { firstName: 'Betsy',     lastName: 'Seals',        email: 'betsy222@icloud.com',            plan: 'Unlimited',    gymDeskId: '7010554',  checkInCode: '1215', lastPayment: '2026-07-09', phone: '(540) 226-2517' },
  { firstName: 'Michelle',  lastName: 'King',         email: 'gekkoz5@cox.net',                plan: 'Unlimited',    gymDeskId: '7005004',  checkInCode: '6838', lastPayment: '2026-07-13', phone: '(540) 226-7763' },
  { firstName: 'Steve',     lastName: 'Bourdow',      email: 'morganltracy01@gmail.com',       plan: 'Unlimited',    gymDeskId: '9735046',  checkInCode: '2888', lastPayment: '2026-06-25', phone: null },
  // Open Gym / other individual
  { firstName: 'Carol',     lastName: 'Pugh',         email: 'tcepugh2@gmail.com',             plan: 'Open Gym',     gymDeskId: '11007694', checkInCode: '6588', lastPayment: '2026-07-06', phone: '(540) 207-8727' },
  { firstName: 'Troy',      lastName: 'Pugh',         email: 'pughtm@gmail.com',               plan: 'Open Gym',     gymDeskId: '11008085', checkInCode: '9538', lastPayment: null,         phone: '(540) 840-1242' },
  { firstName: 'Kimberly',  lastName: 'Taylor Judy',  email: 'kimberlydefenseceo@gmail.com',   plan: 'Open Gym',     gymDeskId: '10684758', checkInCode: '9423', lastPayment: '2026-05-15', phone: '(540) 296-4437' },
  { firstName: 'Bonnie',    lastName: 'Hall',         email: 'hallbjm@gmail.com',              plan: 'Open Gym',     gymDeskId: '7560864',  checkInCode: '6232', lastPayment: '2026-05-17', phone: '(540) 220-9253' },
  // Class pack
  { firstName: 'Garrett',   lastName: 'Wilamowski',   email: 'wilamowskigg@yahoo.com',         plan: '10-Class Pack', gymDeskId: '7014147', checkInCode: '1500', lastPayment: '2026-03-12', phone: '(703) 725-9368' },
  // Family plans — one email per household
  { firstName: 'Eric',      lastName: 'Quinn',        email: 'quinnee329@cox.net',             plan: 'Family Plan',  gymDeskId: '7025573',  checkInCode: '4636', lastPayment: '2026-07-09', phone: '(540) 845-2196' },
  { firstName: 'Callie',    lastName: 'Quinn',        email: 'quinncalliem@gmail.com',         plan: 'Family Plan',  gymDeskId: '7025806',  checkInCode: '7863', lastPayment: null,         phone: null },
  { firstName: 'Christian', lastName: 'Omundson',     email: 'comundson81@yahoo.com',          plan: 'Family Plan',  gymDeskId: '7051643',  checkInCode: '1705', lastPayment: null,         phone: '(703) 881-1726' },
  { firstName: 'Myah',      lastName: 'Omundson',     email: 'myahgrace2@yahoo.com',           plan: 'Family Plan',  gymDeskId: '7030593',  checkInCode: '2244', lastPayment: '2026-07-08', phone: '(571) 926-7650' },
  { firstName: 'Keith',     lastName: 'Linde',        email: 'keith.linde0529@gmail.com',      plan: 'Family Plan',  gymDeskId: '6991003',  checkInCode: '1300', lastPayment: '2026-07-17', phone: '(262) 408-1990' },
  { firstName: 'Javier',    lastName: 'Palomo',       email: 'javi.palomo@icloud.com',         plan: 'Family Plan',  gymDeskId: '9974328',  checkInCode: '3129', lastPayment: '2026-01-31', phone: '(540) 681-3129' },
  { firstName: 'Edward',    lastName: 'Palomo',       email: 'edward.palomo@icloud.com',       plan: 'Family Plan',  gymDeskId: '9974311',  checkInCode: '3016', lastPayment: '2026-06-22', phone: '(540) 681-3016' },
  // Morgan Bourdow shares email with Steve — skipped (one email per household)
]

function buildEmailHtml(firstName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');
  body { margin:0; padding:0; background:#000; font-family:'Montserrat',Arial,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#000; }
  .header { background:#000; padding:32px 40px 24px; text-align:center; }
  .mark { font-family:'Montserrat',Arial,sans-serif; font-size:32px; font-weight:900; letter-spacing:0.05em; line-height:1; }
  .body { padding:0 40px 40px; color:#fff; }
  h1 { font-size:24px; font-weight:700; margin:0 0 16px; }
  p { font-size:15px; line-height:1.7; color:#ccc; margin:0 0 16px; }
  .highlight { color:#fff; font-weight:600; }
  .notice { background:#111; border-left:3px solid #3b82f6; padding:16px 20px; margin:24px 0; border-radius:4px; }
  .notice p { color:#fff; margin:0; font-size:14px; }
  .btn { display:inline-block; background:#e53e3e; color:#fff !important; text-decoration:none; padding:14px 32px; border-radius:6px; font-weight:700; font-size:16px; margin:8px 0; }
  ul { color:#ccc; font-size:15px; line-height:2; padding-left:20px; }
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
    <p>We're moving to a new member platform and your account is already set up and waiting for you.</p>
    <div class="notice">
      <p><span class="highlight">No interruption. No double billing.</span> Your current membership continues exactly as-is. When you set up your new account, we'll confirm your billing date — you won't be charged until your current cycle ends.</p>
    </div>
    <p>Click below to set your password and get in. Takes less than 2 minutes.</p>
    <p style="text-align:center; margin:32px 0;">
      <a href="${inviteUrl}" class="btn">Set Up My Account →</a>
    </p>
    <p>Once you're in, you'll have full access to:</p>
    <ul>
      <li>Class schedule &amp; booking</li>
      <li>Check-in history</li>
      <li>Progress tracking &amp; goals</li>
      <li>Direct messaging with your coach</li>
    </ul>
    <p style="margin-top:32px;">Questions? Reply to this email or find us at the gym.</p>
    <p>— Rich Brown<br><span style="color:#666;font-size:13px;">Honor Bound FIT</span></p>
  </div>
  <div class="footer">
    <p>Honor Bound FIT · Fredericksburg, VA<br>
    <a href="${BASE_URL}/unsubscribe">Unsubscribe</a></p>
  </div>
</div>
</body>
</html>`
}

async function run() {
  // Step 1: Fix Julia
  await fixJulia()

  const resend = new Resend(process.env.RESEND_API_KEY)
  const results: { name: string; email: string; billingStart: string; emailId?: string; error?: string }[] = []

  for (const m of members) {
    const bStart = billingEnd(m.lastPayment)
    const bStartStr = bStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    console.log(`\nProcessing: ${m.firstName} ${m.lastName} (${m.email}) → billing start ${bStartStr}`)

    // Upsert user
    let user = await prisma.user.findFirst({
      where: { email: { equals: m.email, mode: 'insensitive' } },
    })
    if (!user) {
      user = await prisma.user.create({
        data: { email: m.email.toLowerCase(), name: `${m.firstName} ${m.lastName}`, role: Role.MEMBER },
      })
      console.log(`  Created user: ${user.id}`)
    } else {
      console.log(`  Found existing user: ${user.id}`)
    }

    // Upsert member
    let member = await prisma.member.findUnique({ where: { userId: user.id } })
    if (!member) {
      member = await prisma.member.create({
        data: {
          userId: user.id, firstName: m.firstName, lastName: m.lastName,
          phone: m.phone ?? undefined, gymDeskId: m.gymDeskId, checkInCode: m.checkInCode,
          source: 'GymDesk Migration', notes: `Plan: ${m.plan}`,
          status: MemberStatus.MIGRATING, billingStartDate: bStart, gymDeskLastBilled: m.lastPayment ? new Date(m.lastPayment) : undefined,
        },
      })
      console.log(`  Created member: ${member.id}`)
    } else {
      await prisma.member.update({
        where: { id: member.id },
        data: { status: MemberStatus.MIGRATING, billingStartDate: bStart, gymDeskLastBilled: m.lastPayment ? new Date(m.lastPayment) : undefined, notes: `Plan: ${m.plan}` },
      })
      console.log(`  Updated member to MIGRATING`)
    }

    // Invite token — use createSetPasswordToken so prefix is always correct
    const token = await createSetPasswordToken(user.email)

    const inviteUrl = `${BASE_URL}/set-password?token=${token}&migrating=1`

    // Send email
    try {
      const { data, error } = await resend.emails.send({
        from:    'Rich Brown <noreply@honorboundfit.com>',
        to:      m.email,
        bcc:     'Brown57@gmail.com',
        subject: 'Your Honor Bound FIT portal is ready — set up your account',
        html:    buildEmailHtml(m.firstName, inviteUrl),
      })
      if (error) throw new Error(JSON.stringify(error))
      console.log(`  ✅ Email sent: ${data?.id}`)
      results.push({ name: `${m.firstName} ${m.lastName}`, email: m.email, billingStart: bStartStr, emailId: data?.id })
    } catch (err: any) {
      console.error(`  ❌ Email error: ${err.message}`)
      results.push({ name: `${m.firstName} ${m.lastName}`, email: m.email, billingStart: bStartStr, error: err.message })
    }
  }

  console.log('\n════════════════════════════════════')
  console.log('FINAL RESULTS')
  console.log('════════════════════════════════════')
  const ok  = results.filter(r => r.emailId)
  const err = results.filter(r => r.error)
  console.log(`\n✅ Sent: ${ok.length}`)
  ok.forEach(r => console.log(`  ${r.name} <${r.email}> — billing ${r.billingStart} — ID ${r.emailId}`))
  if (err.length) {
    console.log(`\n❌ Failed: ${err.length}`)
    err.forEach(r => console.log(`  ${r.name} <${r.email}> — ${r.error}`))
  }

  await pool.end()
}

run().catch(e => { console.error(e); process.exit(1) })

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'
import { createSetPasswordToken } from '../src/lib/tokens'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
const BASE_URL = 'https://honorboundfit.com'

// All members who received the original broken invite — Dan Nichols already reissued manually
const members = [
  { firstName: 'Julia',     lastName: 'Love-Parrish',  email: 'parrish.j21@gmail.com' },
  { firstName: 'Laura',     lastName: 'Fenton',         email: 'fenton544757@yahoo.com' },
  { firstName: 'Cookie',    lastName: 'Ainsworth',      email: 'cookielyn38@gmail.com' },
  { firstName: 'Stacy',     lastName: 'Harms',          email: 'harmsstacy@yahoo.com' },
  { firstName: 'Melissa',   lastName: 'Hess',           email: 'hessassinating007@yahoo.com' },
  { firstName: 'Isaac',     lastName: 'Russell',        email: 'isaacrussell055@gmail.com' },
  { firstName: 'Linda',     lastName: 'Everetts',       email: 'lmeveretts@comcast.net' },
  { firstName: 'Geoffrey',  lastName: 'Wood',           email: 'geoffrey.w.wood1@gmail.com' },
  { firstName: 'Mark',      lastName: 'Millich',        email: 'mark_millich@yahoo.com' },
  { firstName: 'Betsy',     lastName: 'Seals',          email: 'betsy222@icloud.com' },
  { firstName: 'Michelle',  lastName: 'King',           email: 'gekkoz5@cox.net' },
  { firstName: 'Steve',     lastName: 'Bourdow',        email: 'morganltracy01@gmail.com' },
  { firstName: 'Carol',     lastName: 'Pugh',           email: 'tcepugh2@gmail.com' },
  { firstName: 'Troy',      lastName: 'Pugh',           email: 'pughtm@gmail.com' },
  { firstName: 'Kimberly',  lastName: 'Taylor Judy',    email: 'kimberlydefenseceo@gmail.com' },
  { firstName: 'Bonnie',    lastName: 'Hall',           email: 'hallbjm@gmail.com' },
  { firstName: 'Garrett',   lastName: 'Wilamowski',     email: 'wilamowskigg@yahoo.com' },
  { firstName: 'Eric',      lastName: 'Quinn',          email: 'quinnee329@cox.net' },
  { firstName: 'Callie',    lastName: 'Quinn',          email: 'quinncalliem@gmail.com' },
  { firstName: 'Christian', lastName: 'Omundson',       email: 'comundson81@yahoo.com' },
  { firstName: 'Myah',      lastName: 'Omundson',       email: 'myahgrace2@yahoo.com' },
  { firstName: 'Keith',     lastName: 'Linde',          email: 'keith.linde0529@gmail.com' },
  { firstName: 'Javier',    lastName: 'Palomo',         email: 'javi.palomo@icloud.com' },
  { firstName: 'Edward',    lastName: 'Palomo',         email: 'edward.palomo@icloud.com' },
]

function buildHtml(firstName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; padding:0; background:#000; font-family:'Montserrat',Arial,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#000; }
  .header { padding:32px 40px 24px; text-align:center; }
  .mark { font-size:32px; font-weight:900; letter-spacing:0.05em; line-height:1; }
  .body { padding:0 40px 40px; color:#fff; }
  h1 { font-size:22px; font-weight:700; margin:0 0 12px; }
  p { font-size:15px; line-height:1.7; color:#ccc; margin:0 0 14px; }
  .notice { background:#111; border-left:3px solid #3b82f6; padding:14px 18px; margin:20px 0; border-radius:4px; }
  .notice p { color:#fff; margin:0; font-size:14px; }
  .btn { display:inline-block; background:#e53e3e; color:#fff !important; text-decoration:none; padding:14px 32px; border-radius:6px; font-weight:700; font-size:15px; }
  .footer { padding:20px 40px; text-align:center; color:#555; font-size:12px; }
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
    <h1>Hey ${firstName} — your updated setup link is here.</h1>
    <div class="notice">
      <p>We had a technical issue with the original invite link we sent. This one is fixed and ready to go. Sorry for the inconvenience.</p>
    </div>
    <p>Click below to set your password and access your Honor Bound FIT portal. Takes less than 2 minutes.</p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${inviteUrl}" class="btn">Set Up My Account →</a>
    </p>
    <p style="margin-top:28px;">Questions? Find us at the gym or reply to this email.</p>
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
  const resend = new Resend(process.env.RESEND_API_KEY)
  const ok: string[] = []
  const fail: string[] = []

  for (const m of members) {
    try {
      const token     = await createSetPasswordToken(m.email.toLowerCase())
      const inviteUrl = `${BASE_URL}/set-password?token=${token}&migrating=1`

      const { data, error } = await resend.emails.send({
        from:    'Rich Brown <noreply@honorboundfit.com>',
        to:      m.email,
        bcc:     'Brown57@gmail.com',
        subject: 'Your Honor Bound FIT setup link (updated)',
        html:    buildHtml(m.firstName, inviteUrl),
      })

      if (error) throw new Error(JSON.stringify(error))
      console.log(`✅ ${m.firstName} ${m.lastName} <${m.email}> — ${data?.id}`)
      ok.push(m.email)
    } catch (e: any) {
      console.error(`❌ ${m.firstName} ${m.lastName} <${m.email}> — ${e.message}`)
      fail.push(m.email)
    }
  }

  console.log(`\n════════════════════════════`)
  console.log(`Sent:   ${ok.length} / ${members.length}`)
  if (fail.length) console.log(`Failed: ${fail.join(', ')}`)

  await pool.end()
}

run().catch(e => { console.error(e); process.exit(1) })

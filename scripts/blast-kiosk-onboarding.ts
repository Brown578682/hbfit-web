/**
 * One-shot blast: send kiosk onboarding email to all active members with emails.
 * Run: npx tsx scripts/blast-kiosk-onboarding.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Resend } from 'resend';

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const resend = new Resend(process.env.RESEND_API_KEY!);

function buildEmail(firstName: string, memberCode: string, hasPin: boolean): string {
  const pinSection = hasPin
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1a0a;border:1px solid #166534;margin-bottom:28px;">
        <tr><td style="padding:20px 28px;">
          <p style="color:#4ade80;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">You're All Set</p>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0;">
            You already have a PIN set up. Just bring your Member Code to the kiosk and enter your PIN when prompted.
            If you've forgotten it, reset it anytime in your member portal under <strong style="color:#ffffff;">Settings &rarr; PIN</strong>.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="background:#ffffff;padding:12px 28px;">
              <a href="https://honorboundfit.com/dashboard/settings"
                 style="color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                Manage PIN &rarr;
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;border:1px solid #92400e;margin-bottom:28px;">
        <tr><td style="padding:20px 28px;">
          <p style="color:#fb923c;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">Action Required</p>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0 0 16px 0;">
            You haven't set up your kiosk PIN yet. It only takes 30 seconds &mdash; log in to your member portal and go to
            <strong style="color:#ffffff;">Settings &rarr; PIN</strong>.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#ffffff;padding:12px 28px;">
              <a href="https://honorboundfit.com/dashboard/settings"
                 style="color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                Create Your PIN &rarr;
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your HBFIT Kiosk Check-In Code</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Hero card -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Kiosk Check-In
            </p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 16px 0;letter-spacing:1px;line-height:1.1;">
              Check In Faster,<br/>${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              We have a self-service kiosk at the gym &mdash; no waiting, no front desk, just tap in and get to work.
              Here&rsquo;s everything you need to use it.
            </p>

            <!-- Member Code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;border:1px solid #333333;margin-bottom:28px;">
              <tr><td style="padding:28px;">
                <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px 0;">Your Member Code</p>
                <p style="color:#ffffff;font-size:52px;font-weight:900;font-family:'Courier New',Courier,monospace;letter-spacing:14px;margin:0 0 8px 0;">${memberCode}</p>
                <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">Enter this 4-digit code at the kiosk to identify yourself.</p>
              </td></tr>
            </table>

            <!-- PIN status -->
            ${pinSection}

            <!-- Steps -->
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">How the Kiosk Works</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:0 0 16px 0;vertical-align:top;width:24px;"><span style="color:#ffffff;font-size:14px;">&#8594;</span></td>
                <td style="padding:0 0 16px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Step 1 &mdash; Enter your code</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">
                    Tap your 4-digit Member Code &mdash;
                    <strong style="color:#ffffff;font-family:'Courier New',Courier,monospace;">${memberCode}</strong>
                    &mdash; on the numpad at the kiosk.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 16px 0;vertical-align:top;width:24px;"><span style="color:#ffffff;font-size:14px;">&#8594;</span></td>
                <td style="padding:0 0 16px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Step 2 &mdash; Enter your PIN</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">
                    Enter your 4-digit PIN. This keeps your check-in secure &mdash; only you can check yourself in.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 16px 0;vertical-align:top;width:24px;"><span style="color:#ffffff;font-size:14px;">&#8594;</span></td>
                <td style="padding:0 0 16px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Step 3 &mdash; Choose what you need</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">
                    Check In to log your visit, shop front desk items (apparel, gear, beverages), or send a message to a coach &mdash; all from the same screen.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:0;vertical-align:top;width:24px;"><span style="color:#ffffff;font-size:14px;">&#8594;</span></td>
                <td style="padding:0 0 0 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Step 4 &mdash; Done</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">
                    That&rsquo;s it. The kiosk logs your visit automatically and returns to the home screen.
                  </p>
                </td>
              </tr>
            </table>

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
              Questions? Reply to this email or reach us at
              <a href="mailto:rich@honorboundfit.com" style="color:#ffffff;">rich@honorboundfit.com</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT &middot; 45 Centreport Pkwy Suite 137 &middot; Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://honorboundfit.com/dashboard" style="color:rgba(255,255,255,0.3);text-decoration:none;">Member Portal</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function main() {
  const members = await prisma.member.findMany({
    where: {
      status: 'ACTIVE',
      memberCode: { not: null },
      user: { email: { not: null } },
    },
    select: {
      id: true,
      firstName: true,
      memberCode: true,
      memberPinHash: true,
      user: { select: { email: true } },
    },
    orderBy: { lastName: 'asc' },
  });

  console.log(`Sending to ${members.length} members...\n`);
  let sent = 0, failed = 0;

  for (const m of members) {
    const email = m.user?.email;
    if (!email || !m.memberCode) continue;

    await new Promise(r => setTimeout(r, 250)); // ~4/sec, Resend allows 10/sec

    try {
      await resend.emails.send({
        from: 'Honor Bound FIT <noreply@honorboundfit.com>',
        to: email,
        subject: `Your HBFIT kiosk code: ${m.memberCode}`,
        html: buildEmail(m.firstName, m.memberCode, !!m.memberPinHash),
      });
      console.log(`  ✓  ${m.firstName.padEnd(14)} ${m.memberCode}  ${email}  ${m.memberPinHash ? '(PIN set)' : '(NO PIN)'}`);
      sent++;
    } catch (err: any) {
      console.error(`  ✗  ${m.firstName} ${email}: ${err?.message ?? err}`);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent}  Failed: ${failed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

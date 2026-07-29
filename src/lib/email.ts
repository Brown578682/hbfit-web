import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// ── Email Templates ───────────────────────────────────────────────────────────

function welcomeEmailHtml(opts: {
  firstName: string;
  planName: string;
  price: number;
  nextBillingDate: string;
  isGap: boolean;
  standInTheGap: boolean;
  setPasswordUrl: string;
}): string {
  const { firstName, planName, price, nextBillingDate, isGap, standInTheGap, setPasswordUrl } = opts;
  const priceDisplay = `$${(price / 100).toFixed(0)}/4 wks`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Honor Bound FIT</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo / Header -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <img src="https://honorboundfit.com/images/Honor-Bound-FIT-logo-med.png"
                 alt="Honor Bound FIT" width="180" style="display:block;"/>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Welcome to the Tribe
            </p>
            <h1 style="color:#ffffff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;letter-spacing:1px;line-height:1.1;">
              Honor Bound,<br/>${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              Your membership is active. You're part of something built on discipline, service, and hard work.
              ${isGap ? 'Thank you for your service. Your GAP application is under review — billing will begin once verified, typically within 24 hours.' : 'Your first billing cycle starts today.'}
            </p>

            <!-- Plan box -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#000000;border:1px solid #333333;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">Your Plan</p>
                  <p style="color:#ffffff;font-size:20px;font-weight:800;text-transform:uppercase;margin:0 0 4px 0;">${planName}</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;">${priceDisplay}</p>
                </td>
                <td style="padding:24px 28px;text-align:right;vertical-align:middle;">
                  ${!isGap ? `
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">Next Billing</p>
                  <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0;">${nextBillingDate}</p>
                  ` : `
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">Status</p>
                  <p style="color:#ffffff;font-size:14px;font-weight:700;margin:0;">Pending Verification</p>
                  `}
                </td>
              </tr>
            </table>

            ${standInTheGap ? `
            <!-- SITG callout -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#1a1a00;border:1px solid #444400;margin-bottom:32px;">
              <tr>
                <td style="padding:20px 28px;">
                  <p style="color:#cccc00;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">Stand in the GAP</p>
                  <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0;">
                    You've chosen to Stand in the GAP — adding $25/4 wks to sponsor a fellow community member's discounted membership.
                    That's what this tribe is about. Thank you.
                  </p>
                </td>
              </tr>
            </table>
            ` : ''}

            <!-- Primary CTA: Create Password -->
            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0 0 20px 0;">
              One last step — create a password to access your member portal:
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#ffffff;padding:16px 32px;">
                  <a href="${setPasswordUrl}"
                     style="color:#000000;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                    Create Your Password →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 32px 0;">
              This link expires in 24 hours. If you need a new one, email rich@honorboundfit.com.
            </p>
          </td>
        </tr>

        <!-- What's next -->
        <tr>
          <td style="background:#0a0a0a;border:1px solid #222222;border-top:0;padding:32px 40px;">
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">
              What's Next
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['Show up', 'Classes are at 45 Centreport Parkway, Suite 137, Fredericksburg, VA. Come ready to work.'],
                ['Member portal', 'Track your progress, book classes, and manage your membership at honorboundfit.com/dashboard.'],
                ['Questions?', 'Reply to this email or reach us at rich@honorboundfit.com anytime.'],
              ].map(([title, body]) => `
              <tr>
                <td style="padding:0 0 20px 0;vertical-align:top;width:20px;">
                  <span style="color:#ffffff;font-size:14px;">✓</span>
                </td>
                <td style="padding:0 0 20px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">${title}</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">${body}</p>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
              &nbsp;·&nbsp;
              <a href="https://honorboundfit.com/dashboard" style="color:rgba(255,255,255,0.3);text-decoration:none;">Manage Membership</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function gapPendingEmailHtml(opts: { firstName: string; planName: string }): string {
  const { firstName } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>GAP Application Received</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <img src="https://honorboundfit.com/images/Honor-Bound-FIT-logo-med.png" alt="Honor Bound FIT" width="180" style="display:block;"/>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">Application Received</p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;line-height:1.1;">
              We've Got Your Application, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px 0;">
              Your Guardian Angel Program application has been received and your verification document is under review.
              Staff will verify your eligibility within <strong style="color:#ffffff;">24 hours</strong>.
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              <strong style="color:#ffffff;">Your billing will not start until you're approved.</strong>
              You'll receive a confirmation email the moment your membership is activated.
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
              Questions? Email us at <a href="mailto:rich@honorboundfit.com" style="color:#ffffff;">rich@honorboundfit.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Send functions ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  to: string;
  firstName: string;
  planName: string;
  price: number;
  nextBillingDate: string;
  isGap: boolean;
  standInTheGap: boolean;
  setPasswordUrl: string;
}) {
  const html = welcomeEmailHtml(opts);
  const result = await getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `Welcome to Honor Bound FIT, ${opts.firstName}.`,
    html,
  });
  return result;
}

export async function sendGapPendingEmail(opts: {
  to: string;
  firstName: string;
  planName: string;
}) {
  const html = gapPendingEmailHtml(opts);
  const result = await getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: 'GAP Application Received — Honor Bound FIT',
    html,
  });
  return result;
}

export async function sendAdminGapNotification(opts: {
  memberName: string;
  email: string;
  planName: string;
  docPath: string;
}) {
  const result = await getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `GAP Application: ${opts.memberName}`,
    html: `<p>New GAP application received.</p>
    <ul>
      <li><strong>Name:</strong> ${opts.memberName}</li>
      <li><strong>Email:</strong> ${opts.email}</li>
      <li><strong>Plan:</strong> ${opts.planName}</li>
      <li><strong>Document:</strong> ${opts.docPath}</li>
    </ul>
    <p><a href="https://honorboundfit.com/admin/gap">Review in Admin Dashboard →</a></p>`,
  });
  return result;
}

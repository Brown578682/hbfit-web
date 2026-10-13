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

        <!-- Mark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
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
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
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

export async function sendGapApprovedEmail(opts: {
  to: string;
  firstName: string;
  checkoutUrl: string;
  setPasswordUrl: string;
  autoActivated?: boolean;
}) {
  const billingSection = opts.autoActivated
    ? `<p style="margin:0 0 24px;line-height:1.6">
  Your membership is <strong style="color:#4ade80">now active</strong> and your card on file will be billed $75 at the start of your first cycle.
  No further action needed — you&rsquo;re in.
</p>`
    : `<p style="margin:0 0 24px;line-height:1.6">
  To activate your membership, please complete your billing setup. It only takes a minute and secures your GAP rate of <strong>$75/cycle</strong>.
</p>
<a href="${opts.checkoutUrl}" style="display:inline-block;background:#facc15;color:#0a0a0a;font-family:Montserrat,sans-serif;font-weight:800;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;margin-bottom:28px">
  Set Up Billing →
</a>`;

  const html = `<!DOCTYPE html>
<html><body style="background:#0a0a0a;color:#e5e5e5;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px">
<img src="https://honorboundfit.com/logo.png" alt="Honor Bound FIT" style="height:48px;margin-bottom:28px" />
<h1 style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:#facc15;margin:0 0 12px">
  You&rsquo;re Approved, ${opts.firstName}!
</h1>
<p style="margin:0 0 16px;line-height:1.6">
  Your Guardian Angel Program application has been reviewed and approved.
  Welcome to Honor Bound FIT — we&rsquo;re honored to have you.
</p>
${billingSection}
<p style="margin:0 0 8px;line-height:1.6;font-size:14px;color:#a1a1aa">
  Set up your member portal password to access your dashboard, book classes, and track your progress:
</p>
<a href="${opts.setPasswordUrl}" style="color:#60a5fa;font-size:14px">${opts.setPasswordUrl}</a>
<hr style="border:none;border-top:1px solid #27272a;margin:32px 0" />
<p style="font-size:12px;color:#52525b;margin:0">Honor Bound FIT · Fredericksburg, VA · <a href="https://honorboundfit.com" style="color:#52525b">honorboundfit.com</a></p>
</body></html>`;

  const result = await getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: opts.autoActivated
      ? `You're in! GAP membership activated — Honor Bound FIT`
      : `You're approved! Complete your GAP membership setup — Honor Bound FIT`,
    html,
  });
  return result;
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  firstName: string;
  setPasswordUrl: string;
}) {
  const { firstName, setPasswordUrl } = opts;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your Honor Bound FIT password</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Password Reset
            </p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;letter-spacing:1px;line-height:1.1;">
              Reset your password, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              We received a request to reset your Honor Bound FIT password. Click the button below to choose a new one.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#ffffff;padding:16px 32px;">
                  <a href="${setPasswordUrl}"
                     style="color:#000000;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                    Reset Password →
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">
              This link expires in 24 hours. If you didn't request a reset, you can ignore this email — your password hasn't changed.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `Reset your Honor Bound FIT password`,
    html,
  });
}

export async function sendFamilyMemberSetupEmail(opts: {
  to: string;
  firstName: string;
  primaryName: string;
  setPasswordUrl: string;
}) {
  const { firstName, primaryName, setPasswordUrl } = opts;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You've been added to Honor Bound FIT</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              You're In
            </p>
            <h1 style="color:#ffffff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;letter-spacing:1px;line-height:1.1;">
              Welcome, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              <strong style="color:#ffffff;">${primaryName}</strong> has added you to their Honor Bound FIT family membership.
              You're covered — set up your login to access your member portal, book classes, and track your progress.
            </p>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0 0 20px 0;">
              Create your password to get started:
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
        <tr>
          <td style="background:#0a0a0a;border:1px solid #222222;border-top:0;padding:32px 40px;">
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">
              What's Next
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['Show up', 'Classes are at 45 Centreport Parkway, Suite 137, Fredericksburg, VA. Come ready to work.'],
                ['Member portal', 'Track your progress, book classes, and manage your profile at honorboundfit.com/dashboard.'],
                ['Questions?', 'Email us at rich@honorboundfit.com anytime.'],
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
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `${primaryName} added you to their Honor Bound FIT membership`,
    html,
  });
}

// ── Corporate Invite Email ────────────────────────────────────────────────────

export async function sendCorporateInviteEmail(opts: {
  to: string;
  firstName: string;
  companyName: string;
  inviteToken: string;
}) {
  const { to, firstName, companyName, inviteToken } = opts;
  const inviteUrl = `https://honorboundfit.com/corporate/onboard?token=${inviteToken}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${companyName} has enrolled you at Honor Bound FIT</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Your Wellness Benefit
            </p>
            <h1 style="color:#ffffff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;letter-spacing:1px;line-height:1.1;">
              You&rsquo;re In, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              ${companyName} has enrolled you in a corporate wellness membership at Honor Bound FIT &mdash; a veteran-owned strength and conditioning gym in Fredericksburg, VA. Your membership is covered. All you need to do is complete a quick setup.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#ffffff;padding:16px 32px;">
                  <a href="${inviteUrl}"
                     style="color:#000000;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                    Complete Your Setup &rarr;
                  </a>
                </td>
              </tr>
            </table>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 0 32px 0;">
              This link expires in 7 days.
            </p>
          </td>
        </tr>

        <!-- What to expect -->
        <tr>
          <td style="background:#0a0a0a;border:1px solid #222222;border-top:0;padding:32px 40px;">
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">
              What to Expect
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['Group Classes', 'Coach-led group classes at 45 Centreport Pkwy, Suite 137.'],
                ['New Member Onboarding', 'New member onboarding and introductory fitness assessment.'],
                ['Member Portal', 'Access to your member portal to book classes and track progress.'],
              ].map(([title, body]) => `
              <tr>
                <td style="padding:0 0 20px 0;vertical-align:top;width:20px;">
                  <span style="color:#ffffff;font-size:14px;">&#10003;</span>
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

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to,
    subject: `${companyName} has enrolled you at Honor Bound FIT`,
    html,
  });
}

// ── Corporate Admin Notification ──────────────────────────────────────────────

export async function sendCorporateAdminNotification(opts: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  planTier: string;
  employeeCount: number;
}) {
  const { companyName, contactName, contactEmail, planTier, employeeCount } = opts;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>New Corporate Account: ${companyName}</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Admin Alert
            </p>
            <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;margin:0 0 28px 0;letter-spacing:1px;line-height:1.1;">
              New Corporate Account
            </h1>

            <!-- Info table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;border:1px solid #333333;margin-bottom:32px;">
              ${[
                ['Company', companyName],
                ['Contact Name', contactName],
                ['Contact Email', contactEmail],
                ['Plan Tier', planTier],
                ['Employee Count', String(employeeCount)],
              ].map(([label, value]) => `
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #222222;width:40%;">
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0;">${label}</p>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #222222;">
                  <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0;">${value}</p>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#ffffff;padding:14px 28px;">
                  <a href="https://honorboundfit.com/admin/corporate"
                     style="color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                    Review in Admin Dashboard &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT &middot; 45 Centreport Pkwy Suite 137 &middot; Fredericksburg, VA 22406
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `New Corporate Account: ${companyName}`,
    html,
  });
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

export async function sendContactNotificationEmail(opts: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}) {
  const result = await getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `New Contact Form: ${opts.subject ?? 'No subject'} — ${opts.name}`,
    html: `
      <p>A new message was submitted through the Honor Bound FIT contact form.</p>
      <ul>
        <li><strong>Name:</strong> ${opts.name}</li>
        <li><strong>Email:</strong> <a href="mailto:${opts.email}">${opts.email}</a></li>
        ${opts.subject ? `<li><strong>Subject:</strong> ${opts.subject}</li>` : ''}
      </ul>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">${opts.message.replace(/\n/g, '<br>')}</blockquote>
      <p>
        <a href="https://honorboundfit.com/admin/messages">View in Admin Dashboard →</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="mailto:${opts.email}?subject=Re: ${encodeURIComponent(opts.subject ?? 'Your message to Honor Bound FIT')}">Reply via Email →</a>
      </p>
    `,
  });
  return result;
}

export async function sendPooleeConfirmationEmail(opts: {
  to: string;
  firstName: string;
}) {
  const { firstName } = opts;
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>DEP Poolee Request Received</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">Request Received</p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;line-height:1.1;">
              We've Got You, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px 0;">
              Your DEP Poolee membership request has been received. We'll reach out within <strong style="color:#ffffff;">24 hours</strong> to get your account set up.
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              Your membership is <strong style="color:#ffffff;">free for as long as you're active in the DEP program.</strong>
              We train you before you ship. That's the mission.
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
              Questions? Email us at <a href="mailto:rich@honorboundfit.com" style="color:#ffffff;">rich@honorboundfit.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;">Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: 'DEP Poolee Request Received — Honor Bound FIT',
    html,
  });
}

export async function sendAdminPooleeNotification(opts: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branch: string;
  shipDate: string;
  recruiterName: string;
  recruiterPhone?: string;
  setPasswordUrl: string;
}) {
  const { firstName, lastName, email, phone, branch, shipDate, recruiterName, recruiterPhone, setPasswordUrl } = opts;
  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `DEP Poolee Request: ${firstName} ${lastName}`,
    html: `
      <p style="font-family:sans-serif;">New DEP Poolee membership request.</p>
      <table style="font-family:sans-serif;border-collapse:collapse;">
        <tr><td style="padding:4px 16px 4px 0;"><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Phone:</strong></td><td>${phone}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Branch:</strong></td><td>${branch}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Ship Date:</strong></td><td>${shipDate}</td></tr>
        <tr><td style="padding:4px 16px 4px 0;"><strong>Recruiter:</strong></td><td>${recruiterName}${recruiterPhone ? ` — ${recruiterPhone}` : ''}</td></tr>
      </table>
      <p style="font-family:sans-serif;margin-top:24px;">
        Once you've verified their DEP status, send them this link to set up their account:
      </p>
      <p style="font-family:sans-serif;">
        <a href="${setPasswordUrl}" style="background:#1d4ed8;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:bold;display:inline-block;">Set Up Poolee Account →</a>
      </p>
      <p style="font-family:sans-serif;font-size:12px;color:#666;">Link expires in 24 hours. Generate a new one from the admin panel if needed.</p>
      <p style="font-family:sans-serif;">
        <a href="https://honorboundfit.com/admin/members">View in Admin Dashboard →</a>
      </p>
    `,
  });
}

// ── Contact Form Reply ────────────────────────────────────────────────────────

export async function sendContactReply(opts: {
  to: string;
  toName: string;
  fromName: string;
  subject: string;
  replyBody: string;
  originalMsg: string;
}) {
  const { to, toName, fromName, subject, replyBody, originalMsg } = opts;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:40px;">
            <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">Message from ${fromName}</p>
            <p style="color:#ffffff;font-size:15px;line-height:1.7;margin:0 0 8px 0;">Hi ${toName},</p>
            <div style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.8;margin:0 0 32px 0;white-space:pre-wrap;">${replyBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 4px 0;">${fromName}</p>
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">Honor Bound FIT &middot; <a href="mailto:rich@honorboundfit.com" style="color:rgba(255,255,255,0.4);">rich@honorboundfit.com</a></p>
          </td>
        </tr>
        <tr>
          <td style="background:#0a0a0a;border:1px solid #222222;border-top:0;padding:24px 40px;">
            <p style="color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px 0;">Your original message</p>
            <p style="color:rgba(255,255,255,0.35);font-size:13px;line-height:1.7;margin:0;border-left:3px solid #333;padding-left:16px;white-space:pre-wrap;">${originalMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT &middot; 45 Centreport Pkwy Suite 137 &middot; Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from:    'Honor Bound FIT <noreply@honorboundfit.com>',
    replyTo: 'rich@honorboundfit.com',
    to:      `${toName} <${to}>`,
    subject,
    html,
  });
}

// ── Guest Pass Confirmation ───────────────────────────────────────────────────

export async function sendGuestPassConfirmation(opts: {
  to: string;
  firstName: string;
  visitType: string;
  interests: string[];
}) {
  const { firstName, visitType, interests } = opts;
  const interestList = interests.length > 0
    ? `<p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:13px;">You expressed interest in: <strong style="color:#ffffff;">${interests.join(', ')}</strong></p>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Your Guest Pass — Honor Bound FIT</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#dc2626;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">Guest Pass Confirmed</p>
            <h1 style="color:#ffffff;font-size:32px;font-weight:900;text-transform:uppercase;margin:0 0 20px 0;letter-spacing:1px;line-height:1.1;">
              You're Expected,<br/>${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              Your waiver is on file and we're ready for you. Come in anytime — just tell us your name at the front.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;border:1px solid #333333;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">Your Visit</p>
                  <p style="color:#ffffff;font-size:18px;font-weight:800;text-transform:uppercase;margin:0 0 6px 0;">${visitType}</p>
                  ${interestList}
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['📍 Where we are', '45 Centreport Pkwy, Suite 137<br/>Fredericksburg, VA 22406'],
                ['🕐 When to come', 'Check our <a href="https://honorboundfit.com" style="color:#ffffff;">class schedule</a> for today\'s times. Walk-ins welcome during open gym hours.'],
                ['❓ Questions?', 'Email us at <a href="mailto:rich@honorboundfit.com" style="color:#ffffff;">rich@honorboundfit.com</a> anytime.'],
              ].map(([title, body]) => `
              <tr>
                <td style="padding:0 0 20px 0;vertical-align:top;width:24px;"><span style="color:#ffffff;font-size:14px;">→</span></td>
                <td style="padding:0 0 20px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">${title}</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">${body}</p>
                </td>
              </tr>`).join('')}
            </table>

            <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="background:#ffffff;padding:16px 32px;">
                  <a href="https://honorboundfit.com/join"
                     style="color:#000000;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                    Explore Membership →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `Your guest pass is confirmed, ${firstName} — Honor Bound FIT`,
    html,
  });
}

export async function sendAdminGuestPassNotification(opts: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  visitType: string;
  interests: string[];
  howHeard: string;
  leadId: string;
}) {
  const { firstName, lastName, email, phone, visitType, interests, howHeard, leadId } = opts;
  const rows = [
    ['Name',       `${firstName} ${lastName}`],
    ['Email',      email],
    ['Phone',      phone],
    ['Visit Type', visitType],
    ['Interests',  interests.length > 0 ? interests.join(', ') : '—'],
    ['How Heard',  howHeard || '—'],
    ['Lead ID',    leadId],
  ];

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `New Guest Pass: ${firstName} ${lastName} — ${visitType}`,
    html: `
      <p style="font-family:sans-serif;font-size:15px;">A new guest just registered at <strong>honorboundfit.com/guest</strong>. Their waiver is signed and on file.</p>
      <table style="font-family:sans-serif;border-collapse:collapse;margin:16px 0;">
        ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:6px 20px 6px 0;color:#666;font-size:13px;vertical-align:top;"><strong>${label}:</strong></td>
          <td style="padding:6px 0;font-size:13px;">${value}</td>
        </tr>`).join('')}
      </table>
      <p style="font-family:sans-serif;">
        <a href="https://honorboundfit.com/admin/booth-leads" style="background:#111;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;display:inline-block;">View in Admin Dashboard →</a>
      </p>
    `,
  });
}

// ── Member Billing Alert ──────────────────────────────────────────────────────

export async function sendAdminBillingAlert(opts: {
  primaryName: string;
  newMemberName: string;
  subscriptionId: string;
  errorMessage: string;
}) {
  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'rich@honorboundfit.com',
    subject: `⚠️ Billing Alert: Family member added but Stripe charge failed`,
    html: `
      <p><strong>Action required:</strong> A family member was added to a membership but the Stripe billing update failed.</p>
      <ul>
        <li><strong>Primary member:</strong> ${opts.primaryName}</li>
        <li><strong>New member:</strong> ${opts.newMemberName}</li>
        <li><strong>Subscription ID:</strong> ${opts.subscriptionId}</li>
        <li><strong>Error:</strong> ${opts.errorMessage}</li>
      </ul>
      <p>The member has been created in the database but their add-on has NOT been added to Stripe. Please update the subscription manually.</p>
      <p><a href="https://honorboundfit.com/coach/members">View Members →</a></p>
    `,
  });
}

// ── Kiosk Onboarding Email ────────────────────────────────────────────────────

export async function sendKioskOnboardingEmail(opts: {
  to: string;
  firstName: string;
  memberCode: string;
  hasPin: boolean;
}) {
  const { firstName, memberCode, hasPin } = opts;

  const pinSection = hasPin
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1a0a;border:1px solid #166534;margin-bottom:28px;">
        <tr><td style="padding:20px 28px;">
          <p style="color:#4ade80;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">You're All Set</p>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0;">
            You already have a PIN set up. Just bring your Member Code to the kiosk and enter your PIN when prompted.
            If you've forgotten it, you can reset it anytime in your member portal.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr><td style="background:#ffffff;padding:12px 28px;">
              <a href="https://honorboundfit.com/dashboard/settings"
                 style="color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                Manage PIN →
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a00;border:1px solid #92400e;margin-bottom:28px;">
        <tr><td style="padding:20px 28px;">
          <p style="color:#fb923c;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px 0;">Action Required</p>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;margin:0 0 16px 0;">
            You haven't set up your kiosk PIN yet. It only takes 30 seconds — log in to your member portal and go to <strong style="color:#ffffff;">Settings → PIN</strong>.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#ffffff;padding:12px 28px;">
              <a href="https://honorboundfit.com/dashboard/settings"
                 style="color:#000000;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;text-decoration:none;">
                Create Your PIN →
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your HBFIT Kiosk Check-In Code</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#ffffff;opacity:0.4;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;">
              Kiosk Check-In
            </p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 16px 0;letter-spacing:1px;line-height:1.1;">
              Check In Faster,<br/>${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              We have a self-service kiosk at the gym — no waiting, no front desk, just tap in and get to work.
              Here's everything you need to use it.
            </p>

            <!-- Member Code box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;border:1px solid #333333;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px 0;">Your Member Code</p>
                  <p style="color:#ffffff;font-size:48px;font-weight:900;font-family:'Courier New',monospace;letter-spacing:12px;margin:0 0 8px 0;">${memberCode}</p>
                  <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">Enter this code at the kiosk to identify yourself.</p>
                </td>
              </tr>
            </table>

            <!-- PIN status -->
            ${pinSection}

            <!-- How it works -->
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">How the Kiosk Works</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${[
                ['Step 1 — Enter your code', `Tap your 4-digit Member Code (<strong style="color:#ffffff;font-family:'Courier New',monospace;">${memberCode}</strong>) on the numpad.`],
                ['Step 2 — Enter your PIN', 'Enter your 4-digit PIN. This keeps your check-in secure — only you can check yourself in.'],
                ['Step 3 — Choose what you need', 'Check In, Shop the front desk items, or send a message to a coach — all from the same screen.'],
                ['Step 4 — Done', 'That\'s it. The kiosk logs your visit and you\'re good to go.'],
              ].map(([title, body]) => `
              <tr>
                <td style="padding:0 0 18px 0;vertical-align:top;width:24px;">
                  <span style="color:#ffffff;font-size:14px;">→</span>
                </td>
                <td style="padding:0 0 18px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">${title}</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">${body}</p>
                </td>
              </tr>`).join('')}
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
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
              &nbsp;·&nbsp;
              <a href="https://honorboundfit.com/dashboard" style="color:rgba(255,255,255,0.3);text-decoration:none;">Member Portal</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `Your HBFIT kiosk code: ${memberCode}`,
    html,
  });
}

// ── Drop-In / 10-Pack Welcome Email ──────────────────────────────────────────

export function sendDropInWelcomeEmail(opts: {
  to: string;
  firstName: string;
  credits: number;
  setPasswordUrl: string;
}) {
  const { firstName, credits, setPasswordUrl } = opts;
  const packLabel = credits === 1 ? '1-Class Drop-In' : `${credits}-Class Pack`;

  const html = `<!DOCTYPE html>
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

        <!-- Mark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
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
              Your <strong style="color:#ffffff;">${packLabel}</strong> purchase is confirmed.
              Your credits are loaded and ready to use — we've created a free member account so you can book classes and track your balance.
            </p>

            <!-- Credits box -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#000000;border:1px solid #333333;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px 0;">Your Credits</p>
                  <p style="color:#ffffff;font-size:32px;font-weight:900;margin:0;">${credits}</p>
                  <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:4px 0 0 0;">class credit${credits !== 1 ? 's' : ''} · never expire</p>
                </td>
              </tr>
            </table>

            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              Set your password to access your member dashboard, view your credit balance, and book classes.
            </p>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${setPasswordUrl}"
                 style="display:inline-block;background:#dc2626;color:#ffffff;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:16px 36px;text-decoration:none;font-size:14px;">
                Set My Password
              </a>
            </div>

            <p style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;margin:0;">
              This link expires in 72 hours. Questions? Visit
              <a href="https://honorboundfit.com/contact" style="color:rgba(255,255,255,0.5);">honorboundfit.com/contact</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: opts.to,
    subject: `Your ${packLabel} is ready — set your password`,
    html,
  });
}

// ── F3 — Foster Families Free Emails ─────────────────────────────────────────

export async function sendF3ApplicationConfirmation(opts: {
  to: string;
  firstName: string;
  lastName: string;
}) {
  const { to, firstName, lastName } = opts;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>F3 Application Received — Honor Bound FIT</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;padding:48px 40px;">
            <p style="color:#dc2626;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 16px 0;font-weight:700;">
              Foster Families Free
            </p>
            <h1 style="color:#ffffff;font-size:28px;font-weight:900;text-transform:uppercase;margin:0 0 24px 0;letter-spacing:1px;line-height:1.1;">
              Application Received, ${firstName}.
            </h1>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px 0;">
              We've received your F3 application for <strong style="color:#ffffff;">${firstName} ${lastName}</strong>.
              Our team will verify your foster family status and reach out within
              <strong style="color:#ffffff;">48 hours</strong>.
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 32px 0;">
              <strong style="color:#ffffff;">There is no cost, no catch.</strong> If approved, your family receives
              a full gym membership at zero charge — because the people who show up for kids deserve
              a community that shows up for them.
            </p>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr><td style="border-top:1px solid #333333;"></td></tr>
            </table>

            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
              Questions? Email us at <a href="mailto:Rich@HonorBoundFIT.com" style="color:#dc2626;text-decoration:none;">Rich@HonorBoundFIT.com</a>
            </p>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="background:#0a0a0a;border:1px solid #222222;border-top:0;padding:32px 40px;">
            <p style="color:rgba(255,255,255,0.4);font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 20px 0;">
              What Happens Next
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 0 20px 0;vertical-align:top;width:20px;">
                  <span style="color:#dc2626;font-size:14px;font-weight:900;">01</span>
                </td>
                <td style="padding:0 0 20px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">We Verify</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">Staff will review and confirm your foster family status within 48 hours.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 20px 0;vertical-align:top;width:20px;">
                  <span style="color:#dc2626;font-size:14px;font-weight:900;">02</span>
                </td>
                <td style="padding:0 0 20px 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">We Reach Out</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">You'll receive a confirmation email once your enrollment is approved.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0;vertical-align:top;width:20px;">
                  <span style="color:#dc2626;font-size:14px;font-weight:900;">03</span>
                </td>
                <td style="padding:0 0 0 16px;">
                  <p style="color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Show Up</p>
                  <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.6;margin:0;">Walk in on day one as a full member of the tribe. No asterisks.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406<br/>
              <a href="https://honorboundfit.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">honorboundfit.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to,
    subject: 'F3 Application Received — Honor Bound FIT',
    html,
  });
}

export async function sendAdminF3Notification(opts: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  numberOfFosterChildren: number;
  fosteringDuration: string;
  agencyName?: string | null;
  heardAboutUs?: string | null;
  additionalNotes?: string | null;
}) {
  const {
    firstName, lastName, email, phone, address, city, state, zip,
    numberOfFosterChildren, fosteringDuration, agencyName, heardAboutUs, additionalNotes,
  } = opts;

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:2px;text-transform:uppercase;width:180px;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#ffffff;font-size:14px;vertical-align:top;">${value || '—'}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New F3 Application</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 0 32px 0;" align="center">
            <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:42px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;line-height:1;">
              <span style="color:#1d4ed8;">HB</span><span style="color:#dc2626;">F</span><span style="color:#ffffff;">I</span><span style="color:#dc2626;">T</span>
            </span>
          </td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="background:#dc2626;padding:20px 40px;">
            <p style="color:#ffffff;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 6px 0;opacity:0.8;">Incoming Application</p>
            <h1 style="color:#ffffff;font-size:24px;font-weight:900;text-transform:uppercase;margin:0;letter-spacing:1px;">
              New F3 Application
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#111111;border:1px solid #333333;border-top:0;padding:40px;">
            <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;margin:0 0 28px 0;">
              A new Foster Families Free application has been submitted and requires your review.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #222222;">
              ${row('Name', `${firstName} ${lastName}`)}
              ${row('Email', email)}
              ${row('Phone', phone)}
              ${row('Address', `${address}, ${city}, ${state} ${zip}`)}
              ${row('Foster Children', String(numberOfFosterChildren))}
              ${row('Fostering Duration', fosteringDuration)}
              ${row('Agency', agencyName ?? '—')}
              ${row('Heard About Us', heardAboutUs ?? '—')}
              ${row('Notes', additionalNotes ?? '—')}
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td>
                  <a href="mailto:${email}?subject=Re: F3 Foster Families Free Application"
                     style="display:inline-block;background:#dc2626;color:#ffffff;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:3px;padding:14px 28px;text-decoration:none;">
                    Reply to Applicant →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 0 0 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;line-height:1.6;margin:0;">
              Honor Bound FIT · 45 Centreport Pkwy Suite 137 · Fredericksburg, VA 22406
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: 'Honor Bound FIT <noreply@honorboundfit.com>',
    to: 'Rich@HonorBoundFIT.com',
    subject: `New F3 Application — ${firstName} ${lastName}`,
    html,
  });
}

const { Resend } = require('resend');

const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
const fromEmail = String(process.env.FROM_EMAIL || '').trim();

const smtpEnvReady = Boolean(resendApiKey && fromEmail);

if (!smtpEnvReady) {
  console.warn(
    'Resend email is not fully configured (set RESEND_API_KEY and FROM_EMAIL). Outbound mail will fail until both are set.',
  );
}

let resendClient;
const getResend = () => {
  if (!resendClient) resendClient = new Resend(resendApiKey);
  return resendClient;
};

const logSmtpStartupCheck = () => {
  if (!smtpEnvReady) {
    console.warn('Resend startup check skipped (missing RESEND_API_KEY or FROM_EMAIL)');
    return;
  }
  getResend()
    .domains.list({ limit: 1 })
    .then(({ data, error }) => {
      if (error) {
        console.error('Resend API check failed:', error.message || JSON.stringify(error));
        return;
      }
      const n = Array.isArray(data?.data) ? data.data.length : 0;
      console.log(`Resend API OK (${n} domain(s) listed — verify sending domain in Resend if needed)`);
    })
    .catch((err) => {
      console.error('Resend startup check failed:', err.message);
    });
};

const sendEmail = async ({ to, subject, html }) => {
  if (!smtpEnvReady) {
    const err = new Error('Resend is not configured (missing RESEND_API_KEY or FROM_EMAIL)');
    console.error('Email send skipped:', err.message);
    throw err;
  }
  const from = `"${process.env.FROM_NAME || 'Brand OS'}" <${fromEmail}>`;
  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject,
    html,
  });
  if (error) {
    const msg = error.message || JSON.stringify(error);
    console.error('Email send failed:', msg);
    throw new Error(msg);
  }
  console.log(`Email sent to ${to}${data?.id ? ` (id ${data.id})` : ''}`);
};

const appLogoUrl = () => {
  if (process.env.LOGO_URL) return process.env.LOGO_URL;
  if (!process.env.CLIENT_URL) return '';
  return `${process.env.CLIENT_URL.replace(/\/$/, '')}/logo.png`;
};

const logoMarkup = () => {
  const logoUrl = appLogoUrl();
  if (!logoUrl) return '';

  return `
    <div style="text-align:center;margin-bottom:32px">
      <img src="${logoUrl}" alt="Brand OS" width="56" height="56" style="display:inline-block;width:56px;height:56px;object-fit:contain;border-radius:14px;background:#111119;border:1px solid #2a2a35;padding:8px" />
    </div>`;
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Personal Brand OS',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:40px;border-radius:16px">
        ${logoMarkup()}
        <h1 style="font-size:24px;font-weight:700;margin-bottom:12px">Welcome, ${name}!</h1>
        <p style="color:#9898a8;line-height:1.6">Your Personal Brand OS is ready. Start managing your content, deals, and analytics all in one place.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#7c6ef8;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Launch your Brand OS →</a>
      </div>`,
  }),

  resetPassword: (name, url) => ({
    subject: 'Reset your password — Brand OS',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:40px;border-radius:16px">
        ${logoMarkup()}
        <h1 style="font-size:22px;font-weight:700;margin-bottom:12px">Password Reset Request</h1>
        <p style="color:#9898a8;line-height:1.6">Hi ${name}, click below to reset your password. This link expires in 10 minutes.</p>
        <a href="${url}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#7c6ef8;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Reset Password →</a>
        <p style="margin-top:24px;font-size:12px;color:#5a5a6a">If you didn't request this, ignore this email.</p>
      </div>`,
  }),

  achievement: ({ name, title, message, url }) => ({
    subject: `Achievement unlocked — ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:40px;border-radius:16px">
        ${logoMarkup()}
        <p style="margin:0 0 10px;color:#a78bfa;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Achievement unlocked</p>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Nice work, ${name}!</h1>
        <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;color:#ffffff">${title}</h2>
        <p style="color:#9898a8;line-height:1.6;margin:0">${message}</p>
        <a href="${url}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#7c6ef8;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">View in Brand OS</a>
      </div>`,
  }),

  loginAlert: ({ name, ip, device, time }) => ({
    subject: 'New login to your Brand OS account',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:40px;border-radius:16px">
        ${logoMarkup()}
        <p style="margin:0 0 10px;color:#60a5fa;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Security alert</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">New login detected</h1>
        <p style="color:#9898a8;line-height:1.6;margin:0 0 18px">Hi ${name}, your Brand OS account was just signed in.</p>
        <div style="background:#111119;border:1px solid #2a2a35;border-radius:12px;padding:16px;color:#cfcfda;font-size:13px;line-height:1.8">
          <div><strong style="color:#ffffff">Time:</strong> ${time}</div>
          <div><strong style="color:#ffffff">IP:</strong> ${ip || 'Unknown'}</div>
          <div><strong style="color:#ffffff">Device:</strong> ${device || 'Unknown device'}</div>
        </div>
        <p style="margin-top:18px;font-size:12px;color:#5a5a6a;line-height:1.6">If this was you, no action is needed. If you do not recognize this login, change your password immediately.</p>
      </div>`,
  }),

  passwordChanged: ({ name, ip, device, time }) => ({
    subject: 'Your Brand OS password was changed',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e8e8f0;padding:40px;border-radius:16px">
        ${logoMarkup()}
        <p style="margin:0 0 10px;color:#fbbf24;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em">Security alert</p>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">Password changed</h1>
        <p style="color:#9898a8;line-height:1.6;margin:0 0 18px">Hi ${name}, your Brand OS password was changed successfully.</p>
        <div style="background:#111119;border:1px solid #2a2a35;border-radius:12px;padding:16px;color:#cfcfda;font-size:13px;line-height:1.8">
          <div><strong style="color:#ffffff">Time:</strong> ${time}</div>
          <div><strong style="color:#ffffff">IP:</strong> ${ip || 'Unknown'}</div>
          <div><strong style="color:#ffffff">Device:</strong> ${device || 'Unknown device'}</div>
        </div>
        <p style="margin-top:18px;font-size:12px;color:#5a5a6a;line-height:1.6">If you did not make this change, reset your password and contact support right away.</p>
      </div>`,
  }),
};

module.exports = { sendEmail, emailTemplates, logSmtpStartupCheck, smtpEnvReady };

import nodemailer from 'nodemailer';

// Centralized mailer to support SMTP or service providers and clearer errors/logging
let transporter = null;

function getTransportOptions() {
  // Prefer explicit SMTP settings if provided
  const host = process.env.MAIL_HOST;
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : undefined;
  const secure = process.env.MAIL_SECURE === 'true' || (port === 465);

  if (host && port) {
    return {
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  // Fallback to provider/service (e.g., 'gmail') when MAIL_HOST is not set
  if (process.env.EMAIL_SERVICE) {
    return { service: process.env.EMAIL_SERVICE, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } };
  }

  // Last-resort: try Gmail via service option (may require app password)
  return { service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } };
}

function ensureTransporter() {
  if (transporter) return transporter;
  const opts = getTransportOptions();
  transporter = nodemailer.createTransport(opts);
  return transporter;
}

export function isConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

export async function verifyTransport() {
  if (!isConfigured()) throw new Error('Email credentials not configured (EMAIL_USER/EMAIL_PASS)');
  const t = ensureTransporter();
  return t.verify();
}

export async function sendMail(mailOptions) {
  if (!isConfigured()) throw new Error('Email credentials not configured (EMAIL_USER/EMAIL_PASS)');
  const t = ensureTransporter();
  try {
    // verify connection first (no-op if already verified by server)
    await t.verify();
  } catch (verifyErr) {
    // attach extra context
    verifyErr.message = `SMTP verify failed: ${verifyErr.message}`;
    throw verifyErr;
  }

  try {
    const info = await t.sendMail(mailOptions);
    return info;
  } catch (err) {
    err.message = `sendMail failed: ${err.message}`;
    throw err;
  }
}

export default {
  isConfigured,
  verifyTransport,
  sendMail,
};

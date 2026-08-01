import nodemailer from 'nodemailer';

// ─── Basic abuse protection ───────────────────────────────
// Honeypot: invisible field bots fill in. Drop silently, pretend success.
function isBot(body) {
  return Boolean(body?._gotcha);
}

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

// ponytail: per-instance in-memory rate limit. Fine for a portfolio at Vercel's
// scale; upgrade path is a KV/Redis-backed store if abuse ever appears.
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RATE_MAX = 5; // 5 submissions per window per IP
const rateHits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hit = rateHits.get(ip);
  if (!hit || now - hit.resetAt > RATE_WINDOW_MS) {
    rateHits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  hit.count += 1;
  return hit.count > RATE_MAX;
}

function clientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Bots get a fake success so they don't learn the honeypot
  if (isBot(body)) {
    return res.status(200).json({ success: true });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (name.length > MAX_NAME) {
    return res.status(400).json({ error: 'Name is too long' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (message.length > MAX_MESSAGE) {
    return res.status(400).json({ error: 'Message is too long' });
  }

  // Create a transporter using environment variables (SMTP credentials)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Tushar Portfolio" <${process.env.SMTP_USER}>`,
    // Set reply-to so the recipient can answer directly to the sender's address
    replyTo: email,
    to: 'sologamer9753@gmail.com',
    subject: `🔐 Encrypted Message from ${name}`,
    text: `Sender Name : ${name}\nSender Email: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

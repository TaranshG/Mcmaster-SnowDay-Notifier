const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { createClient } = require('@supabase/supabase-js');

console.log("ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  HAS_SUPABASE_KEY: !!process.env.SUPABASE_ANON_KEY,
  APP_URL: process.env.APP_URL,
  HAS_SENDGRID_KEY: !!process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
});

const nodemailer = require("nodemailer");

const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // IMPORTANT for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

smtpTransporter.verify().then(
  () => console.log("✅ SMTP ready"),
  (e) => console.log("❌ SMTP verify failed:", e.message)
);


const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.APP_URL,
    process.env.FRONTEND_URL, // optional extra
  ].filter(Boolean),
  methods: ['GET', 'POST'],
}));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('ok'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

console.log("SUPABASE URL:", process.env.SUPABASE_URL);

function makeToken() {
  // better than Math.random() only, but still simple
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, phone } = req.body;

  if (!email) return res.status(400).json({ error: "Email required" });

  const token = makeToken();

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{
        email,
        phone: phone || null,
        verification_token: token,
        verified: false,
      }])
      .select()
      .maybeSingle();

    // Handle duplicate email
    if (error) {
      if (error.code === '23505') {
        const { data: existing, error: lookupErr } = await supabase
          .from('subscribers')
          .select('verified')
          .eq('email', email)
          .maybeSingle();

        if (lookupErr) {
          return res.status(400).json({ error: 'Email already registered.' });
        }

        if (existing?.verified) {
          return res.status(400).json({
            error: 'Email already registered and verified.',
            code: 'EMAIL_ALREADY_VERIFIED',
          });
        }

        return res.status(400).json({
          error: 'Email already registered. Check your inbox for the verification link.',
          code: 'EMAIL_ALREADY_REGISTERED',
        });
      }

      return res.status(400).json({ error: error.message });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify?token=${encodeURIComponent(token)}`;

    // Pretty email HTML
    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirm your email</title>
  </head>

  <body style="margin:0;padding:0;background:#f6f7fb;">
    <div style="width:100%;padding:24px 12px;">
      <div
        style="
          max-width:560px;
          margin:0 auto;
          background:#ffffff;
          border-radius:12px;
          border:1px solid #e5e7eb;
          font-family: Arial, Helvetica, sans-serif;
          color:#111827;
        "
      >
        <div style="padding:20px 20px 0;">
          <div style="font-size:16px;font-weight:700;">
            McMaster Snow Day Alerts
          </div>
          <div style="margin-top:6px;font-size:13px;color:#6b7280;">
            Confirm your email to receive alerts
          </div>
        </div>

        <div style="padding:16px 20px 20px;">
          <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:#374151;">
            Hi,
          </p>

          <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#374151;">
            Please confirm your email address to receive snow day alerts for McMaster.
          </p>

          <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:#374151;">
            Confirm here:
            <br />
            <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">
              ${verifyUrl}
            </a>
          </p>

          <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
            You will only receive an email if McMaster officially announces a snow day.
            No ads, no data sharing. Unsubscribe anytime.
          </p>

          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
            If you didn’t sign up for this, you can ignore this email.
          </p>

          <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#6b7280;">
              Student-built tool for McMaster students.
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

    const fromEmail = process.env.SMTP_FROM;
    if (!fromEmail) {
      return res.status(500).json({ error: "SMTP_FROM is missing in env" });
    }

    await smtpTransporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Confirm your email for snow day alerts",
      html,
    });


    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Something went wrong: " + err.message });
  }
});

// Verify endpoint
app.get('/api/verify', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token required' });
  }

  try {
    // 1) Find row by token
    const { data: row, error: findErr } = await supabase
      .from('subscribers')
      .select('email, verified')
      .eq('verification_token', token)
      .maybeSingle();

    if (findErr) {
      return res.status(500).json({ success: false, error: findErr.message });
    }

    if (!row) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // 2) Already verified => return success (no confusion)
    if (row.verified) {
      return res.status(200).json({
        success: true,
        email: row.email,
        message: 'Already verified',
      });
    }

    // 3) Mark verified (keeping token is fine)
    const { error: updErr } = await supabase
      .from('subscribers')
      .update({ verified: true })
      .eq('verification_token', token);

    if (updErr) {
      return res.status(500).json({ success: false, error: updErr.message });
    }

    return res.status(200).json({ success: true, email: row.email });
  } catch (e) {
    console.error("Verify error:", e);
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

// Admin users endpoint (optional - keep if you use it)
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email, phone, verified, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});

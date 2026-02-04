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
    <title>Verify your email</title>
  </head>
  <body style="margin:0;padding:0;background:#0b1220;">
    <div style="width:100%;padding:32px 12px;">
      <div style="
        max-width:560px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 20px 60px rgba(0,0,0,0.35);
        font-family: Arial, Helvetica, sans-serif;
      ">

        <div style="
          padding:28px 24px;
          background: linear-gradient(135deg, #1e3a8a 0%, #4c1d95 55%, #581c87 100%);
          color:#fff;
          text-align:center;
        ">
          <div style="font-size:34px; line-height:1; margin-bottom:10px;">❄️</div>
          <div style="font-size:20px; font-weight:800; letter-spacing:0.2px;">
            McMaster Snow Day Alerts
          </div>
          <div style="margin-top:8px; font-size:13px; color:rgba(255,255,255,0.85);">
            Verify your email to start receiving alerts
          </div>
        </div>

        <div style="padding:26px 24px; color:#111827;">
          <h1 style="margin:0 0 10px; font-size:20px; line-height:1.3;">
            You're almost subscribed ✅
          </h1>

          <p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:#374151;">
            Click the button below to verify your email. After verification, you’ll get notified when
            McMaster announces a snow day.
          </p>

          <div style="text-align:center; margin:22px 0 18px;">
            <a href="${verifyUrl}" style="
              display:inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color:#fff;
              text-decoration:none;
              font-weight:800;
              padding:14px 22px;
              border-radius:12px;
              box-shadow:0 14px 30px rgba(59,130,246,0.35);
            ">
              Verify my email
            </a>
          </div>

          <div style="
            padding:14px 14px;
            background:#f3f4f6;
            border-radius:12px;
            border:1px solid #e5e7eb;
            font-size:12px;
            line-height:1.5;
            color:#374151;
          ">
            If the button doesn’t work, copy and paste this link:
            <div style="word-break:break-all; margin-top:8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
              ${verifyUrl}
            </div>
          </div>

          <p style="margin:18px 0 0; font-size:12px; color:#6b7280; line-height:1.6;">
            If you didn’t sign up for this, you can ignore this email.
          </p>
        </div>

        <div style="
          padding:16px 24px;
          background:#0b1220;
          color:rgba(255,255,255,0.7);
          font-size:12px;
          text-align:center;
        ">
          Built for McMaster students • Stay safe this winter
        </div>

      </div>
    </div>
  </body>
</html>
`;

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      return res.status(500).json({ error: "SENDGRID_FROM_EMAIL is missing in env" });
    }

    await sgMail.send({
      to: email,
      from: fromEmail,
      subject: "❄️ Verify your Snow Day Alerts subscription",
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

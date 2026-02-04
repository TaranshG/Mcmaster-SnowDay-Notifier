const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("ENV CHECK:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  HAS_SUPABASE_KEY: !!process.env.SUPABASE_ANON_KEY,
  APP_URL: process.env.APP_URL,
});

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.APP_URL,
    process.env.FRONTEND_URL, // add this
  ].filter(Boolean),
  methods: ['GET','POST'],
}));


app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 20_000,
});

transporter.verify((err) => {
  if (err) console.log("SMTP verify failed:", err);
  else console.log("✅ SMTP ready");
});


const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// (You are not using Resend anymore, remove it entirely)
console.log("SUPABASE URL:", process.env.SUPABASE_URL);

app.post('/api/signup', async (req, res) => {
  const { email, phone } = req.body;

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email, 
          phone: phone || null, 
          verification_token: token,
          verified: false 
        }
      ])
      .select();

    if (error) {
      if (error && error.code === '23505') {
  // Duplicate email — check if it's verified
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
      code: 'EMAIL_ALREADY_VERIFIED'
    });
  }

  return res.status(400).json({
    error: 'Email already registered. Check your inbox for the verification link.',
    code: 'EMAIL_ALREADY_REGISTERED'
  });
}
      return res.status(400).json({ error: error.message });
    }

   const appUrl = process.env.APP_URL || 'http://localhost:3000';
   const verifyUrl = `${appUrl}/verify?token=${token}`;


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

        <!-- Header -->
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

        <!-- Body -->
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

        <!-- Footer -->
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

await transporter.sendMail({
  from: `"McMaster Snow Day" <${process.env.GMAIL_USER}>`,
  to: email,
  subject: "❄️ Verify your Snow Day Alerts subscription",
  html,
});



    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong: ' + error.message });
  }
});

// Verify endpoint
app.get('/api/verify', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token required' });
  }

  try {
    // 1) Find the user BEFORE updating (so we can return proper messaging)
    const { data: row, error: findErr } = await supabase
      .from('subscribers')
      .select('email, verified')
      .eq('verification_token', token)
      .maybeSingle();

    if (findErr) {
      return res.status(500).json({ success: false, error: findErr.message });
    }

    // If token doesn't exist -> could be invalid OR already used
    if (!row) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // 2) If already verified, just return success (no confusion)
    if (row.verified) {
      return res.status(200).json({
        success: true,
        email: row.email,
        message: 'Already verified'
      });
    }

    // 3) Verify + consume token
    const { error: updErr } = await supabase
      .from('subscribers')
      .update({ verified: true }) // keep token
      .eq('verification_token', token);

    if (updErr) {
      return res.status(500).json({ success: false, error: updErr.message });
    }

    return res.status(200).json({ success: true, email: row.email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
});


// Admin users endpoint
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email, phone, verified, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});

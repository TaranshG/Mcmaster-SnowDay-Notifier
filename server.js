const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Brevo setup
const SibApiV3Sdk = require('@getbrevo/brevo');
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.APP_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods: ['GET', 'POST'],
}));

app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('ok'));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function makeToken() {
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

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,sans-serif;">
    <div style="width:100%;padding:24px 12px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;color:#111827;">
        
        <div style="padding:20px 20px 0;">
          <div style="font-size:18px;font-weight:700;">McMaster Snow Day Alerts</div>
          <div style="margin-top:6px;font-size:14px;color:#6b7280;">Confirm your email</div>
        </div>

        <div style="padding:16px 20px 20px;">
          <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:#374151;">
            Hi,
          </p>

          <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#374151;">
            Click the button below to confirm your email and start receiving snow day alerts for McMaster University.
          </p>

          <div style="margin:24px 0;text-align:center;">
            <a href="${verifyUrl}" 
               style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
              Confirm Email
            </a>
          </div>

          <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
            Or copy this link:<br/>
            <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;font-size:12px;">
              ${verifyUrl}
            </a>
          </p>

          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
            You'll only get an email when McMaster officially announces a snow day. No spam, no ads.
          </p>

          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
            Didn't sign up? You can safely ignore this email.
          </p>

          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              McMaster Snow Day Alerts<br/>
              Hamilton, ON, Canada
            </p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

    // Send with Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "McMaster Snow Day Alerts",
      email: process.env.BREVO_SENDER_EMAIL
    };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = "Confirm your email for snow day alerts";
    sendSmtpEmail.htmlContent = html;

    console.log("Brevo config:", {
      hasApiKey: !!process.env.BREVO_API_KEY,
      apiKeyPrefix: process.env.BREVO_API_KEY?.substring(0, 10),
      senderEmail: process.env.BREVO_SENDER_EMAIL
    });

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("✅ Email sent successfully");
    } catch (emailError) {
      console.error("❌ Brevo error details:", {
        message: emailError.message,
        response: emailError.response?.data,
        status: emailError.response?.status
      });
      throw emailError;
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Something went wrong: " + err.message });
  }
});

// Keep your verify endpoint exactly as is
app.get('/api/verify', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token required' });
  }

  try {
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

    if (row.verified) {
      return res.status(200).json({
        success: true,
        email: row.email,
        message: 'Already verified',
      });
    }

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

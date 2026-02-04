import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyPage() {
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`${API_BASE}/api/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(text);
        }
      })
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => (window.location.href = '/'), 5000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 50%, #581c87 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        textAlign: 'center',
        maxWidth: '500px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>
        {status === 'verifying' && (
          <>
            <Loader size={64} color="#3b82f6" style={{ margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
            <h1 style={{ fontSize: '28px', color: '#111827' }}>Verifying your email...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ color: '#10b981', fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
              ✓ Email Verified!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.6' }}>
              You're all set! You'll now receive instant alerts whenever McMaster announces a snow day.
            </p>
            <p style={{ color: '#3b82f6', fontSize: '14px', marginTop: '24px' }}>
              Redirecting you back home in a few seconds...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ color: '#ef4444', fontSize: '32px', marginBottom: '16px', fontWeight: 'bold' }}>
              Verification Failed
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              This verification link is invalid or has already been used.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                marginTop: '24px',
                background: '#3b82f6',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Go Back Home
            </button>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

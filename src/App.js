import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Bell, CheckCircle, Snowflake, Volume2, VolumeX, Share2, X, Copy, Check, Linkedin } from 'lucide-react';

export default function SnowDayAlertSystem() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('signup');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    consent: false
  });
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [sharePanel, setSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  // Snow toggle with system preference detection
  const [snowEnabled, setSnowEnabled] = useState(() => {
    const saved = localStorage.getItem('snowEnabled');
    if (saved !== null) {
      return saved === 'true';
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion;
  });

  useEffect(() => {
    localStorage.setItem('snowEnabled', snowEnabled);
  }, [snowEnabled]);

  const [snowflakes] = useState(() => 
    [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 25 + 15,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 5}s`
    }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // ✅ block submit if consent not checked
    if (!formData.consent) {
      setError('Please check the consent box to receive alerts.');
      return;
    }

    // ✅ block submit if email missing (just in case)
    if (!formData.email) {
      setError('Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    
    if (formData.email && formData.consent) {
      try {
        const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

        const response = await fetch(`${API_BASE}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, phone: formData.phone })
        });

        
        const data = await response.json();
        
        if (response.ok) {
          setSubmittedEmail(formData.email); // Store email before resetting
          setView('success');
          setFormData({ email: '', phone: '', consent: false });
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Signup error:', error);
        setError('Failed to sign up. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const toggleSnow = () => {
    setSnowEnabled(!snowEnabled);
  };

  const copyLink = () => {
    const url = 'https://tinyurl.com/McmasterSnowDays';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 50%, #581c87 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    blob1: {
      position: 'absolute',
      top: '80px',
      left: '40px',
      width: '384px',
      height: '384px',
      background: '#60a5fa',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.3',
      animation: 'blob 7s infinite'
    },
    blob2: {
      position: 'absolute',
      top: '160px',
      right: '40px',
      width: '384px',
      height: '384px',
      background: '#c084fc',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.3',
      animation: 'blob 7s infinite 2s'
    },
    blob3: {
      position: 'absolute',
      bottom: '-32px',
      left: '80px',
      width: '384px',
      height: '384px',
      background: '#818cf8',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.3',
      animation: 'blob 7s infinite 4s'
    },
    controlButtons: {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 50,
      display: 'flex',
      gap: '8px'
    },
    controlButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(12px)',
      padding: '12px',
      borderRadius: '50%',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    shareTabDesktop: {
      position: 'fixed',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 40,
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      padding: '16px 8px',
      borderRadius: '12px 0 0 12px',
      cursor: 'pointer',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.2)',
      transition: 'all 0.3s',
      display: 'none'
    },
    shareButtonMobile: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 40,
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      padding: '16px',
      borderRadius: '50%',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    sharePanel: {
      position: 'fixed',
      right: sharePanel ? '0' : '-100%',
      top: '0',
      height: '100vh',
      width: '100%',
      maxWidth: '400px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      boxShadow: '-10px 0 50px rgba(0,0,0,0.3)',
      zIndex: 100,
      transition: 'right 0.4s ease-out',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      backdropFilter: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
    },
    headerContent: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoIcon: {
      background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      padding: '12px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      transition: 'transform 0.3s'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '14px',
      color: '#bfdbfe'
    },
    main: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '900px',
      margin: '0 auto',
      padding: '48px 24px'
    },
    card: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '48px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.3)',
      animation: 'slideUp 0.5s ease-out'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s',
      background: 'white'
    },
    submitButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      color: 'white',
      padding: '18px',
      borderRadius: '16px',
      border: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s'
    },
    copyButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      padding: '14px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes snowfall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .snowflake {
          position: fixed;
          top: -10px;
          z-index: 1;
          pointer-events: none;
          animation: snowfall linear infinite;
        }
        * {
          box-sizing: border-box;
        }
        @media (min-width: 1024px) {
          .share-tab-desktop {
            display: block !important;
          }
          .share-button-mobile {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .share-button-mobile {
            display: flex !important;
          }
        }
      
      `}</style>

      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>
      <div style={styles.blob3}></div>

      {snowEnabled && snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          className="snowflake"
          color="white"
          style={{
            opacity: 0.7,
            left: flake.left,
            animationDuration: flake.duration,
            animationDelay: flake.delay
          }}
          size={flake.size}
        />
      ))}

      <div style={styles.controlButtons}>
        <button 
          onClick={toggleSnow} 
          style={styles.controlButton}
          title={snowEnabled ? "Disable snow" : "Enable snow"}
        >
          {snowEnabled ? (
            <Snowflake color="white" size={24} />
          ) : (
            <Snowflake color="rgba(255,255,255,0.4)" size={24} />
          )}
        </button>
        <button 
          onClick={toggleMusic} 
          style={styles.controlButton}
          title={isMusicPlaying ? "Mute music" : "Play music"}
        >
          {isMusicPlaying ? <Volume2 color="white" size={24} /> : <VolumeX color="white" size={24} />}
        </button>
      </div>

      <audio ref={audioRef} loop>
        <source src="/Only.mp3" type="audio/mpeg" />
      </audio>

      <div 
        className="share-tab-desktop"
        style={styles.shareTabDesktop}
        onClick={() => setSharePanel(true)}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) translateX(0)'}
      >
        <Share2 color="white" size={24} />
      </div>

      <div 
        className="share-button-mobile"
        style={styles.shareButtonMobile}
        onClick={() => setSharePanel(true)}
      >
        <Share2 color="white" size={28} />
      </div>

      <div style={styles.sharePanel}>
        <button
          onClick={() => setSharePanel(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={24} color="#6b7280" />
        </button>

        <Snowflake size={48} color="#3b82f6" style={{marginBottom: '24px'}} />
        
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Scan to Sign Up
        </h2>

        <div style={{
          width: '240px',
          height: '240px',
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
            alt="QR Code"
            style={{width: '200px', height: '200px'}}
          />
        </div>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Or visit:
        </p>
        
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '2px solid #3b82f6'
        }}>
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1e40af',
            fontFamily: 'monospace'
          }}>
            tinyurl.com/McmasterSnowDays
          </p>
        </div>

        <button 
          onClick={copyLink}
          style={styles.copyButton}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {copied ? (
            <>
              <Check size={20} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={20} />
              Copy Link
            </>
          )}
        </button>

        <p style={{
          marginTop: '24px',
          fontSize: '14px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          Share with your friends so they never miss a snow day! ❄️
        </p>
      </div>

      {sharePanel && (
        <div 
          onClick={() => setSharePanel(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
        />
      )}

      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <Bell color="white" size={32} />
            </div>
            <div>
              <h1 style={styles.title}>McMaster Snow Day</h1>
              <p style={styles.subtitle}>Never miss a snow day alert</p>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {view === 'signup' && (
          <div style={styles.card}>
            <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textAlign: 'center'}}>
              Get Instant Snow Day Alerts ❄️
            </h2>
            <p style={{color: '#6b7280', marginBottom: '32px', textAlign: 'center', lineHeight: '1.6'}}>
              Sign up to receive instant notifications when McMaster announces a snow day
            </p>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@mcmaster.ca"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number (Optional for SMS)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (416) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={{marginBottom: '8px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                    style={{width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0}}
                  />
                  <span style={{fontSize: '14px', color: '#374151'}}>
                    I agree to receive snow day alerts via email{formData.phone ? ' and SMS' : ' (and SMS if I add my number)'}
                  </span>
                </label>
              </div>

              <p style={{
                fontSize: '13px',
                color: '#6b7280',
                marginBottom: '24px',
                marginLeft: '32px',
                fontStyle: 'italic'
              }}>
                No spam. Only McMaster closure alerts. Unsubscribe anytime.
              </p>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: (isSubmitting || !formData.consent) ? 0.7 : 1,
                  cursor: (isSubmitting || !formData.consent) ? 'not-allowed' : 'pointer'
                }}
                disabled={isSubmitting || !formData.consent}
              >
                <Bell size={20} />
                {isSubmitting ? 'Signing up...' : 'Get Alerts'}
              </button>

            </form>
            
            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fee2e2',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{marginTop: '32px', padding: '20px', background: '#eff6ff', borderRadius: '12px', border: '2px solid #bfdbfe'}}>
              <p style={{fontSize: '14px', color: '#1e40af', marginBottom: '8px'}}>
                <CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} />
                You'll receive a verification email after signing up.
              </p>
              <p style={{fontSize: '14px', color: '#1e40af'}}>
                <CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} />
                Only verified users receive alerts.
              </p>
              <p style={{ fontSize: '14px', color: '#6b21a8' }}>
                Issues? Feel Free to Email{' '}
                <a
                  href="mailto:TaranshG.Dev@gmail.com?subject=Snow%20Day%20Notifier%20Issue"
                  style={{ color: '#6b21a8', fontWeight: 700, textDecoration: 'underline' }}
                >
                  TaranshG.Dev@gmail.com
                </a>
              </p>
              {/* Builder credit */}
              <div style={{
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                Built by{' '}
                <a
                  href="https://www.linkedin.com/in/taransh-goyal-6a52b8296/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#2563eb',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Taransh Goyal <Linkedin size={14} />
                </a>
                </div>

            </div>
          </div>
        )}

        {view === 'success' && (
          <div style={styles.card}>
            <div style={{textAlign: 'center'}}>
              <CheckCircle size={80} color="#10b981" style={{margin: '0 auto 24px'}} />
              <h2 style={{fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px'}}>
                You're Almost There! 🎉
              </h2>
              <p style={{color: '#6b7280', marginBottom: '32px', lineHeight: '1.6'}}>
                We've sent a verification email to<br />
                <strong style={{color: '#3b82f6', fontSize: '18px'}}>{submittedEmail}</strong>
                <br /><br />
                Click the link to activate your snow day alerts.
              </p>
              <button
                onClick={() => setView('signup')}
                style={{
                  ...styles.submitButton,
                  width: 'auto',
                  padding: '12px 32px'
                }}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Snowflake, Volume2, VolumeX, Share2, X, Copy, Check, Linkedin, Shield, Mail, Phone, ChevronDown } from 'lucide-react';

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
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const audioRef = useRef(null);
  const formRef = useRef(null);

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

  // Hide scroll hint after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    
    if (!formData.consent) {
      setError('Please check the consent box to receive alerts.');
      const consentCheckbox = document.getElementById('consent-checkbox');
      if (consentCheckbox) {
        consentCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

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
          setSubmittedEmail(formData.email);
          setView('success');
          setFormData({ email: '', phone: '', consent: false });
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const url = 'https://tinyurl.com/McMasterSnowDay';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2744 0%, #7093a9 50%, #2d5a7b 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    blob1: {
      position: 'absolute',
      top: '80px',
      left: '40px',
      width: '384px',
      height: '384px',
      background: '#4a90b8',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.25',
      animation: 'blob 7s infinite'
    },
    blob2: {
      position: 'absolute',
      top: '160px',
      right: '40px',
      width: '384px',
      height: '384px',
      background: '#5fa3c7',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.25',
      animation: 'blob 7s infinite 2s'
    },
    blob3: {
      position: 'absolute',
      bottom: '-32px',
      left: '80px',
      width: '384px',
      height: '384px',
      background: '#3b7ea1',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: '0.25',
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
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(12px)',
      padding: '12px',
      borderRadius: '50%',
      border: '1px solid rgba(255, 255, 255, 0.25)',
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
      background: 'linear-gradient(135deg, #1e6b96 0%, #2b7fa8 100%)',
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
      background: 'linear-gradient(135deg, #1e6b96 0%, #2b7fa8 100%)',
      padding: '16px',
      borderRadius: '50%',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(30, 107, 150, 0.4)',
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
      background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(250,250,250,0.95) 100%)',
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
      background: 'rgba(255, 255, 255, 0.08)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
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
      background: 'linear-gradient(135deg, #2b7fa8 0%, #1e6b96 100%)',
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
      color: '#c7e0ed'
    },
    main: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '900px',
      margin: '0 auto',
      padding: '48px 24px'
    },
    card: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '48px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.4)',
      animation: 'slideUp 0.5s ease-out'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
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
      border: '2px solid #d1d5db',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.3s',
      background: 'white'
    },
    submitButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #1e6b96 0%, #2b7fa8 100%)',
      color: 'white',
      padding: '18px',
      borderRadius: '16px',
      border: 'none',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 20px 40px rgba(30, 107, 150, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.3s',
      position: 'relative'
    },
    copyButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
    },
    scrollHint: {
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      opacity: showScrollHint ? 1 : 0,
      transition: 'opacity 0.5s',
      pointerEvents: showScrollHint ? 'auto' : 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
        
        html {
          scroll-behavior: smooth;
        }
        
        input:focus, button:focus, a:focus {
          outline: 3px solid #2b7fa8;
          outline-offset: 2px;
        }
        
        input:focus {
          border-color: #1e6b96 !important;
          box-shadow: 0 0 0 3px rgba(30, 107, 150, 0.15);
        }
        
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 50px rgba(30, 107, 150, 0.4);
        }
        
        button:not(:disabled):active {
          transform: translateY(0);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          width: 20px;
          height: 20px;
          animation: spin 0.6s linear infinite;
        }
        
        input[type="checkbox"] {
          accent-color: #1e6b96;
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
          .scroll-hint-mobile {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .mobile-header-content { padding: 16px 16px !important; }
          .mobile-logo-icon { padding: 10px !important; }
          .mobile-logo-icon svg { width: 24px !important; height: 24px !important; }
          .mobile-title { font-size: 20px !important; }
          .mobile-subtitle { font-size: 12px !important; }
          .mobile-main { padding: 24px 16px !important; padding-bottom: 100px !important; }
          .mobile-card { padding: 24px !important; border-radius: 20px !important; }
          .mobile-card-title { font-size: 24px !important; }
          .mobile-card-subtitle { font-size: 14px !important; margin-bottom: 24px !important; }
          .mobile-form-group { margin-bottom: 20px !important; }
          .mobile-label { font-size: 12px !important; margin-bottom: 6px !important; }
          .mobile-input { padding: 12px 14px !important; font-size: 16px !important; }
          .mobile-helper-text { font-size: 11px !important; margin-top: 6px !important; }
          .mobile-submit-button { padding: 16px !important; font-size: 16px !important; }
          .mobile-info-box { padding: 16px !important; margin-top: 24px !important; }
          .mobile-info-text { font-size: 13px !important; }
          .mobile-control-buttons { top: 12px !important; right: 12px !important; gap: 6px !important; }
          .mobile-control-button { padding: 10px !important; }
          .mobile-control-button svg { width: 20px !important; height: 20px !important; }
          .mobile-share-panel { padding: 24px !important; }
          .mobile-share-title { font-size: 24px !important; margin-bottom: 24px !important; }
          .mobile-qr-container { width: 200px !important; height: 200px !important; padding: 16px !important; margin-bottom: 24px !important; }
          .mobile-qr-img { width: 168px !important; height: 168px !important; }
          .mobile-url-text { font-size: 16px !important; padding: 12px 16px !important; }
          .mobile-success-icon { width: 60px !important; height: 60px !important; margin-bottom: 20px !important; }
          .mobile-success-title { font-size: 28px !important; margin-bottom: 12px !important; }
          .mobile-success-text { font-size: 14px !important; margin-bottom: 24px !important; }
          .mobile-security-modal { padding: 24px !important; max-width: 95% !important; }
          .mobile-security-title { font-size: 20px !important; }
          .mobile-security-content { font-size: 14px !important; }
        }

        @media (max-width: 400px) {
          .mobile-card-title { font-size: 22px !important; }
          .mobile-title { font-size: 18px !important; }
          .mobile-qr-container { width: 180px !important; height: 180px !important; }
          .mobile-qr-img { width: 148px !important; height: 148px !important; }
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

      <div style={styles.controlButtons} className="mobile-control-buttons">
        <button 
          onClick={toggleSnow} 
          style={styles.controlButton}
          className="mobile-control-button"
          title={snowEnabled ? "Disable snow" : "Enable snow"}
          aria-label={snowEnabled ? "Disable snow animation" : "Enable snow animation"}
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
          className="mobile-control-button"
          title={isMusicPlaying ? "Mute music" : "Play music"}
          aria-label={isMusicPlaying ? "Mute background music" : "Play background music"}
        >
          {isMusicPlaying ? <Volume2 color="white" size={24} /> : <VolumeX color="white" size={24} />}
        </button>
      </div>

      {view === 'signup' && (
        <div 
          style={styles.scrollHint} 
          onClick={scrollToForm}
          className="scroll-hint-mobile"
        >
          <p style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Scroll to sign up
          </p>
          <ChevronDown 
            color="white" 
            size={28} 
            style={{
              animation: 'bounce 2s infinite',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      )}

      <audio ref={audioRef} loop>
        <source src="/Only.mp3" type="audio/mpeg" />
      </audio>

      <div 
        className="share-tab-desktop"
        style={styles.shareTabDesktop}
        onClick={() => setSharePanel(true)}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) translateX(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) translateX(0)'}
        aria-label="Open share panel"
      >
        <Share2 color="white" size={24} />
      </div>

      <div 
        className="share-button-mobile"
        style={styles.shareButtonMobile}
        onClick={() => setSharePanel(true)}
        aria-label="Share this page"
      >
        <Share2 color="white" size={28} />
      </div>

      <div style={styles.sharePanel} className="mobile-share-panel">
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
          aria-label="Close share panel"
        >
          <X size={24} color="#6b7280" />
        </button>

        <Snowflake size={48} color="#1e6b96" style={{marginBottom: '24px'}} />
        
        <h2 className="mobile-share-title" style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Scan to Sign Up
        </h2>

        <div className="mobile-qr-container" style={{
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
            className="mobile-qr-img"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
            alt="QR Code for Snow Day Alert System"
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
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '2px solid #1e6b96'
        }}>
          <p className="mobile-url-text" style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#0c4a6e',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            tinyurl.com/McmasterSnowDays
          </p>
        </div>

        <button 
          onClick={copyLink}
          style={styles.copyButton}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Copy link to clipboard"
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
          aria-label="Close share panel"
        />
      )}

      {showSecurityModal && (
        <>
          <div 
            onClick={() => setShowSecurityModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99
            }}
            aria-label="Close security modal"
          />
          <div className="mobile-security-modal" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            zIndex: 100,
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          role="dialog"
          aria-labelledby="security-modal-title"
          >
            <button
              onClick={() => setShowSecurityModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
              aria-label="Close security information"
            >
              <X size={24} color="#374151" />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Shield size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h2 id="security-modal-title" className="mobile-security-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                Your Data is Secure
              </h2>
            </div>

            <div className="mobile-security-content" style={{ color: '#374151', lineHeight: '1.7', fontSize: '15px' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                How we protect your information:
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#0c4a6e' }}>🔒 Encrypted Storage:</strong>
                <p style={{ marginTop: '4px', color: '#6b7280' }}>
                  Your email and phone number are stored securely using encrypted databases and strict access controls.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#0c4a6e' }}>✉️ Email Verification:</strong>
                <p style={{ marginTop: '4px', color: '#6b7280' }}>
                  We verify your email before sending alerts to prevent spam and unauthorized subscriptions.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#0c4a6e' }}>🚫 No Data Sharing:</strong>
                <p style={{ marginTop: '4px', color: '#6b7280' }}>
                  We never sell, rent, or share your personal information. Your data is used <strong>only</strong> to send snow day notifications.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#0c4a6e' }}>🗑️ Easy Unsubscribe:</strong>
                <p style={{ marginTop: '4px', color: '#6b7280' }}>
                  You can unsubscribe at any time through the link in your verification email or any alert email. Your data is immediately deleted when you unsubscribe.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#0c4a6e' }}>🔐 Protected Links:</strong>
                <p style={{ marginTop: '4px', color: '#6b7280' }}>
                  All verification and unsubscribe links use unique, randomly-generated tokens that expire to prevent unauthorized access.
                </p>
              </div>

              <div style={{ 
                marginTop: '24px', 
                padding: '16px', 
                background: '#f0fdf4', 
                borderRadius: '12px',
                border: '1px solid #86efac'
              }}>
                <p style={{ fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                  💚 This is a student-run project built with security and privacy as top priorities. We only collect what's necessary to send you alerts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #1e6b96 0%, #2b7fa8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </>
      )}

      <header style={styles.header}>
        <div style={styles.headerContent} className="mobile-header-content">
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon} className="mobile-logo-icon">
              <Bell color="white" size={32} />
            </div>
            <div>
              <h1 style={styles.title} className="mobile-title">McMaster Snow Day</h1>
              <p style={styles.subtitle} className="mobile-subtitle">Never miss a snow day alert</p>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main} className="mobile-main">
        {view === 'signup' && (
          <div style={styles.card} className="mobile-card" ref={formRef}>
            <h2 className="mobile-card-title" style={{fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textAlign: 'center'}}>
              Get Instant Snow Day Alerts ❄️
            </h2>
            <p className="mobile-card-subtitle" style={{color: '#6b7280', marginBottom: '32px', textAlign: 'center', lineHeight: '1.6'}}>
              Sign up to receive instant notifications when McMaster announces a snow day
            </p>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup} className="mobile-form-group">
                <label style={styles.label} className="mobile-label" htmlFor="email-input">
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="your.email@mcmaster.ca"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  className="mobile-input"
                  required
                  aria-required="true"
                />
                <p className="mobile-helper-text" style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '8px',
                marginLeft: '5px',
                fontStyle: 'italic'
                }}>
                  We'll only email you if McMaster officially declares a snow day.
                </p>
              </div>

              <div style={styles.formGroup} className="mobile-form-group">
                <label style={styles.label} className="mobile-label" htmlFor="phone-input">
                  <Phone size={14} />
                  Phone Number (Optional for SMS)
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="+1 (416) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  className="mobile-input"
                />
                <p className="mobile-helper-text" style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '8px',
                marginLeft: '5px',
                fontStyle: 'italic'
                }}>
                  You'll only receive a text on an actual snow day.
                </p>
              </div>

              <div style={{marginBottom: '8px'}}>
                <label style={{display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer'}} htmlFor="consent-checkbox">
                  <input
                    id="consent-checkbox"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                    style={{width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0, marginTop: '2px'}}
                    aria-required="true"
                  />
                  <span style={{fontSize: '14px', color: '#374151', lineHeight: '1.5'}}>
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

              
              <p style={{marginTop: '12px', marginBottom: '16px', fontSize: '14px', color: '#6b7280'}}>
                🔒 Your email is private. We never share your data.
              </p>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: (isSubmitting || !formData.consent) ? 0.7 : 1,
                  cursor: (isSubmitting || !formData.consent) ? 'not-allowed' : 'pointer'
                }}
                className="mobile-submit-button"
                disabled={isSubmitting || !formData.consent}
                aria-label={isSubmitting ? 'Submitting signup form' : 'Submit signup form'}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Signing up...
                  </>
                ) : (
                  <>
                    <Bell size={20} />
                    Get Alerts
                  </>
                )}
              </button>

            </form>
            
            {error && (
              <div 
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: '#fee2e2',
                  border: '2px solid #fca5a5',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '14px'
                }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="mobile-info-box" style={{marginTop: '32px', padding: '20px', background: '#e0f2fe', borderRadius: '12px', border: '2px solid #7dd3fc'}}>
              <p className="mobile-info-text" style={{fontSize: '14px', color: '#0c4a6e', marginBottom: '8px'}}>
                <CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} />
                You'll receive a verification email after signing up.
              </p>
              <p className="mobile-info-text" style={{fontSize: '14px', color: '#0c4a6e', marginBottom: '8px'}}>
                <CheckCircle size={16} style={{display: 'inline', marginRight: '6px'}} />
                Only verified users receive alerts.
              </p>
              <p className="mobile-info-text" style={{fontSize: '14px', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px'}}>
                <Shield size={16} style={{display: 'inline', flexShrink: 0, marginTop: '2px'}} />
                <span>
                  Your data is encrypted and secure.{' '}
                  <button
                    onClick={() => setShowSecurityModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0c4a6e',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: 0,
                      fontWeight: '600'
                    }}
                    aria-label="Learn more about security"
                  >
                    Learn more
                  </button>
                </span>
              </p>
              <p className="mobile-info-text" style={{ fontSize: '14px', color: '#7c3aed' }}>
                Issues? Feel Free to Email{' '}
                <a
                  href="mailto:TaranshG.Dev@gmail.com?subject=Snow%20Day%20Notifier%20Issue"
                  style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  TaranshG.Dev@gmail.com
                </a>
              </p>
              <p className="mobile-info-text" style={{ fontSize: '12px', color: '#0c4a6e' }}>
                This is a student-run project and is independent of McMaster University :D
              </p>
              <div style={{
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px solid #cbd5e1',
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
                    color: '#1e6b96',
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
          <div style={styles.card} className="mobile-card">
            <div style={{textAlign: 'center'}}>
              <CheckCircle className="mobile-success-icon" size={80} color="#10b981" style={{margin: '0 auto 24px'}} />
              <h2 className="mobile-success-title" style={{fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px'}}>
                You're Almost There! 🎉
              </h2>
              <p className="mobile-success-text" style={{color: '#6b7280', marginBottom: '32px', lineHeight: '1.6'}}>
                We've sent a verification email to<br />
                <strong style={{color: '#1e6b96', fontSize: '18px', wordBreak: 'break-all'}}>{submittedEmail}</strong>
                <br /><br />
                Click the link to activate your snow day alerts. If you don't see the email, please check your spam folder :D
              </p>
              <button
                onClick={() => setView('signup')}
                style={{
                  ...styles.submitButton,
                  width: 'auto',
                  padding: '12px 32px'
                }}
                aria-label="Return to signup form"
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
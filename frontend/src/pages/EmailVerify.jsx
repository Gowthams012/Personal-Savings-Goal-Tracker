import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmailVerify = () => {
  const { userData, backendUrl, getUserData } = useContext(AppContext);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  // No need for userEmail state, always use userData.email
  const navigate = useNavigate();

  // No need for getEmailFromCookie, always use userData

  // Auto-send OTP when userData is loaded
  useEffect(() => {
    if (userData && userData._id) {
      sendOTP();
    } else if (userData && !userData._id) {
      setError('User not found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [userData]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Function to send OTP (use userId)
  const sendOTP = async () => {
    try {
      if (!userData?._id) {
        setError('User not found. Please log in again.');
        return;
      }
      const response = await axios.post(`${backendUrl}/api/auth/send-otp`, {
        userId: userData._id
      }, { withCredentials: true });
      if (response.data.success) {
        setResendTimer(60); // Start 1 minute countdown
        setError('');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    setError('');
    try {
      await sendOTP();
      setSuccess('OTP sent successfully to your email!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle form submission (use userId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!userData?._id) {
      setError('User not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-user`, {
        userId: userData._id,
        otp: otp.trim(),
      }, { withCredentials: true });
      if (response.data.success || response.data.sucess) {
        setSuccess('Email verified successfully! Redirecting...');
        if (getUserData) {
          await getUserData();
        }
        setTimeout(() => navigate('/account'), 1500);
      } else {
        setError(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Show error if userData is missing

  // Always render something, even if userData is missing
  if (!userData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>
        User not found or not loaded.<br />
        Please log in again or refresh the page.<br />
        <button style={{marginTop: 16, padding: '8px 20px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer'}} onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Verify Your Email</h2>
          <p style={styles.subtitle}>
            We've sent a 6-digit verification code to:<br />
            <strong style={styles.email}>{userData?.email || 'your email'}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Enter the 6-digit OTP sent to your email:
          </label>
          
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            style={styles.otpInput}
            placeholder="------"
            disabled={loading}
            autoFocus
          />

          {/* Messages */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={styles.successMessage}>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              ...styles.submitButton,
              ...(loading || otp.length !== 6 ? styles.disabledButton : {})
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Button */}
          <div style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <p style={styles.timerText}>
                Resend OTP in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                style={{
                  ...styles.resendButton,
                  ...(isResending ? styles.disabledButton : {})
                }}
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Didn't receive the code? Check your spam folder.
          </p>
          <button
            onClick={() => navigate('/account')}
            style={styles.backButton}
          >
            ← Back to Account
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  card: {
    maxWidth: '450px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  },

  header: {
    padding: '2.5rem 2rem 1.5rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },

  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  },

  subtitle: {
    color: '#64748b',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    margin: 0
  },

  email: {
    color: '#3b82f6',
    fontSize: '0.9rem'
  },

  form: {
    padding: '2rem'
  },

  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem'
  },

  otpInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: '0.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    background: '#ffffff',
    color: '#1e293b',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    boxSizing: 'border-box'
  },

  submitButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },

  resendContainer: {
    textAlign: 'center',
    marginBottom: '1rem'
  },

  resendButton: {
    background: 'none',
    border: '2px solid #e2e8f0',
    color: '#64748b',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },

  timerText: {
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
    padding: '0.75rem'
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  errorMessage: {
    padding: '1rem',
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid #fecaca'
  },

  successMessage: {
    padding: '1rem',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid #bbf7d0'
  },

  footer: {
    padding: '1.5rem 2rem',
    background: '#f8fafc',
    textAlign: 'center',
    borderTop: '1px solid #e2e8f0'
  },

  footerText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  },

  backButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'underline'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(styleSheet);

export default EmailVerify;
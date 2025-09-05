import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const ResetPassword = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(userData?.email || getEmailFromCookie() || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Helper: get email from cookies if present
  function getEmailFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userEmail') return decodeURIComponent(value);
    }
    return '';
  }

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/reset-password-otp`, { email });
      if (res.data.success) {
        setSuccess('OTP sent to your email.');
        setStep(2);
        setResendTimer(60);
      } else {
        setError(res.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP.'); return; }
    setStep(3);
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email, otp, newPassword
      });
      if (res.data.success) {
        setSuccess('Password reset successfully! You can now log in.');
        setStep(4);
      } else {
        setError(res.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/reset-password-otp`, { email });
      if (res.data.success) {
        setSuccess('OTP resent to your email.');
        setResendTimer(60);
      } else {
        setError(res.data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  // Timer effect
  React.useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Themed styles
  const styles = {
    container: {
      minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem'
    },
    card: {
      maxWidth: 420, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      padding: '2.5rem', textAlign: 'center',
    },
    title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: 16 },
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, textAlign: 'left' },
    input: {
      width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: 8,
      marginBottom: 16, outline: 'none', color: '#1e293b', background: '#f8fafc',
      transition: 'border 0.2s',
    },
    button: {
      width: '100%', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
      border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: 12,
      transition: 'all 0.2s',
    },
    resendBtn: {
      background: 'none', border: '2px solid #e2e8f0', color: '#64748b', padding: '0.5rem 1.2rem', borderRadius: 8,
      fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: 8, marginBottom: 8,
      transition: 'all 0.2s',
    },
    error: {
      background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: 12, marginBottom: 12,
      fontWeight: 500, fontSize: '0.95rem',
    },
    success: {
      background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 12,
      fontWeight: 500, fontSize: '0.95rem',
    },
    spinner: {
      width: 20, height: 20, border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8
    }
  };

  // Add spinner animation
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Forgot / Reset Password</div>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoFocus
              required
              disabled={!!userData?.email}
            />
            <button style={styles.button} type="submit" disabled={loading}>{loading ? <span style={styles.spinner}></span> : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label style={styles.label}>Enter the 6-digit OTP sent to your email</label>
            <input
              style={styles.input}
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="------"
              autoFocus
              required
            />
            <button style={styles.button} type="submit" disabled={loading || otp.length !== 6}>{loading ? <span style={styles.spinner}></span> : 'Verify OTP'}</button>
            {resendTimer > 0 ? (
              <div style={{ color: '#64748b', marginTop: 8 }}>Resend OTP in {resendTimer}s</div>
            ) : (
              <button type="button" style={styles.resendBtn} onClick={handleResendOtp} disabled={loading}>Resend OTP</button>
            )}
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <label style={styles.label}>Confirm New Password</label>
            <input
              style={styles.input}
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <button style={styles.button} type="submit" disabled={loading}>{loading ? <span style={styles.spinner}></span> : 'Reset Password'}</button>
          </form>
        )}

        {step === 4 && (
          <div>
            <div style={{ color: '#059669', fontWeight: 600, marginBottom: 16 }}>Your password has been reset!</div>
            <a href="/login" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 500 }}>Go to Login</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

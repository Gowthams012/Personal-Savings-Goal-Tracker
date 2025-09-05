import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';

const Account = () => {
  const { userData, loading, setIsLoggedIn, setUserData } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // Delete account handler
  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setDeleteError('');
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      // Send DELETE request to backend
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/delete-account`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        data: { userId: userData._id }
      });
      // Clear context and storage
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      // Remove cookies
      ['token', 'authToken', 'accessToken'].forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
      });
      navigate('/signup');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Clear context state
      setIsLoggedIn(false);
      setUserData(null);
      
      // Clear all possible cookie variations
      const cookiesToClear = ['token', 'authToken', 'accessToken'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
      });
      
      // Clear localStorage and sessionStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.clear();
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if there's an error
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (isVerifying) return;
    
    setIsVerifying(true);
    try {
      navigate('/email-verify');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading account details...</p>
      </div>
    );
  }

  // No user data state
  if (!userData) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={styles.errorTitle}>Account Access Required</h3>
        <p style={styles.errorMessage}>
          No user data found. Please log in to view your account details.
        </p>
        <button 
          onClick={() => navigate('/login')} 
          style={styles.primaryButton}
        >
          Go to Login
        </button>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <details style={styles.debugContainer}>
            <summary style={styles.debugSummary}>Debug Info</summary>
            <pre style={styles.debugPre}>
              {JSON.stringify({
                userData,
                loading,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Account Details</h2>
          <div style={styles.userInfo}>
            <div style={styles.field}>
              <label style={styles.label}>Name:</label>
              <span style={styles.value}>{userData.name || 'Not provided'}</span>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email:</label>
              <div style={styles.emailContainer}>
                <span style={styles.value}>{userData.email || 'Not provided'}</span>
                {userData.emailVerified === false && (
                  <button 
                    onClick={handleVerifyEmail} 
                    disabled={isVerifying}
                    style={{
                      ...styles.verifyButton,
                      ...(isVerifying ? styles.buttonDisabled : {})
                    }}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </button>
                )}
                {userData.emailVerified === true && (
                  <span style={styles.verifiedBadge}>✓ Verified</span>
                )}
              </div>
            </div>
            {userData.createdAt && (
              <div style={styles.field}>
                <label style={styles.label}>Member since:</label>
                <span style={styles.value}>
                  {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div style={styles.actions}>
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut || isDeleting}
              style={{
                ...styles.logoutButton,
                ...(isLoggingOut ? styles.buttonDisabled : {})
              }}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || isLoggingOut}
              style={{
                ...styles.deleteButton,
                ...(isDeleting ? styles.buttonDisabled : {})
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            {deleteError && (
              <div style={styles.deleteError}>{deleteError}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  deleteButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s ease-in-out'
  },
  deleteError: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    marginTop: '1rem',
    fontSize: '0.95rem',
    textAlign: 'center'
  },
  container: {
    minHeight: '100vh',
    padding: '2rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  card: {
    maxWidth: '480px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '2.5rem',
    animation: 'fadeIn 0.3s ease-in-out'
  },
  
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '2rem',
    margin: 0
  },
  
  userInfo: {
    marginBottom: '2rem'
  },
  
  field: {
    marginBottom: '1.5rem'
  },
  
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  
  value: {
    fontSize: '1rem',
    color: '#111827',
    fontWeight: '500'
  },
  
  emailContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  
  verifyButton: {
    padding: '0.375rem 0.75rem',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      background: '#2563eb',
      transform: 'translateY(-1px)'
    }
  },
  
  verifiedBadge: {
    fontSize: '0.75rem',
    color: '#059669',
    fontWeight: '600',
    background: '#d1fae5',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px'
  },
  
  actions: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1.5rem'
  },
  
  logoutButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#2654dcff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      background: '#b91c1c',
      transform: 'translateY(-1px)'
    }
  },
  
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },
  
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    padding: '2rem',
    textAlign: 'center'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  
  errorContainer: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '2rem',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  
  errorTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '1rem'
  },
  
  errorMessage: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  
  debugContainer: {
    marginTop: '2rem',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  
  debugSummary: {
    padding: '0.75rem',
    background: '#f9fafb',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  
  debugPre: {
    margin: 0,
    padding: '1rem',
    fontSize: '0.75rem',
    color: '#6b7280',
    background: '#f8fafc',
    overflow: 'auto',
    maxHeight: '200px'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Account;
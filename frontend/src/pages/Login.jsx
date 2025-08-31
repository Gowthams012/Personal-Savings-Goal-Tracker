import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();
  const [state, setState] = useState('Sign In');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { backendUrl, setIsLoggedIn, getUserData, isLoggedIn } = useContext(AppContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const css = `
    .login-page-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f9fafb; font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 1rem; }
    .login-container { width: 100%; max-width: 26rem; background-color: #ffffff; padding: 2rem 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); text-align: center; }
    .logo-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #111827; font-size: 1.5rem; font-weight: 600; text-decoration: none; margin-bottom: 1.5rem; }
    .logo-icon { height: 2rem; width: 2rem; color: #2563eb; }
    .login-title { font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
    .login-subtitle { font-size: 0.9rem; color: #6b7280; margin-bottom: 2rem; }
    .login-form { text-align: left; }
    .input-group { margin-bottom: 1.25rem; }
    .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
    .input-field { width: 100%; padding: 0.65rem 0.75rem; font-size: 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
    .input-field:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
    .options-container { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 1.5rem; height: 1.25rem; }
    .forgot-password-link { font-size: 0.875rem; color: #2563eb; text-decoration: none; font-weight: 500; }
    .forgot-password-link:hover { text-decoration: underline; }
    .login-button { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; font-weight: 600; color: #ffffff; background-color: #2563eb; border: none; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.2s; }
    .login-button:hover { background-color: #1d4ed8; }
    .login-button:disabled { background-color: #9ca3af; cursor: not-allowed; }
    .signup-link-container { margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280; }
    .signup-link { color: #2563eb; font-weight: 500; text-decoration: none; cursor: pointer; }
    .signup-link:hover { text-decoration: underline; }
    .error-message { color: #dc2626; font-size: 0.85rem; margin-top: 0.25rem; display: block; }
  `;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(false);
    setPasswordError(false);

    try {
      axios.defaults.withCredentials = true;
      
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password
      });

      const data = response.data;
      console.log('Login response:', data);

  // Fixed typo: use 'sucess' to match backend
  if (data.sucess) {
        toast.success('Login successful!');
        setIsLoggedIn(true);
        // Wait for userData to be set before navigating
        await getUserData();
  setTimeout(() => navigate('/dashboard'), 100); // slight delay to ensure context updates
      } else {
        handleLoginError(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data) {
        handleLoginError(error.response.data.message);
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (message) => {
    if (message === 'User does not exist') {
      toast.error('No account found for this email.');
      setEmailError(true);
      setTimeout(() => setEmailError(false), 3000);
    } else if (message === 'Invalid password') {
      toast.error('Incorrect password.');
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
    } else {
      toast.error(message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="login-page-container">
        <div className="login-container">
          <Link to="/" className="logo-container">
            <img src="/target.svg" alt="FundFlow Logo" className="logo-icon" />
            FundFlow
          </Link>

          <h1 className="login-title">Welcome Back!</h1>
          <p className="login-subtitle">Sign in to continue to your account.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={emailError ? { borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)' } : {}}
              />
              {emailError && (
                <span className="error-message">No account found for this email.</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={passwordError ? { borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)' } : {}}
              />
              {passwordError && (
                <span className="error-message">Incorrect password. Please try again.</span>
              )}
            </div>

            <div className="options-container">
              <Link to="/reset-password" className="forgot-password-link">Forgot password?</Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="signup-link-container">
            Don't have an account?
            <Link to="/signup" className="signup-link"> Sign up</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
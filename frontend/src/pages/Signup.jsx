import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const { backendUrl, setIsLoggedIn, getUserData, isLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const css = `
    .signup-page-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background-color: #f9fafb; font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 1rem; }
    .signup-container { width: 100%; max-width: 26rem; background-color: #ffffff; padding: 2rem 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); text-align: center; }
    .logo-container { display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #111827; font-size: 1.5rem; font-weight: 600; text-decoration: none; margin-bottom: 1.5rem; }
    .logo-icon { height: 2rem; width: 2rem; color: #2563eb; }
    .signup-title { font-size: 1.75rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
    .signup-subtitle { font-size: 0.9rem; color: #6b7280; margin-bottom: 2rem; }
    .signup-form { text-align: left; }
    .input-group { margin-bottom: 1.25rem; }
    .input-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
    .input-field { width: 100%; padding: 0.65rem 0.75rem; font-size: 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
    .input-field:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
    .signup-button { width: 100%; padding: 0.75rem 1rem; font-size: 1rem; font-weight: 600; color: #ffffff; background-color: #2563eb; border: none; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.2s; }
    .signup-button:hover { background-color: #1d4ed8; }
    .signup-button:disabled { background-color: #9ca3af; cursor: not-allowed; }
    .signin-link-container { margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280; }
    .signin-link { color: #2563eb; font-weight: 500; text-decoration: none; cursor: pointer; }
    .signin-link:hover { text-decoration: underline; }
    .error-message { color: #dc2626; font-size: 0.85rem; margin-top: 0.25rem; display: block; }
  `;

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError(false);
    setPasswordError(false);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setPasswordError(true);
      setLoading(false);
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
      });
      const data = response.data;
      console.log("Signup response:", data);
      if (data.sucess) {
        toast.success("Signup successful! Please verify your email.");
        setIsLoggedIn(true);
        await getUserData();
  setTimeout(() => navigate('/dashboard'), 200);
      } else {
        handleSignupError(data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response && error.response.data) {
        handleSignupError(error.response.data.message);
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupError = (message) => {
    if (message === "User already exists") {
      toast.error("An account with this email already exists.");
      setEmailError(true);
      setTimeout(() => setEmailError(false), 3000);
    } else {
      toast.error(message || "Signup failed. Please try again.");
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="signup-page-container">
        <div className="signup-container">
          <Link to="/" className="logo-container">
            <img src="/target.svg" alt="FundFlow Logo" className="logo-icon" />
            FundFlow
          </Link>

          <h1 className="signup-title">Create Your Account</h1>
          <p className="signup-subtitle">Join FundFlow and take control of your finances.</p>

          <form className="signup-form" onSubmit={handleSignup}>
            <div className="input-group">
              <label htmlFor="name" className="input-label">Full Name</label>
              <input
                type="text"
                id="name"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                <span className="error-message">Email already exists.</span>
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
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={passwordError ? { borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)' } : {}}
              />
              {passwordError && (
                <span className="error-message">Passwords do not match.</span>
              )}
            </div>

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="signin-link-container">
            Already have an account?
            <Link to="/login" className="signin-link"> Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;

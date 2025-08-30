import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // ✅ correct import
import toast from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [state, setState] = useState('Sign In'); // ✅ default should be Sign In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { backendUrl, setIsLoggedIn ,getUserData} = useContext(AppContext); // ✅ use AppContext

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
    .signup-link-container { margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280; }
    .signup-link { color: #2563eb; font-weight: 500; text-decoration: none; cursor: pointer; }
    .signup-link:hover { text-decoration: underline; }
  `;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { email, password });

      // mock token
      const mockAuthToken = 'aBcDeFgHiJkLmNoPqRsTuVwXyZ123456';
      Cookies.set('auth_token', mockAuthToken, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('user_email', email, { expires: 7 });
      
      axios.defaults.withCredentials  = true;

      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, { 
          name: email.split('@')[0], 
          email, 
          password 
        });
        if (data.success) {
          alert(data.message);
          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
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
              />
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
              />
            </div>

            <div className="options-container">
              <a href="/reset-password" className="forgot-password-link">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">
              Sign In
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

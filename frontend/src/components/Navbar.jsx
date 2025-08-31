import React, { useState, useContext } from 'react';
// Import NavLink from react-router-dom
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Cookies from 'js-cookie';

const Navbar = () => {
  // The 'active' state is no longer needed, NavLink handles it automatically.
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Destructure state from context. 'isLoggedIn' was unused, so it's removed.
  const { userData, setUserData, setIsLoggedIn, loading } = useContext(AppContext);

  // Logout handler remains the same
  const handleLogout = () => {
    Cookies.remove('token');
    setUserData(null);
    setIsLoggedIn(false);
    setIsOpen(false); // Close mobile menu on logout
    navigate('/login');
  };
  
  // Inline CSS is kept as is, but consider moving to a .css file or a CSS-in-JS library.
  const css = `
    .navbar { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; width: 100%; position: sticky; top: 0; z-index: 50; }
    .nav-container { max-width: 72rem; margin: 0 auto; padding: 0 1rem; }
    .nav-content { display: flex; align-items: center; justify-content: space-between; height: 4rem; }
    .logo { display: flex; align-items: center; font-size: 1.125rem; font-weight: 600; text-decoration: none; color: #111827; }
    .logo-icon { height: 32px; width: 32px; margin-right: 0.5rem; }
    .nav-link { font-size: 0.9rem; font-weight: 500; text-decoration: none; color: #4b5563; cursor: pointer; position: relative; padding-bottom: 0.5rem; background: none; border: none; font-family: inherit; }
    .nav-link:hover { color: #1d4ed8; }
    .nav-link.active { color: #1d4ed8; }
    .nav-right-items { display: flex; align-items: center; gap: 1rem; }
    .user-initial { font-size: 1.1rem; font-weight: bold; color: #fff; background-color: #2563eb; border-radius: 50%; min-width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; }
    .mobile-menu-button { display: flex; padding: 0.5rem; background: none; border: none; cursor: pointer; color: #4b5563; }
    .mobile-menu { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; }
    .mobile-nav-links { display: flex; flex-direction: column; padding: 0.5rem 1rem 1rem; gap: 0.5rem; }
    .mobile-nav-link { font-size: 1rem; font-weight: 500; padding: 0.75rem 0.5rem; border-radius: 0.25rem; cursor: pointer; color: #374151; text-decoration: none; display: block; background: none; border: none; text-align: left; width: 100%; font-family: inherit; }
    .mobile-nav-link:hover { background-color: #f3f4f6; }
    .mobile-nav-link.active { color: #1d4ed8; background-color: #eff6ff; }
    @media (min-width: 768px) { .mobile-menu-button { display: none; } .desktop-account { display: flex !important; } }
    @media (max-width: 767px) { .desktop-account { display: none !important; } }
  `;

  // The custom NavLink component is removed as we now use the one from react-router-dom.

  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">
              <img src="/target.svg" alt="FundFlow Logo" className="logo-icon" />
              FundFlow
            </Link>
            <div className="nav-right-items">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <style>{css}</style>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
              <img src="/target.svg" alt="FundFlow Logo" className="logo-icon" />
              FundFlow
            </Link>

            <div className="nav-right-items">
              <div className="desktop-account">
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Login
                </NavLink>
              </div>
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="mobile-menu-button"
                aria-label="Toggle mobile menu"
                aria-expanded={isOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              <NavLink
                to="/login"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                Login
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
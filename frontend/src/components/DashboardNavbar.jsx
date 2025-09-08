import React, { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData, loading } = useContext(AppContext);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contribution History', path: '/contribution-history' },
    { name: 'Goals', path: '/goals' },
    { name: 'About Us', path: '/about' },
    { name: 'Account', path: '/account' },
  ];

  // Combined and enhanced CSS
  const css = `
    .navbar { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; width: 100%; position: sticky; top: 0; z-index: 50; }
    .nav-container { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
    .nav-content { display: flex; align-items: center; justify-content: space-between; height: 4.5rem; }
    
    .logo { display: flex; align-items: center; font-size: 1.25rem; font-weight: 600; text-decoration: none; color: #111827; }
    .logo-icon { height: 32px; width: 32px; margin-right: 0.75rem; }
    
    .nav-center { display: flex; align-items: center; gap: 1.5rem; }
    .nav-link { font-size: 0.95rem; font-weight: 500; text-decoration: none; color: #4b5563; cursor: pointer; padding: 0.5rem 0; border-bottom: 2px solid transparent; transition: all 0.2s ease-in-out; }
    .nav-link:hover { color: #1d4ed8; border-bottom-color: #93c5fd; }
    .nav-link.active { color: #1d4ed8; font-weight: 600; border-bottom-color: #2563eb; }
    
    .nav-right-items { display: flex; align-items: center; gap: 1rem; }
    .user-initial { font-size: 1.1rem; font-weight: bold; color: #fff; background-color: #2563eb; border-radius: 50%; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; }
    
    .mobile-menu-button { display: none; padding: 0.5rem; background: none; border: none; cursor: pointer; color: #4b5563; }
    
    .mobile-menu { background-color: #ffffff; border-bottom: 1px solid #e5e7eb; }
    .mobile-nav-links { display: flex; flex-direction: column; padding: 0.5rem 1rem 1rem; gap: 0.5rem; }
    .mobile-nav-link { font-size: 1rem; font-weight: 500; padding: 0.75rem 0.5rem; border-radius: 0.375rem; cursor: pointer; color: #374151; text-decoration: none; display: block; }
    .mobile-nav-link:hover { background-color: #f3f4f6; }
    .mobile-nav-link.active { color: #1d4ed8; background-color: #eff6ff; }
    
    @media (max-width: 1024px) {
      .nav-center { display: none; }
      .mobile-menu-button { display: flex; }
    }
  `;

  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container"><div className="nav-content">Loading...</div></div>
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
              <span>FundFlow</span>
            </Link>

            <div className="nav-center">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="nav-right-items">
              {userData && (
                <span className="user-initial">{userData.name ? userData.name[0].toUpperCase() : 'U'}</span>
              )}
               <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="mobile-menu-button"
                aria-label="Toggle mobile menu"
                aria-expanded={isOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                 <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default DashboardNavbar;

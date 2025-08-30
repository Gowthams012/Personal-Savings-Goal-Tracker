import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [active, setActive] = useState('Home');
  const [isOpen, setIsOpen] = useState(false);

  const loginItem = 'Login';
  const navigate = useNavigate();

  const css = `
    .navbar {
      background-color: #ffffff;
      font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      position: sticky;
      top: 0;
      z-index: 50;
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
    }
    .nav-container {
      max-width: 72rem;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4rem;
    }
    .logo {
      display: flex;
      align-items: center;
      color: #111827;
      font-size: 1.125rem;
      font-weight: 600;
      text-decoration: none;
    }
    .logo-icon {
      height: 32px;
      width: 32px;
      margin-right: 0.5rem;
      padding-bottom: 0;
    }
    .nav-link {
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      color: #4b5563;
      transition: color 0.2s ease;
      position: relative;
      padding-bottom: 0.5rem;
    }

    .nav-link:hover {
      color: #1d4ed8;
    }
    
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #2563eb;
      transform: scaleX(0);
      transition: transform 0.2s ease-out;
    }

    .nav-link:hover::after,
    .nav-link.active::after {
      transform: scaleX(1);
    }

    .nav-link.active {
      color: #1d4ed8;
    }

    .nav-right-items {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      color: #4b5563;
      background: none;
      border: none;
      cursor: pointer;
    }
    
    .mobile-menu {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 1rem 1rem;
      gap: 0.5rem;
    }

    .mobile-nav-link {
      font-size: 1rem;
      font-weight: 500;
      color: #374151;
      text-decoration: none;
      padding: 0.75rem 0.5rem;
      border-radius: 0.25rem;
    }

    .mobile-nav-link:hover {
      background-color: #f3f4f6;
    }

    .mobile-nav-link.active {
      color: #1d4ed8;
      background-color: #eff6ff;
    }

    /* Responsive */
    @media (min-width: 768px) {
      .mobile-menu-button {
        display: none;
      }
      .desktop-account {
        display: block;
      }
    }
    @media (max-width: 767px) {
      .desktop-account {
        display: none;
      }
    }
  `;

  // Custom NavLink with React Router navigation
  const NavLink = ({ item, className, activeClassName, to }) => (
    <span
      onClick={() => {
        setActive(item);
        if (isOpen) setIsOpen(false);
        if (to) navigate(to); // navigate when "to" provided
      }}
      className={`${className} ${active === item ? activeClassName : ''}`}
    >
      {item}
    </span>
  );

  return (
    <>
      <style>{css}</style>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo" onClick={() => setActive('Home')}>
              <img src="/target.svg" alt="FundFlow Logo" className="logo-icon" />
              FundFlow
            </Link>

            <div className="nav-right-items">
              {/* Desktop Login */}
              <div className="desktop-account">
                <NavLink item={loginItem} className="nav-link" activeClassName="active" to="/login" />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="mobile-menu-button"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <svg
                  className="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <div className="mobile-nav-links">
              <NavLink item={loginItem} className="mobile-nav-link" activeClassName="active" to="/login" />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

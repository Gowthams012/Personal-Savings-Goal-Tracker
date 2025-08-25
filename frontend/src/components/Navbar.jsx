import React, { useState } from "react";
import { assets } from "../assets/assets";
import "./Navbar.css"; // we'll use a small CSS file for responsiveness

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="navbar">
      <div className="navbar-container">
        {/* Logo + Title */}
        <div className="navbar-logo">
          <img src={assets.logo} alt="logo" />
          <h2>TrackMySavings</h2>
        </div>

        {/* Desktop Links */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <a href="/home">Home</a>
          <a href="/contribution-history">Contribution History</a>
          <a href="/history">History</a>
          <a href="/about-us">About Us</a>
          <a href="/account">Account</a>
        </div>

        {/* Hamburger (mobile only) */}
        <div className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </div>
    </div>
  );
};

export default Navbar;

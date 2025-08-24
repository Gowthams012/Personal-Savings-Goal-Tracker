import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Splashscreen = () => {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const textTimer = setTimeout(() => setShowText(true), 1200);
    const subtextTimer = setTimeout(() => setShowSubtext(true), 1800);

    // Redirect to /home after 5 seconds
    const redirectTimer = setTimeout(() => navigate("/home"), 5000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(subtextTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Logo */}
      <div
        className={`mb-8 transform transition-all duration-1000 ease-out ${
          showLogo ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <div className="w-32 h-32 flex items-center justify-center">
          {assets.logo ? (
            <img
              src={assets.logo}
              alt="logo"
              style={{ width: '70px', height: '70px', objectFit: 'contain', paddingTop : '20px', paddingLeft : '10px' }}

            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">$</span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div
        className={`text-center mb-4 transform transition-all duration-[800ms] ease-out ${
          showText ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-1">
          Personal Savings Goal Tracker
        </h1>
      </div>

      {/* Subtitle */}
      <div
        className={`text-center transform transition-all duration-700 ease-out ${
          showSubtext ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <p className="text-gray-600 text-lg md:text-xl font-medium">
          Track your financial dreams, one goal at a time
        </p>
      </div>

      {/* Loading Dots */}
      <div
        className={`mt-12 transition-opacity duration-500 ${
          showSubtext ? "opacity-100" : "opacity-0"
        }`}
        style={{ paddingTop: '32px' }} // Add padding top for alignment
      >
        <div className="flex space-x-2 justify-center">
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
          <span className="loading-dot"></span>
        </div>
      </div>
    </div>
  );
};

export default Splashscreen;

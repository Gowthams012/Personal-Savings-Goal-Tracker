import React from 'react';

const Header = () => {
  // CSS is injected into a <style> tag for a self-contained component.
  const css = `
    @keyframes fadeInSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .splash-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 4rem); /* Full viewport height minus navbar */
      background-color: #f9fafb;
      font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 2rem;
      overflow: hidden; /* Hide overflow for animations */
    }

    .splash-content {
      text-align: center;
      max-width: 42rem; /* 672px */
      animation: fadeInSlideUp 0.8s ease-out forwards;
    }

    .splash-title {
      font-size: 2.25rem; /* 36px */
      font-weight: 800; /* Extra bold */
      color: #1f2937;
      line-height: 1.2;
      letter-spacing: -0.025em;
    }
    
    .splash-title .highlight {
      color: #eaba0aff; /* Blue accent color */
    }

    .splash-quote {
      margin-top: 1rem;
      font-size: 1.125rem; /* 18px */
      color: #4b5563;
      line-height: 1.75;
      max-width: 36rem; /* 576px */
      margin-left: auto;
      margin-right: auto;
    }

    .start-button {
      margin-top: 2.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      background-color: #2563eb;
      border: none;
      border-radius: 0.5rem; /* More rounded corners */
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }

    .start-button:hover {
      background-color: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25), 0 4px 6px -4px rgba(37, 99, 235, 0.25);
    }
    
    .start-button-icon {
      width: 1.25rem;
      height: 1.25rem;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;
    }

    .start-button:hover .start-button-icon {
      transform: translateX(3px);
    }

    /* Responsive adjustments */
    @media (min-width: 640px) {
      .splash-title {
        font-size: 3rem; /* 48px */
      }
    }
    
    @media (min-width: 768px) {
        .splash-title {
            font-size: 3.75rem; /* 60px */
        }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <main className="splash-container">
        <div className="splash-content">
          <h1 className="splash-title">
            Achieve Your Financial Goals with <span className="highlight">FundFlow</span>
          </h1>
          <p className="splash-quote">
            "The secret to getting ahead is getting started. Plan your future, track your progress, and watch your dreams become reality."
          </p>
          <a href="#goals" className="start-button">
            Get Started
            <svg 
              className="start-button-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </main>
    </>
  );
};

export default Header;

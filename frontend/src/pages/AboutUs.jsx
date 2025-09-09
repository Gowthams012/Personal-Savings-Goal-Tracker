import React from 'react'
import DashboardNavbar from '../components/DashboardNavbar'


const AboutUs = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fafdff' }}>
      <DashboardNavbar />
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e3eafc', padding: '48px 32px', marginTop: 32 }}>
        <h1 style={{ color: '#1976d2', fontWeight: 800, fontSize: 36, marginBottom: 16 }}>About FundFlow</h1>
        <p style={{ fontSize: 20, color: '#333', marginBottom: 32 }}>
          <b>FundFlow</b> is your personal savings goal tracker, designed to make your dreams achievable—one contribution at a time. Whether you're saving for a new gadget, a dream vacation, or a special gift, FundFlow helps you stay motivated, organized, and on track.
        </p>
        <h2 style={{ color: '#1976d2', fontWeight: 700, fontSize: 28, marginBottom: 12 }}>Our Vision</h2>
        <p style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          To empower everyone to achieve their financial goals with clarity, confidence, and joy. We believe that every dream—big or small—deserves a plan and a path to success.
        </p>
        <h2 style={{ color: '#1976d2', fontWeight: 700, fontSize: 28, marginBottom: 12 }}>Our Mission</h2>
        <p style={{ fontSize: 18, color: '#444', marginBottom: 24 }}>
          We make saving simple, social, and rewarding. FundFlow combines smart tracking, progress visualization, and a delightful user experience to turn your savings journey into a celebration.
        </p>
        <div style={{ background: '#e3f0ff', borderRadius: 12, padding: 24, margin: '32px 0', boxShadow: '0 1px 4px #e3eafc' }}>
          <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Why Choose FundFlow?</h3>
          <ul style={{ fontSize: 17, color: '#333', lineHeight: 1.7, paddingLeft: 24 }}>
            <li><b>Visual Progress:</b> See your savings grow with beautiful charts and progress bars.</li>
            <li><b>Goal Motivation:</b> Set, track, and celebrate every milestone—no matter how small.</li>
            <li><b>Easy Contributions:</b> Add savings anytime, from anywhere, and watch your dreams get closer.</li>
            <li><b>All-in-One Dashboard:</b> Manage multiple goals, view your history, and stay inspired.</li>
            <li><b>Secure & Private:</b> Your data is protected and only accessible to you.</li>
          </ul>
        </div>
        <div style={{ margin: '40px 0 24px 0', textAlign: 'center' }}>
          <h2 style={{ color: '#1976d2', fontWeight: 700, fontSize: 28, marginBottom: 10 }}>Ready to Start Your Savings Journey?</h2>
          <p style={{ fontSize: 18, color: '#444', marginBottom: 18 }}>
            Join FundFlow today and turn your wishes into reality. Because every rupee saved is a step closer to your goal!
          </p>
        </div>
        <div style={{ background: '#fafdff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px #e3eafc', marginTop: 24 }}>
          <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Contact Us</h3>
          <p style={{ fontSize: 17, color: '#333', marginBottom: 8 }}>
            Have questions, feedback, or want to partner with us?
          </p>
          <p style={{ fontSize: 17, color: '#1976d2', fontWeight: 600 }}>
            Email: <a href="mailto:slgowtham42@gmail.com" style={{ color: '#1976d2', textDecoration: 'underline' }}>slgowtham42@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs

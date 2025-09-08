import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import DashboardNavbar from './components/DashboardNavbar'
import Account from './pages/Account'
import ContributionHistory from './pages/ContributionHistory'
import Goals from './pages/Goals'
import AboutUs from './pages/AboutUs'

const App = () => {
  return (
    <div>
      <Routes>
        {/* Home Page */}
        <Route path='/' element={<Home />} />

        {/* Login Page */}
        <Route path='/login' element={<Login />} />

        {/* Signup Page */}
        <Route path='/signup' element={<Signup />} />

        {/* Reset Password Page */}
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Email Verification Page */}
        <Route path='/email-verify' element={<EmailVerify />} />

        {/* Dashboard Page */}
        <Route path='/dashboard' element={<Dashboard />} />

        {/* DashboardNavbar Page */}
        <Route path='/dashboard-nav' element={<DashboardNavbar />} />

        {/* Account Page */}
        <Route path='/account' element={<Account />} />

        {/* Contribution History Page */}
        <Route path='/contribution-history' element={<ContributionHistory />} />

        {/* Goals Page */}
        <Route path='/goals' element={<Goals />} />

        {/* About Us Page */}
        <Route path='/about' element={<AboutUs />} />

      </Routes>
    </div>
  )
}

export default App

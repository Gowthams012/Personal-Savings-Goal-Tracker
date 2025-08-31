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

      </Routes>
    </div>
  )
}

export default App

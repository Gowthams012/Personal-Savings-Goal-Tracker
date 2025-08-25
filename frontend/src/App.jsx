import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Splashscreen from './pages/Splashscreen'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Account from './pages/Account'
import Signup from './pages/Signup'
import EmailVerify from "./pages/EmailVerify";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Splashscreen />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/account' element={<Account/>}/>
        <Route path='/signup' element={<Signup/>}/>
         <Route path="/verify-email" element={<EmailVerify />} />
      </Routes>
    </div>
  )
}

export default App

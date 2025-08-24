import React from 'react'
import {assets} from '../assets/assets'

const Navbar = () => {
  return (
    <div className="w-full flex items-center justify-between p-4 sm:p-6 sm:px-24 absolute top-0">
      <img 
        src={assets.logo} 
        alt="logo" 
        style={{ width: '70px', height: '70px', objectFit: 'contain', paddingTop : '20px', paddingLeft : '10px' }}
      />
      <a
        href="/login"
        style={{
          paddingTop: '10px',
          paddingRight: '40px',
          cursor: 'pointer',
          fontSize: '15px',
          textDecoration: 'None',
          color: 'inherit'
        }}
      >
        Sign in
      </a>
    </div>
  )
}

export default Navbar

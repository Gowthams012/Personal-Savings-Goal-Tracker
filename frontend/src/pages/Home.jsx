import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  const styles = {
    homePage: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    },
    mainContent: {
      flex: 1,
      padding: '20px',
    }
  }

  return (
    <div style={styles.homePage}>
      <Navbar />
      <main style={styles.mainContent}>
        <Header />
      </main>
    </div>
  )
}

export default Home

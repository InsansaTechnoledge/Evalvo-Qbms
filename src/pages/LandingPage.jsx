import React from 'react'
import LaptopLandingPage from '../components/BeforeAuth/Laptop/LaptopLandingPage'
import MobileLandingPage from '../components/BeforeAuth/Mobile/MobileLandingPage'
import useScrolled from '../hooks/useScrolled';

const LandingPage = () => {
  return (
    <main className='mx-auto '>

        {/* large devices */}
        <LaptopLandingPage/>
        
        {/* Small devices */}
        <MobileLandingPage/>
        
    </main>
  )
}

export default LandingPage

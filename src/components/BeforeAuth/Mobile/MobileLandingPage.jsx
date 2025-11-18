import React from 'react'
import ScrollReveal from '../Laptop/ScrollReveal'
import ScrollTextComponent from '../ScrollTextComponent'
import FeaturesComponent from '../FeaturesComponent'

const MobileLandingPage = () => {
  return (
    <>
    <div className='md:hidden min-h-screen block px-8'>

        <p className='text-left text-sm mb-4 text-blue-600 font-semibold'>developed by~ evalvotech.com</p>

        <div className='text-[10vw] font-semibold '>
            <h1>Build exam-ready <span className='text-blue-600'>question banks</span></h1>
            <h1>at lightning speed</h1>
        </div>

        <div className='text-left mx-auto mt-4 text-gray-600 text-xl '>
            <p>
                With <span className='text-blue-600 font-bold'>Evalvo</span>, universities can seamlessly organize, curate, and manage their vast repositories of questions—covering multiple courses, subjects, and difficulty levels—ensuring accuracy, consistency, and efficiency across all assessments.
            </p>
        </div>

    </div>

    <div className='md:hidden'>
        <FeaturesComponent/>
    </div>

    <div className='md:hidden'>
        <ScrollTextComponent/>
    </div>


    </>
  )
}

export default MobileLandingPage

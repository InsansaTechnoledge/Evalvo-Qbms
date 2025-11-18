import React from 'react'
import { edges, nodes } from '../../../utils/Constants'
import QbmsFlowShowcase from './QbmsNetworkShowcase'
import ScrollTextComponent from '../ScrollTextComponent'
import FeaturesComponent from '../FeaturesComponent'
import About from '../About'

const LaptopLandingPage = () => {
  return (
    <>
    {/* header */}
    <div className='md:block  hidden mt-20 max-w-6xl mx-auto '>
        <p className='text-center text-lg text-blue-600 font-semibold'>QBMS by~ evalvotech.com</p>
    
        <div className='text-center text-[4vw] font-semibold leading-[8vh]'>
            <h1>Build exam-ready <span className='text-blue-600'>question banks</span></h1>
            <h1>at lightning speed</h1>
        </div>
    
        <div className='text-center max-w-3xl mx-auto mt-3 text-gray-600 text-lg'>
            <p>
                With <span className='text-blue-600 font-bold'>Evalvo</span>, universities can seamlessly organize, curate, and manage their vast repositories of questions—covering multiple courses, subjects, and difficulty levels—ensuring accuracy, consistency, and efficiency across all assessments.
            </p>
        </div>
    
        <QbmsFlowShowcase nodes={nodes} edges={edges} viewBox={{ w: 1200, h: 700 }} />

    </div>

    <div className='md:block hidden'>
        <FeaturesComponent/>
    </div>

    <div className='md:block hidden'>
        <ScrollTextComponent/>
    </div>

    <div className='md:block hidden'>
        <About/>
    </div>

  

    </>
  )
}

export default LaptopLandingPage

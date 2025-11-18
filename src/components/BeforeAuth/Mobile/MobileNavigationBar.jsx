import React from 'react'
import hamburger from '/hamburger.svg'
import logo from '/logo.svg'

const MobileNavigationBar = () => {
  return (
    <nav className="md:hidden block">
        <div className="flex justify-between px-8 py-8">
            <div className='flex gap-1'>
                <img src={logo} className='w-8 h-8' alt="" />
                <div className="text-lg text-gray-800 font-semibold"><a className="text-blue-600" href="https://evalvotech.com">Evalvo</a> QBMS</div>
            </div>            
            <button>
                <img src={hamburger} className="w-5 h-5" alt="" />
            </button>
        </div>
    </nav>
  )
}

export default MobileNavigationBar

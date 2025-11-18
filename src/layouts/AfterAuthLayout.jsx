import { Sidebar } from 'lucide-react'
import React from 'react'
import { Outlet } from 'react-router-dom'
import SideAndNavbar from '../components/AfterAuth/navigation/SideAndNavbar'

const AfterAuthLayout = () => {
  return (
    <div>
        <SideAndNavbar>
            <main>
                <Outlet/>
            </main>
        </SideAndNavbar>
    </div>
  )
}

export default AfterAuthLayout

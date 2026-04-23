// src/components/common/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardFooter from './DashboardFooter'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardNavbar />
      <main className="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
        <Outlet />
      </main>
      <DashboardFooter />
    </div>
  )
}

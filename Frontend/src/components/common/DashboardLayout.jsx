// src/components/common/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardFooter from './DashboardFooter'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DashboardNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <DashboardFooter />
    </div>
  )
}

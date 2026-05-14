import { Outlet } from 'react-router-dom'
import DashboardNavbar from './DashboardNavbar'
import DashboardFooter from './DashboardFooter'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] text-slate-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 h-[420px] w-[420px] rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute top-20 right-0 h-[360px] w-[360px] rounded-full bg-sky-100/40 blur-3xl" />
      </div>
      <DashboardNavbar />
      <main className="relative flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
        <Outlet />
      </main>
      <DashboardFooter />
    </div>
  )
}
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layouts & Guards
import DashboardLayout from '@/components/common/DashboardLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import RoleRedirect from '@/components/common/RoleRedirect'

// Public Pages
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage'
import SignupPage from '@/features/auth/pages/SignupPage'
import VerifyOtpPage from '@/features/auth/pages/VerifyOtpPage'

// Onboarding Pages
import CitizenOnboarding from '@/features/onboarding/pages/CitizenOnboarding'
import LawyerOnboarding from '@/features/onboarding/pages/LawyerOnboarding'
import PoliceOnboarding from '@/features/onboarding/pages/PoliceOnboarding'

// Citizen Pages
import CitizenDashboard from '@/features/citizen/pages/CitizenDashboard'
import FileFIRPage from '@/features/citizen/pages/FileFIRPage'
import MyFIRsPage from '@/features/citizen/pages/MyFIRsPage'
import FIRDetailPage from '@/features/citizen/pages/FIRDetailPage'
import LawyerRecommendations from '@/features/citizen/pages/LawyerRecommendations'
import ConsultationsPage from '@/features/citizen/pages/ConsultationsPage'
import CitizenProfilePage from '@/features/citizen/pages/CitizenProfilePage'

// Lawyer Pages
import LawyerDashboard from '@/features/lawyer/pages/LawyerDashboard'
import IncomingRequestsPage from '@/features/lawyer/pages/IncomingRequestsPage'
import ConsultationHistoryPage from '@/features/lawyer/pages/ConsultationHistoryPage'
import LawyerProfilePage from '@/features/lawyer/pages/LawyerProfilePage'
import LawyerReviewsPage from '@/features/lawyer/pages/LawyerReviewsPage'

// Police Pages
import PoliceDashboard from '@/features/police/pages/PoliceDashboard'
import PoliceFIRsPage from '@/features/police/pages/PoliceFIRsPage'
import PoliceFIRDetailPage from '@/features/police/pages/PoliceFIRDetailPage'
import PoliceProfilePage from '@/features/police/pages/PoliceProfilePage'

// Admin Pages
import AdminDashboard from '@/features/admin/pages/AdminDashboard'
import VerificationPanel from '@/features/admin/pages/VerificationPanel'

// Chat
import ChatPage from '@/features/chat/pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* ─── Onboarding ─── */}
        <Route path="/onboarding/citizen" element={<CitizenOnboarding />} />
        <Route path="/onboarding/lawyer" element={<LawyerOnboarding />} />
        <Route path="/onboarding/police" element={<PoliceOnboarding />} />

        {/* ─── Generic dashboard redirect ─── */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ─── Citizen Protected Routes ─── */}
        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/file-fir" element={<FileFIRPage />} />
            <Route path="/citizen/my-firs" element={<MyFIRsPage />} />
            <Route path="/citizen/fir/:id" element={<FIRDetailPage />} />
            <Route path="/citizen/fir/:id/lawyers" element={<LawyerRecommendations />} />
            <Route path="/citizen/consultations" element={<ConsultationsPage />} />
            <Route path="/citizen/profile" element={<CitizenProfilePage />} />
            <Route path="/citizen/chat" element={<ChatPage />} />
            <Route path="/citizen/chat/:roomId" element={<ChatPage />} />
          </Route>
        </Route>

        {/* ─── Lawyer Protected Routes ─── */}
        <Route element={<ProtectedRoute allowedRoles={['lawyer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/requests" element={<IncomingRequestsPage />} />
            <Route path="/lawyer/history" element={<ConsultationHistoryPage />} />
            <Route path="/lawyer/profile" element={<LawyerProfilePage />} />
            <Route path="/lawyer/reviews" element={<LawyerReviewsPage />} />
            <Route path="/lawyer/chat" element={<ChatPage />} />
            <Route path="/lawyer/chat/:roomId" element={<ChatPage />} />
          </Route>
        </Route>

        {/* ─── Police Protected Routes ─── */}
        <Route element={<ProtectedRoute allowedRoles={['police']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/police/dashboard" element={<PoliceDashboard />} />
            <Route path="/police/firs" element={<PoliceFIRsPage />} />
            <Route path="/police/fir/:id" element={<PoliceFIRDetailPage />} />
            <Route path="/police/profile" element={<PoliceProfilePage />} />
          </Route>
        </Route>

        {/* ─── Admin Protected Routes ─── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/verifications" element={<VerificationPanel />} />
          </Route>
        </Route>

        {/* ─── 404 ─── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

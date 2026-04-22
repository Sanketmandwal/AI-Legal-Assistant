// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingScreen from './LoadingScreen'

/**
 * Route guard that checks:
 * 1. User is authenticated (has token)
 * 2. Email and phone are verified (not still in OTP flow)
 * 3. User has the required role for this route group
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Not logged in at all
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Still needs OTP verification
  if (!user.emailVerified || !user.phoneVerified) {
    return <Navigate to="/verify-otp" replace />
  }

  // Role check — if allowedRoles specified, user role must be in the list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

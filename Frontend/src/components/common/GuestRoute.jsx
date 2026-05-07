// src/components/common/GuestRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * Route guard that redirects authenticated users away from
 * guest-only pages (login, signup) to their dashboard.
 */
export default function GuestRoute() {
  const { token, user } = useSelector((state) => state.auth)

  // If the user is logged in and verified, send them to their dashboard
  if (token && user && user.emailVerified && user.phoneVerified) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

// src/components/common/RoleRedirect.jsx
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * Redirects /dashboard to the correct role-specific dashboard
 */
export default function RoleRedirect() {
  const { user } = useSelector((state) => state.auth)

  if (!user) return <Navigate to="/login" replace />

  const roleRoutes = {
    citizen: '/citizen/dashboard',
    lawyer: '/lawyer/dashboard',
    police: '/police/dashboard',
    admin: '/admin/dashboard',
  }

  return <Navigate to={roleRoutes[user.role] || '/login'} replace />
}

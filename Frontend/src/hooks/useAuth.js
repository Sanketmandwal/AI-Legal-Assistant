// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux'
import { logout as logoutAction } from '@/features/auth/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

export default function useAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, tempToken, user, role, isLoading, error } = useSelector(
    (state) => state.auth
  )

  const isAuthenticated = !!token
  const isVerified = user?.emailVerified && user?.phoneVerified
  const needsOtp = !!tempToken && !isVerified

  const handleLogout = useCallback(() => {
    dispatch(logoutAction())
    navigate('/login')
  }, [dispatch, navigate])

  return {
    token,
    tempToken,
    user,
    role,
    isLoading,
    error,
    isAuthenticated,
    isVerified,
    needsOtp,
    logout: handleLogout,
  }
}

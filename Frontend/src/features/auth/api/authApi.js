// src/features/auth/api/authApi.js
import { useMutation } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  loginSuccess,
  loginFailure,
  setTempAuth,
  verifySuccess,
} from '@/features/auth/slices/authSlice'

// POST /api/auth/register
export function useRegister() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => axiosClient.post('/auth/register', data),
    onSuccess: (res) => {
      const { tempToken, user } = res.data
      dispatch(setTempAuth({ tempToken, user }))
      toast.success('Account created! Please verify your email & phone.')
      navigate('/verify-otp')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Registration failed'
      dispatch(loginFailure(msg))
      toast.error(msg)
    },
  })
}

// POST /api/auth/login
export function useLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => axiosClient.post('/auth/login', data),
    onSuccess: (res) => {
      const { token, user } = res.data
      dispatch(loginSuccess({ token, user }))
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Login failed'
      // Check if user needs to verify OTPs
      const emailVerified = err.response?.data?.emailVerified
      const phoneVerified = err.response?.data?.phoneVerified
      if (emailVerified === false || phoneVerified === false) {
        toast.error('Please verify your email and phone number first.')
      } else {
        dispatch(loginFailure(msg))
        toast.error(msg)
      }
    },
  })
}

// POST /api/auth/verify-both-otps
export function useVerifyBothOtps() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => axiosClient.post('/auth/verify-both-otps', data),
    onSuccess: (res) => {
      const { token, user } = res.data
      dispatch(verifySuccess({ token, user }))
      toast.success('Verification successful! Welcome!')
      // Redirect to onboarding based on role
      if (user.role === 'citizen') navigate('/onboarding/citizen')
      else if (user.role === 'lawyer') navigate('/onboarding/lawyer')
      else if (user.role === 'police') navigate('/onboarding/police')
      else navigate('/dashboard')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Verification failed'
      toast.error(msg)
    },
  })
}

// POST /api/auth/send-email-otp
export function useResendEmailOtp() {
  return useMutation({
    mutationFn: () => axiosClient.post('/auth/send-email-otp'),
    onSuccess: () => toast.success('Email OTP resent!'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend email OTP'),
  })
}

// POST /api/auth/send-phone-otp
export function useResendPhoneOtp() {
  return useMutation({
    mutationFn: () => axiosClient.post('/auth/send-phone-otp'),
    onSuccess: () => toast.success('Phone OTP resent!'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend phone OTP'),
  })
}

// GET /api/auth/me
export function useGetMe() {
  return useMutation({
    mutationFn: () => axiosClient.get('/auth/me'),
  })
}

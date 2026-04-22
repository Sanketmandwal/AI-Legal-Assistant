// src/features/onboarding/api/onboardingApi.js
import { useMutation } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '@/features/auth/slices/authSlice'

// POST /api/citizen/submit-profile (multipart/form-data)
export function useSubmitCitizenProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (formData) =>
      axiosClient.post('/citizen/submit-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      dispatch(updateUser({ profileCompleted: true }))
      toast.success('Profile completed! Redirecting to dashboard...')
      navigate('/citizen/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit profile')
    },
  })
}

// POST /api/lawyer/submit-profile (multipart/form-data)
export function useSubmitLawyerProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (formData) =>
      axiosClient.post('/lawyer/submit-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      dispatch(updateUser({ profileCompleted: true }))
      toast.success('Profile submitted for admin verification!')
      navigate('/lawyer/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit profile')
    },
  })
}

// POST /api/police/submit-profile (multipart/form-data)
export function useSubmitPoliceProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (formData) =>
      axiosClient.post('/police/submit-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      dispatch(updateUser({ profileCompleted: true }))
      toast.success('Station profile submitted for verification!')
      navigate('/police/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit profile')
    },
  })
}

// src/api/axiosClient.js
import axios from 'axios'
import toast from 'react-hot-toast'
import { store } from '@/app/store'
import { logout } from '@/features/auth/slices/authSlice'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor — attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      store.dispatch(logout())
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Don't toast on 401 if on login/register pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        toast.error('Session expired. Please login again.')
      }
    } else if (status === 403) {
      toast.error(message)
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)

export default axiosClient

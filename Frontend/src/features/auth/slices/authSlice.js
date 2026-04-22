// src/features/auth/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

// Rehydrate from localStorage on startup
const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const initialState = {
  token: storedToken || null,
  tempToken: null, // temporary token during OTP verification
  user: storedUser ? JSON.parse(storedUser) : null,
  role: storedUser ? JSON.parse(storedUser).role : null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      const { token, user } = action.payload
      state.isLoading = false
      state.token = token
      state.user = user
      state.role = user.role
      state.tempToken = null
      state.error = null
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    loginFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },

    // After register — store temp token for OTP verification
    setTempAuth: (state, action) => {
      const { tempToken, user } = action.payload
      state.tempToken = tempToken
      state.user = user
      state.role = user.role
      state.isLoading = false
      // Store tempToken so OTP page can use it after page refresh
      localStorage.setItem('token', tempToken)
      localStorage.setItem('user', JSON.stringify(user))
    },

    // After OTP verification succeeds — upgrade to full token
    verifySuccess: (state, action) => {
      const { token, user } = action.payload
      state.token = token
      state.tempToken = null
      state.user = user
      state.role = user.role
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    // Update user profile data in state
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },

    logout: (state) => {
      state.token = null
      state.tempToken = null
      state.user = null
      state.role = null
      state.isLoading = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setTempAuth,
  verifySuccess,
  updateUser,
  logout,
} = authSlice.actions

export default authSlice.reducer

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App.jsx'
import './index.css'
import './i18n.js'
import store from './app/store.js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
})

/**
 * Validates the stored token on app boot.
 * If the token is expired/invalid, clean up immediately
 * so the user sees the login page instead of a broken dashboard.
 */
async function validateStoredSession() {
  const token = localStorage.getItem('token')
  if (!token) return // nothing to validate

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Invalid session')

    // Optionally refresh the user object in Redux with latest data
    const data = await res.json()
    if (data.success && data.user) {
      const { loginSuccess } = await import('@/features/auth/slices/authSlice')
      store.dispatch(loginSuccess({ token, user: data.user }))
    }
  } catch {
    // Token is expired or invalid — clear everything
    const { logout } = await import('@/features/auth/slices/authSlice')
    store.dispatch(logout())
  }
}

// Run session validation before render (non-blocking — app renders immediately,
// but if the token is bad, it'll get cleared very quickly)
validateStoredSession()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px' },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)

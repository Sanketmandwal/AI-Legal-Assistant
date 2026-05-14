import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '../api/authApi'
import PublicLayout from '@/components/common/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: '', password: '' },
  })

  const onSubmit = (data) => loginMutation.mutate(data)

  return (
    <PublicLayout>
      {/* Rich teal-to-slate gradient background */}
      <div
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.44 0.10 185) 0%, oklch(0.35 0.09 210) 50%, oklch(0.22 0.04 240) 100%)',
        }}
      >
        {/* Subtle noise/depth blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, oklch(0.70 0.12 185), transparent 70%)' }} />
          <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, oklch(0.60 0.14 200), transparent 70%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">

          {/* Heading — white on dark bg */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
            <p className="text-base text-white/65">Sign in to your Legal Assistant account</p>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl border border-white/20 bg-white/12 backdrop-blur-2xl shadow-2xl shadow-black/30 px-8 py-9">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Email or Phone */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold text-white/90">
                  Email or Phone
                </Label>
                <Input
                  id="login-email"
                  type="text"
                  placeholder="you@example.com or +91…"
                  autoComplete="username"
                  {...register('emailOrPhone')}
                  className={`h-12 text-base bg-white/15 border-white/25 text-white placeholder:text-white/40
                    focus:bg-white/20 focus:border-white/50 focus:ring-white/20
                    ${errors.emailOrPhone ? 'border-red-400/70' : ''}`}
                />
                {errors.emailOrPhone && (
                  <p className="text-sm text-red-300">{errors.emailOrPhone.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-semibold text-white/90">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className={`h-12 text-base pr-12 bg-white/15 border-white/25 text-white placeholder:text-white/40
                      focus:bg-white/20 focus:border-white/50 focus:ring-white/20
                      ${errors.password ? 'border-red-400/70' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-300">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-white text-primary hover:bg-white/90 active:bg-white/80 shadow-lg shadow-black/20 border-0 mt-1"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Signing in…</>
                  : 'Sign in'}
              </Button>

            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            No account?{' '}
            <Link to="/signup" className="text-white font-semibold hover:underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
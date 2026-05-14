import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegister } from '../api/authApi'
import PublicLayout from '@/components/common/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number (10–15 digits)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'lawyer', 'police']),
})

const ROLES = [
  { value: 'citizen', label: 'Citizen', desc: 'File FIRs & get legal help' },
  { value: 'lawyer',  label: 'Lawyer',  desc: 'Offer legal consultations'  },
  { value: 'police',  label: 'Police',  desc: 'Manage FIR cases'           },
]

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegister()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', role: 'citizen' },
  })

  const selectedRole = watch('role')
  const onSubmit = (data) => registerMutation.mutate(data)

  return (
    <PublicLayout>
      <div
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.44 0.10 185) 0%, oklch(0.35 0.09 210) 50%, oklch(0.22 0.04 240) 100%)',
        }}
      >
        {/* depth blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, oklch(0.70 0.12 185), transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, oklch(0.60 0.14 200), transparent 70%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create an account</h1>
            <p className="text-base text-white/65">Join India's AI-powered legal platform</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/12 backdrop-blur-2xl shadow-2xl shadow-black/30 px-8 py-9">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Role selector */}
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-white/90">I am a</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROLES.map((role) => {
                    const active = selectedRole === role.value
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setValue('role', role.value, { shouldValidate: true })}
                        className={`rounded-xl border px-2 py-3.5 text-center transition-all duration-150 cursor-pointer
                          ${active
                            ? 'border-white/70 bg-white/25 ring-2 ring-white/30'
                            : 'border-white/15 bg-white/8 hover:bg-white/15 hover:border-white/30'}`}
                      >
                        <div className={`text-sm font-semibold ${active ? 'text-white' : 'text-white/70'}`}>
                          {role.label}
                        </div>
                        <div className="text-[10px] text-white/45 mt-0.5 leading-tight">{role.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-semibold text-white/90">Full Name</Label>
                <Input id="signup-name" placeholder="Priya Sharma" autoComplete="name"
                  {...register('name')}
                  className={`h-12 text-base bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/50 ${errors.name ? 'border-red-400/70' : ''}`} />
                {errors.name && <p className="text-sm text-red-300">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-semibold text-white/90">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" autoComplete="email"
                  {...register('email')}
                  className={`h-12 text-base bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/50 ${errors.email ? 'border-red-400/70' : ''}`} />
                {errors.email && <p className="text-sm text-red-300">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-sm font-semibold text-white/90">Phone</Label>
                <Input id="signup-phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel"
                  {...register('phone')}
                  className={`h-12 text-base bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/50 ${errors.phone ? 'border-red-400/70' : ''}`} />
                {errors.phone && <p className="text-sm text-red-300">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-semibold text-white/90">Password</Label>
                <div className="relative">
                  <Input id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    {...register('password')}
                    className={`h-12 text-base pr-12 bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white/50 ${errors.password ? 'border-red-400/70' : ''}`} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
              </div>

              <Button type="submit"
                className="w-full h-12 text-base font-semibold bg-white text-primary hover:bg-white/90 active:bg-white/80 shadow-lg shadow-black/20 border-0 mt-1"
                disabled={registerMutation.isPending}>
                {registerMutation.isPending
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating account…</>
                  : 'Create account'}
              </Button>

            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline underline-offset-2">Sign in</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
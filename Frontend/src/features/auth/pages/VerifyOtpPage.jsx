import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useVerifyBothOtps, useResendEmailOtp, useResendPhoneOtp } from '../api/authApi'
import PublicLayout from '@/components/common/PublicLayout'
import OtpInput from '@/components/shared/OtpInput'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Loader2 } from 'lucide-react'

export default function VerifyOtpPage() {
  const { user, token } = useSelector((state) => state.auth)
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')

  const verifyMutation      = useVerifyBothOtps()
  const resendEmailMutation = useResendEmailOtp()
  const resendPhoneMutation = useResendPhoneOtp()

  if (!user || !token) return <Navigate to="/login" replace />
  if (user.emailVerified && user.phoneVerified) return <Navigate to="/dashboard" replace />

  const handleVerify = () => {
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) return
    verifyMutation.mutate({ emailOtp, phoneOtp })
  }

  const canSubmit = emailOtp.length === 6 && phoneOtp.length === 6 && !verifyMutation.isPending

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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.12 185), transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, oklch(0.60 0.14 200), transparent 70%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Verify your identity</h1>
            <p className="text-base text-white/65">We sent 6-digit codes to your email and phone.</p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/12 backdrop-blur-2xl shadow-2xl shadow-black/30 px-8 py-9 space-y-8">

            {/* Email OTP */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm font-semibold text-white">Email code</span>
                </div>
                <span className="text-xs text-white/45 truncate max-w-[16ch]">{user.email}</span>
              </div>

              <OtpInput
                value={emailOtp}
                onChange={setEmailOtp}
                disabled={verifyMutation.isPending}
              />

              <button
                type="button"
                className="text-sm text-white/45 hover:text-white/80 transition-colors disabled:opacity-40"
                onClick={() => resendEmailMutation.mutate()}
                disabled={resendEmailMutation.isPending}
              >
                {resendEmailMutation.isPending ? 'Sending…' : 'Resend email code'}
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Phone OTP */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm font-semibold text-white">Phone code</span>
                </div>
                <span className="text-xs text-white/45 truncate max-w-[16ch]">{user.phone}</span>
              </div>

              <OtpInput
                value={phoneOtp}
                onChange={setPhoneOtp}
                disabled={verifyMutation.isPending}
              />

              <button
                type="button"
                className="text-sm text-white/45 hover:text-white/80 transition-colors disabled:opacity-40"
                onClick={() => resendPhoneMutation.mutate()}
                disabled={resendPhoneMutation.isPending}
              >
                {resendPhoneMutation.isPending ? 'Sending…' : 'Resend phone code'}
              </button>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold bg-white text-primary hover:bg-white/90 active:bg-white/80 shadow-lg shadow-black/20 border-0"
              onClick={handleVerify}
              disabled={!canSubmit}
            >
              {verifyMutation.isPending
                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Verifying…</>
                : 'Verify & continue'}
            </Button>

          </div>

        </div>
      </div>
    </PublicLayout>
  )
}
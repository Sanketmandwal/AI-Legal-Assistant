// src/features/auth/pages/VerifyOtpPage.jsx
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useVerifyBothOtps, useResendEmailOtp, useResendPhoneOtp } from '../api/authApi'
import PublicLayout from '@/components/common/PublicLayout'
import OtpInput from '@/components/shared/OtpInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, Loader2, ShieldCheck } from 'lucide-react'

export default function VerifyOtpPage() {
  const { user, token } = useSelector((state) => state.auth)
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')

  const verifyMutation = useVerifyBothOtps()
  const resendEmailMutation = useResendEmailOtp()
  const resendPhoneMutation = useResendPhoneOtp()

  // If no user or already verified, redirect
  if (!user || !token) return <Navigate to="/login" replace />
  if (user.emailVerified && user.phoneVerified) return <Navigate to="/dashboard" replace />

  const handleVerify = () => {
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) return
    verifyMutation.mutate({ emailOtp, phoneOtp })
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg ">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
            <CardDescription>
              We sent OTPs to your email and phone. Enter both to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email OTP */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>Email OTP</span>
                <span className="text-xs text-slate-400 ml-auto">{user.email}</span>
              </div>
              <OtpInput
                value={emailOtp}
                onChange={setEmailOtp}
                disabled={verifyMutation.isPending}
              />
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs text-slate-500"
                  onClick={() => resendEmailMutation.mutate()}
                  disabled={resendEmailMutation.isPending}
                >
                  {resendEmailMutation.isPending ? 'Sending...' : "Didn't receive? Resend Email OTP"}
                </Button>
              </div>
            </div>

            {/* Phone OTP */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>Phone OTP</span>
                <span className="text-xs text-slate-400 ml-auto">{user.phone}</span>
              </div>
              <OtpInput
                value={phoneOtp}
                onChange={setPhoneOtp}
                disabled={verifyMutation.isPending}
              />
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs text-slate-500"
                  onClick={() => resendPhoneMutation.mutate()}
                  disabled={resendPhoneMutation.isPending}
                >
                  {resendPhoneMutation.isPending ? 'Sending...' : "Didn't receive? Resend Phone OTP"}
                </Button>
              </div>
            </div>

            <Button
              className="w-full h-11"
              onClick={handleVerify}
              disabled={emailOtp.length !== 6 || phoneOtp.length !== 6 || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}

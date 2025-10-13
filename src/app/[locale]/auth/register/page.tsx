'use client'

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"

export default function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signInWithOtp, verifyOtp } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Get the return URL from search params
  const returnUrl = searchParams.get('returnUrl')

  // Redirect logged-in users to returnUrl or dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = returnUrl || `/${locale}/dashboard`
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, returnUrl, locale])

    const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signInWithOtp(formData.email, {
        shouldCreateUser: true
      })

      if (error) {
        if (error.message && error.message.toLowerCase().includes('signups not allowed')) {
          showToast.error(t('signupsNotAllowed') || 'Signups are currently disabled. Please contact support.')
        } else {
          showToast.error(error.message || t('registrationFailed'))
        }
      } else {
        setOtpSent(true)
        showToast.success(t('otpSent') || 'Verification code sent to your email')
      }
    } catch {
      showToast.error(t('registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP code
    const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await verifyOtp(formData.email, otp)

      if (error) {
        if (error.message.includes('expired')) {
          showToast.error(t('otpExpired') || 'Code expired. Please request a new one.')
        } else if (error.message.includes('invalid')) {
          showToast.error(t('invalidOtp') || 'Invalid code. Please check and try again.')
        } else {
          showToast.error(error.message || t('verificationFailed'))
        }
      } else {
        showToast.success(t('accountCreated'))
        router.push(`/${locale}/role-selection`)
      }
    } catch {
      showToast.error(t('verificationFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP code
    const handleResendOtp = async () => {
    setLoading(true)

    try {
      const { error } = await signInWithOtp(formData.email, {
        shouldCreateUser: true
      })

      if (error) {
        showToast.error(error.message || t('resendFailed'))
      } else {
        showToast.success(t('otpResent') || 'Verification code sent again')
      }
    } catch {
      showToast.error(t('resendFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {otpSent ? t('verifyEmail.title') || 'Verify Your Email' : t('createAccount')}
            </CardTitle>
            <CardDescription className="text-center">
              {otpSent 
                ? (t('enterOtpCode') || `We sent a 6-digit code to ${formData.email}`)
                : (t('createAccountDescription') || 'Enter your details to create an account')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otpSent ? (
              /* OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('verificationCode') || 'Verification Code'}</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder={t('enterSixDigitCode') || 'Enter 6-digit code'}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={loading}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-foreground hover:bg-foreground/90 text-background" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (t('verifying') || 'Verifying...') : (t('verifyCode') || 'Verify Code')}
                </Button>

                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (t('sending') || 'Sending...') : (t('resendCode') || 'Resend Code')}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp('')
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    {t('backToRegistration') || 'Back to Registration'}
                  </Button>
                </div>
              </form>
            ) : (
              /* Email Registration Form */
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('enterEmail')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('createPassword')}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.password && (
                    <PasswordStrengthIndicator 
                      password={formData.password} 
                      userInfo={{ email: formData.email }}
                      showStrengthBar={true}
                      showRequirements={true}
                      className="mt-3"
                    />
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-foreground hover:bg-foreground/90 text-background" 
                  disabled={loading}
                >
                  {loading ? (t('sendingCode') || 'Sending Code...') : (t('sendVerificationCode') || 'Send Verification Code')}
                </Button>
              </form>
            )}

            {/* Sign In Link - only show when not in OTP mode */}
            {!otpSent && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
                <Link
                  href={returnUrl ? `/${locale}/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}` : `/${locale}/auth/signin`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t('signIn')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

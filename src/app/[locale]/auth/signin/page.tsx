'use client'

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OTPInput } from "@/components/ui/otp-input"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"

export default function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, signInWithOtp, verifyOtp } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [useOtp, setUseOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Get the return URL from search params
  const returnUrl = searchParams.get('returnUrl')
  const error = searchParams.get('error')
  const errorMessage = searchParams.get('message')

  // Redirect logged-in users to returnUrl or dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = returnUrl || `/${locale}/dashboard`
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, returnUrl, locale])

  // Show error messages from URL parameters
  useEffect(() => {
    if (error) {
      switch (error) {
        case 'verification_error':
          showToast.error(t('verificationError') || 'Email verification failed. Please try again.')
          break
        case 'verification_failed':
          showToast.error(errorMessage || t('verificationFailed') || 'Email verification failed.')
          break
        case 'invalid_verification_link':
          showToast.error(t('invalidVerificationLink') || 'Invalid verification link. Please request a new one.')
          break
        default:
          if (errorMessage) {
            showToast.error(decodeURIComponent(errorMessage))
          }
      }
    }
  }, [error, errorMessage, t])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // This would use the signIn function from context for password auth
      // For now using supabase directly since we need both password and OTP auth
      const { supabase } = await import("@/lib/supabase")
      
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('🔐 Signin error details:', error)
        if (error.message.includes('Email not confirmed')) {
          showToast.error(t('emailNotVerified'))
          window.location.href = `/${locale}/auth/verify-email?email=${encodeURIComponent(formData.email)}`
        } else if (error.message.includes('Invalid login credentials')) {
          showToast.error(t('invalidCredentials'))
        } else {
          showToast.error(error.message || t('signInFailed'))
        }
      } else {
        showToast.success(t('signedInSuccessfully'))
        const redirectTo = returnUrl || `/${locale}/dashboard`
        window.location.href = redirectTo
      }
    } catch (catchError) {
      console.error('🔐 Signin catch error:', catchError)
      showToast.error(t('signInFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signInWithOtp(formData.email, {
        shouldCreateUser: false
      })

      if (error) {
        if (error.message && error.message.toLowerCase().includes('signups not allowed')) {
          showToast.error(t('signupsNotAllowed') || 'OTP authentication is currently disabled. Please use password login.')
        } else {
          showToast.error(error.message || t('signInFailed'))
        }
      } else {
        setOtpSent(true)
        showToast.success(t('otpSent') || 'Verification code sent to your email')
      }
    } catch {
      showToast.error(t('signInFailed'))
    } finally {
      setLoading(false)
    }
  }

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
        showToast.success(t('signedInSuccessfully'))
        const redirectTo = returnUrl || `/${locale}/dashboard`
        router.push(redirectTo)
      }
    } catch {
      showToast.error(t('signInFailed'))
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  // Don't render if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {otpSent ? (t('verifyEmail.title') || 'Verify Your Email') : t('signIn')}
            </CardTitle>
            <CardDescription className="text-center">
              {otpSent 
                ? (t('enterOtpCode') || `We sent a 6-digit code to ${formData.email}`)
                : (t('signInDescription') || 'Sign in to your account')
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otpSent ? (
              /* OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('verificationCode') || 'Verification Code'}</Label>
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (t('verifying') || 'Verifying...') : (t('signIn') || 'Sign In')}
                </Button>

                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOtpLogin}
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
                      setUseOtp(false)
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    {t('backToSignIn') || 'Back to Sign In'}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Login Method Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="password-login"
                      name="login-method"
                      checked={!useOtp}
                      onChange={() => setUseOtp(false)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="password-login" className="text-sm">
                      {t('signInWithPassword') || 'Sign in with password'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="otp-login"
                      name="login-method"
                      checked={useOtp}
                      onChange={() => setUseOtp(true)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="otp-login" className="text-sm">
                      {t('signInWithEmailCode') || 'Sign in with email code'}
                    </Label>
                  </div>
                </div>

                <form onSubmit={useOtp ? handleOtpLogin : handleEmailSignIn} className="space-y-4">
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

                  {!useOtp && (
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('enterPassword')}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="pr-10"
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
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading 
                      ? (useOtp ? (t('sendingCode') || 'Sending Code...') : (t('signingIn') || 'Signing In...'))
                      : (useOtp ? (t('sendCode') || 'Send Code') : t('signIn'))
                    }
                  </Button>
                </form>

                {/* Forgot Password Link - only show for password login */}
                {!useOtp && (
                  <div className="text-center">
                    <Link
                      href={`/${locale}/auth/forgot-password`}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                )}

                {/* Sign Up Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
                  <Link
                    href={returnUrl ? `/${locale}/auth/register?returnUrl=${encodeURIComponent(returnUrl)}` : `/${locale}/auth/register`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

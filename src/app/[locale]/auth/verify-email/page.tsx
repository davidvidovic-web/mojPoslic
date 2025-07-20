'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeInput } from '@/components/ui/code-input'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailForm() {
  const t = useTranslations('auth.verifyEmail')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  // Auto-fill verification code in development mode
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl && codeFromUrl.length === 6) {
      setCode(codeFromUrl)
      // Show a toast or message that code was auto-filled in development
      if (process.env.NODE_ENV === 'development') {
        setMessage('Development mode: Verification code auto-filled')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code || code.length !== 6) {
      setStatus('error')
      setMessage(t('pleaseEnterValidCode'))
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(t('emailVerifiedSuccessfully'))
        
        // Update message after a short delay
        setTimeout(() => {
          setMessage(t('loggingYouIn'))
        }, 1000)
        
        // Create a session by signing in the user automatically
        setTimeout(async () => {
          const signInResult = await signIn('credentials', {
            email: data.user.email,
            password: '__VERIFIED_AUTO_LOGIN__', // Special flag for auto-login
            redirect: false
          })

          if (signInResult?.ok) {
            setMessage(t('redirectingToDashboard'))
            // Redirect based on whether user needs role selection
            if (data.shouldRedirectToRoleSelection) {
              setTimeout(() => {
                router.push('/account-type')
              }, 800)
            } else if (data.shouldRedirectToProfileSetup) {
              setTimeout(() => {
                router.push('/profile-setup')
              }, 800)
            } else {
              setTimeout(() => {
                router.push('/dashboard')
              }, 800)
            }
          } else {
            // Fallback: redirect to signin if auto-login fails
            setMessage(t('redirectingToSignIn'))
            setTimeout(() => {
              router.push('/auth/signin?message=' + encodeURIComponent(t('emailVerifiedSignIn')))
            }, 1000)
          }
        }, 1500)
      } else {
        setStatus('error')
        setMessage(data.error || t('invalidOrExpiredCode'))
      }
    } catch {
      setStatus('error')
      setMessage(t('verificationError'))
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
    }
  }

  const handleCodeComplete = (value: string) => {
    setCode(value)
    // Only auto-submit when all 6 digits are entered and we're not in an error state
    if (value.length === 6 && status !== 'error' && status !== 'loading') {
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        form?.requestSubmit()
      }, 100)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage(t('emailNotFound'))
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('idle')
        setMessage(data.message || t('newCodeSent'))
        
        // In development mode, show verification code in alert and auto-fill
        if (data.developmentMode && data.verificationCode) {
          alert(`Development Mode: Your new verification code is: ${data.verificationCode}`)
          setCode(data.verificationCode)
        }
      } else {
        setStatus('error')
        setMessage(data.error || t('resendFailed'))
      }
    } catch {
      setStatus('error')
      setMessage(t('resendError'))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('sentCodeTo')}{' '}
            {email && <span className="font-medium">{email}</span>}
            {!email && t('yourEmailAddress')}
          </p>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
                {t('emailVerified')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm font-medium text-center mb-4">{t('enterVerificationCode')}</p>
                <CodeInput
                  length={6}
                  value={code}
                  onChange={handleCodeChange}
                  onComplete={handleCodeComplete}
                  disabled={status === 'loading'}
                  className="mb-4"
                />
                {status === 'error' && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 mb-2">
                      <XCircle className="h-4 w-4" />
                      {message}
                    </div>
                    <p className="text-xs text-center text-red-500 dark:text-red-400">
                      {t('checkCodeAndTryAgain')} {t('orClickResendBelow')}
                    </p>
                  </div>
                )}
                {status === 'idle' && message && (
                  <div className="mt-2 text-sm text-center text-green-600">
                    {message}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-foreground hover:bg-foreground/80 text-background" 
                disabled={status === 'loading' || code.length !== 6}
              >
                {status === 'loading' ? t('verifying') : t('verifyEmailButton')}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('didntReceiveCode')}{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-primary hover:text-primary/80 hover:underline"
                    disabled={status === 'loading'}
                  >
                    {t('resendCode')}
                  </button>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {t('backToSignIn')}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
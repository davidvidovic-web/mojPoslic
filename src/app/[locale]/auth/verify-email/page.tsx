'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeInput } from '@/components/ui/code-input'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailForm() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code || code.length !== 6) {
      setStatus('error')
      setMessage('Please enter a valid 6-digit code')
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
        setMessage('Email verified successfully!')
        
        // Update message after a short delay
        setTimeout(() => {
          setMessage('Logging you in...')
        }, 1000)
        
        // Create a session by signing in the user automatically
        setTimeout(async () => {
          const signInResult = await signIn('credentials', {
            email: data.user.email,
            password: '__VERIFIED_AUTO_LOGIN__', // Special flag for auto-login
            redirect: false
          })

          if (signInResult?.ok) {
            setMessage('Redirecting to dashboard...')
            // Redirect based on whether user needs role selection
            if (data.shouldRedirectToRoleSelection) {
              setTimeout(() => {
                router.push('/role-selection')
              }, 800)
            } else {
              setTimeout(() => {
                router.push('/dashboard')
              }, 800)
            }
          } else {
            // Fallback: redirect to signin if auto-login fails
            setMessage('Redirecting to sign in...')
            setTimeout(() => {
              router.push('/auth/signin?message=Email verified. Please sign in to continue.')
            }, 1000)
          }
        }, 1500)
      } else {
        setStatus('error')
        setMessage(data.error || 'Invalid or expired verification code')
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred during verification')
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
    // Auto-submit when all 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        form?.requestSubmit()
      }, 100)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage('Email address not found. Please try registering again.')
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
        // Show verification code in development
        if (process.env.NODE_ENV === 'development' && data.verificationCode) {
          setMessage(`A new verification code has been sent: ${data.verificationCode}`)
          // Also show an alert for easier copying
          alert(`Your new verification code is: ${data.verificationCode}`)
        } else {
          setMessage('A new verification code has been sent to your email.')
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to resend verification code')
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred while resending the code')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to{' '}
            {email && <span className="font-medium">{email}</span>}
            {!email && 'your email address'}
          </p>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
                Email Verified!
              </h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm font-medium text-center mb-4">Enter verification code</p>
                <CodeInput
                  length={6}
                  value={code}
                  onChange={handleCodeChange}
                  onComplete={handleCodeComplete}
                  disabled={status === 'loading'}
                  className="mb-4"
                />
                {status === 'error' && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    {message}
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
                {status === 'loading' ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-primary hover:text-primary/80 hover:underline"
                    disabled={status === 'loading'}
                  >
                    Resend code
                  </button>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  Back to sign in
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
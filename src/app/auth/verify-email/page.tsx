'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
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
        // Redirect to sign in after a delay
        setTimeout(() => {
          router.push('/auth/signin?message=Email verified. You can now sign in.')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Invalid or expired verification code')
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
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
        setMessage('A new verification code has been sent to your email.')
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a 6-digit verification code to{' '}
            {email && <span className="font-medium">{email}</span>}
            {!email && 'your email address'}
          </p>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold text-green-700">
                Email Verified!
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  disabled={status === 'loading'}
                />
                {status === 'error' && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}
                {status === 'idle' && message && (
                  <div className="mt-2 text-sm text-green-600">
                    {message}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                disabled={status === 'loading' || code.length !== 6}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-600 hover:text-blue-500 hover:underline"
                    disabled={status === 'loading'}
                  >
                    Resend code
                  </button>
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-600 hover:text-gray-500 hover:underline"
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
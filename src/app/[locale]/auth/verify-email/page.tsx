'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { showToast } from '@/lib/toast'

function VerifyEmailForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { user, loading: authLoading } = useSupabaseAuth()

  // Check if user is already verified
  useEffect(() => {
    if (!authLoading && user && user.email_confirmed_at) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (authLoading) return

    // Listen for auth state changes (when user clicks email verification link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success')
        setMessage('Email verified successfully!')
        showToast.success('Email verified successfully!')
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [authLoading])

  const handleResendEmail = async () => {
    if (!email) {
      showToast.error('Email address not found. Please try registering again.')
      return
    }

    setResendLoading(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        showToast.error(error.message || 'Failed to resend verification email')
      } else {
        showToast.success('Verification email sent! Please check your inbox.')
      }
    } catch {
      showToast.error('Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 mb-4">
            {status === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : (
              <Mail className="w-12 h-12 text-blue-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {status === 'success' ? 'Email Verified!' : 'Check Your Email'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' ? (
            <div className="space-y-4">
              <p className="text-green-600">
                Your email has been verified successfully! Redirecting to dashboard...
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : status === 'error' ? (
            <div className="space-y-4">
              <p className="text-red-600">{message}</p>
              <Button onClick={handleResendEmail} disabled={resendLoading} className="w-full">
                {resendLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We&apos;ve sent a verification email to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account. The link will automatically sign you in.
              </p>
              <Button 
                onClick={handleResendEmail} 
                disabled={resendLoading}
                variant="outline" 
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </div>
          )}
          
          <div className="text-center text-sm pt-4 border-t">
            <Link
              href="/auth/signin"
              className="text-primary underline-offset-4 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  )
}
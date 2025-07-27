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
import { AuthLayout } from '@/components/auth/auth-layout'
import { useTranslations } from 'next-intl'

function VerifyEmailForm() {
  const t = useTranslations('auth')
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

    const checkEmailConfirmation = async () => {
      if (user && user.email_confirmed_at) {
        setStatus('success')
        setMessage(t('emailVerified'))
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    }

    checkEmailConfirmation()
  }, [user, authLoading, router, t])

  const handleResendEmail = async () => {
    if (!email) {
      showToast.error(t('emailNotProvided'))
      return
    }

    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        showToast.error(error.message)
      } else {
        showToast.success(t('verificationEmailResent'))
      }
    } catch (error) {
      console.error('Resend error:', error)
      showToast.error(t('failedToResendEmail'))
    } finally {
      setResendLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6 bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="h-16 w-16 text-red-500" />
            ) : (
              <Mail className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            {status === 'success' ? t('emailVerified') : t('checkYourEmail')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t('emailVerifiedSuccess')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('redirectingToDashboard')}
              </p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center space-y-4">
              <p className="text-red-600">{message}</p>
              <Button 
                variant="outline" 
                onClick={() => setStatus('idle')}
                className="w-full"
              >
                {t('tryAgain')}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {email ? (
                  <>
                    {t('verificationEmailSent')} <strong>{email}</strong>
                  </>
                ) : (
                  t('verificationEmailSentGeneric')
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('clickLinkToVerify')}
              </p>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleResendEmail}
                  disabled={resendLoading || !email}
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                      {t('resending')}
                    </>
                  ) : (
                    t('resendEmail')
                  )}
                </Button>
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">{t('alreadyVerified')} </span>
                  <Link 
                    href="/auth/signin" 
                    className="text-primary hover:underline font-medium"
                  >
                    {t('signIn')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  )
}

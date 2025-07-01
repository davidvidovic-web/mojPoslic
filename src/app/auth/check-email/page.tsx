'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail, RefreshCw } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useState } from 'react'

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)

  const handleResendEmail = async () => {
    if (!email) {
      showToast.error('Email address is missing')
      return
    }

    setResending(true)

    try {
      // Fetch the user to get their name
      const userResponse = await fetch(`/api/auth/check-username?email=${encodeURIComponent(email)}`)
      if (!userResponse.ok) {
        throw new Error('Could not find user information')
      }
      
      const userData = await userResponse.json()
      
      // Resend the magic link
      const response = await fetch('/api/auth/register-magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: userData.name || 'User',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to resend magic link')
      }

      showToast.success('Magic link resent! Please check your email')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to resend magic link')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent a magic link to <strong>{email}</strong>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account and continue the setup process.</p>
            <p className="mt-2">The link will expire in 24 hours.</p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              disabled={resending}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Resending...' : 'Resend Magic Link'}
            </Button>
            
            <Link href="/login" passHref>
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

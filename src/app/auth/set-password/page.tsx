'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Briefcase } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { PasswordStrengthIndicator, usePasswordValidation } from '@/components/password-strength-indicator'

export default function SetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  // Get token and email from URL
  const token = searchParams.get('token')
  const callbackUrl = searchParams.get('callbackUrl') || '/account-type'

  // Validate password strength
  const passwordValidation = usePasswordValidation(password, {
    name: userName,
    email: userEmail
  })

  // Automatically verify token on load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return
      
      try {
        // Sign in with the token which will verify the email
        const result = await signIn('email', {
          token,
          redirect: false,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        // If successful, the user is now signed in
        setVerificationSuccess(true)
      } catch (error) {
        console.error('Verification error:', error)
        showToast.error('Invalid or expired verification link')
        // Redirect to login after a delay
        setTimeout(() => router.push('/login'), 3000)
      }
    }

    verifyToken()
  }, [token, router])

  // Get user info once signed in
  useEffect(() => {
    if (session?.user) {
      setUserEmail(session.user.email || '')
      setUserName(session.user.name || '')
    }
  }, [session])

  // Redirect to account type selection if already authenticated and profile not set up
  useEffect(() => {
    if (status === 'authenticated' && verificationSuccess) {
      if (!session.user.profileSetupCompleted) {
        // Give a little time to show success message
        setTimeout(() => router.push('/account-type'), 1500)
      } else {
        // User already completed setup
        router.push('/dashboard')
      }
    }
  }, [status, session, router, verificationSuccess])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showToast.error("Passwords don't match")
      return
    }

    // Check password strength
    if (passwordValidation && !passwordValidation.isValid) {
      showToast.error("Please meet all password requirements")
      return
    }

    setLoading(true)

    try {
      // Send the password to the server
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set password')
      }

      showToast.success('Password set successfully! Redirecting to account setup...')
      
      // Redirect to account type selection
      router.push('/account-type')
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  // Wait for verification before showing password form
  if (!verificationSuccess && status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-muted border">
                <Briefcase className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold">
                Poslić
              </h1>
            </div>
            <h2 className="text-xl font-semibold">Verifying your email</h2>
            <p className="text-muted-foreground mt-2">
              Please wait while we verify your email address...
            </p>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-muted border">
              <Briefcase className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold">
              Poslić
            </h1>
          </div>
          <h2 className="text-xl font-semibold">Set Your Password</h2>
          <p className="text-muted-foreground mt-2">
            Create a secure password for your account
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  Password
                </div>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              {password && (
                <PasswordStrengthIndicator
                  password={password}
                  userInfo={{
                    name: userName,
                    email: userEmail
                  }}
                  showRequirements={true}
                  showStrengthBar={true}
                  className="mt-3"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </div>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Passwords don&apos;t match
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                loading || 
                (passwordValidation && !passwordValidation.isValid) || 
                password !== confirmPassword
              }
            >
              {loading ? 'Setting password...' : 'Continue to Account Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

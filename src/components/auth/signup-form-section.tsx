'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import { PasswordStrengthIndicator, usePasswordValidation } from '@/components/password-strength-indicator'

interface SignupFormSectionProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  onSuccess?: () => void
  signupEmail: string
  setSignupEmail: (email: string) => void
  signupPassword: string
  setSignupPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  signupName: string
  setSignupName: (name: string) => void
}

export function SignupFormSection({ 
  loading, 
  setLoading, 
  onSuccess,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  confirmPassword,
  setConfirmPassword,
  signupName,
  setSignupName
}: SignupFormSectionProps) {
  const router = useRouter()
  
  // Validate password strength
  const passwordValidation = usePasswordValidation(signupPassword, {
    name: signupName,
    email: signupEmail
  })
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupPassword !== confirmPassword) {
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
      // Use Prisma-based API to register a new user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to sign up')
      }

      showToast.success('Account created successfully! Please log in to continue.')
      
      // Redirect to login page instead of auto-login to avoid session issues
      router.push('/login?registered=true')
      
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up'
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Full Name
          </div>
        </Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Enter your full name"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email
          </div>
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">
          <div className="flex items-center gap-1">
            <Lock className="h-4 w-4" />
            Password
          </div>
        </Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Choose a password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          autoCapitalize="none"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {signupPassword && (
          <PasswordStrengthIndicator
            password={signupPassword}
            userInfo={{
              name: signupName,
              email: signupEmail
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
          autoCapitalize="none"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {confirmPassword && signupPassword !== confirmPassword && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Passwords don&apos;t match
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || (passwordValidation && !passwordValidation.isValid) || signupPassword !== confirmPassword}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}

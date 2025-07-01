'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { UserRole } from '@/types/user'
import { RoleSelectionSection } from './role-selection-section'

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
  signupRole: UserRole
  setSignupRole: (role: UserRole) => void
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
  setSignupName,
  signupRole,
  setSignupRole
}: SignupFormSectionProps) {
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords don't match")
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
          role: signupRole,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sign up')
      }

      toast.success('Account created successfully! You can now log in.')
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up'
      toast.error(errorMessage)
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
      
      <RoleSelectionSection 
        signupRole={signupRole}
        setSignupRole={setSignupRole}
      />
      
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
          minLength={6}
        />
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
          minLength={6}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}

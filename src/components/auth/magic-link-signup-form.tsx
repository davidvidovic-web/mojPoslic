'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail } from 'lucide-react'
import { useState } from 'react'
import { showToast } from '@/lib/toast'

interface MagicLinkSignupFormProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  onSuccess?: () => void
}

export function MagicLinkSignupForm({ 
  loading, 
  setLoading, 
  onSuccess 
}: MagicLinkSignupFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)

    try {
      // Register a new user with magic link
      const response = await fetch('/api/auth/register-magic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to send magic link')
      }

      showToast.success('Magic link sent! Please check your email to continue setup.')
      
      // Redirect to check-email page
      window.location.href = '/auth/check-email?email=' + encodeURIComponent(email)
      
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link'
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="magic-name">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Full Name
          </div>
        </Label>
        <Input
          id="magic-name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="magic-email">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Email
          </div>
        </Label>
        <Input
          id="magic-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        We&apos;ll send you a magic link to verify your email and continue the account setup process.
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? 'Sending magic link...' : 'Send Magic Link'}
      </Button>
    </form>
  )
}

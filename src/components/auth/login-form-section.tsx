'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

interface LoginFormSectionProps {
  loading: boolean
  setLoading: (loading: boolean) => void
  onSuccess?: () => void
  loginEmail: string
  setLoginEmail: (email: string) => void
  loginPassword: string
  setLoginPassword: (password: string) => void
}

export function LoginFormSection({ 
  loading, 
  setLoading, 
  onSuccess,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword
}: LoginFormSectionProps) {
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting login with:', loginEmail)
      
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        throw new Error('Invalid email or password')
      }

      if (result?.ok) {
        toast.success('Successfully logged in!')
        onSuccess?.()
      } else {
        throw new Error('Login failed')
      }
    } catch (error: unknown) {
      console.error('Login exception:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to log in'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="flex items-center">
          <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
          Email
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password" className="flex items-center">
          <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
          Password
        </Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          autoCapitalize="none"
          autoComplete="current-password"
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}

/**
 * Supabase Authentication Form Component
 * 
 * This component provides both sign-in and sign-up functionality using Supabase Auth.
 * It gradually replaces the existing NextAuth-based authentication.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface SupabaseAuthFormProps {
  defaultTab?: 'signin' | 'signup'
  redirectTo?: string
  showProviders?: boolean
}

export function SupabaseAuthForm({ 
  defaultTab = 'signin', 
  redirectTo = '/',
  showProviders = true 
}: SupabaseAuthFormProps) {
  const t = useTranslations('auth')
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  const { signIn, signUp, signInWithProvider, resetPassword } = useSupabaseAuth()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (activeTab === 'signin') {
        const { error } = await signIn(email, password)
        if (!error) {
          // Redirect will be handled by auth state change
          window.location.href = redirectTo
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          toast.error(t('toast.passwordsDoNotMatch'))
          return
        }

        if (password.length < 6) {
          toast.error(t('toast.passwordTooShort'))
          return
        }

        const { error } = await signUp(email, password, {
          data: {
            full_name: name,
            redirect_to: `${window.location.origin}${redirectTo}`
          }
        })

        if (!error) {
          toast.success(t('toast.checkEmailConfirmation'))
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(t('toast.unexpectedError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderAuth = async (provider: 'google' | 'github' | 'facebook' | 'apple') => {
    setIsLoading(true)
    try {
      await signInWithProvider(provider)
    } catch (error) {
      console.error('Provider auth error:', error)
      toast.error(t('toast.authenticationFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error(t('toast.enterEmailAddress'))
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
    } catch (error) {
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome to mojPoslić</CardTitle>
        <CardDescription>
          {activeTab === 'signin' 
            ? 'Sign in to your account' 
            : 'Create a new account'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                onClick={handlePasswordReset}
                disabled={isLoading}
              >
                Forgot your password?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {showProviders && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleProviderAuth('google')}
                disabled={isLoading}
              >
                🔍 Google
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleProviderAuth('github')}
                disabled={isLoading}
              >
                📱 GitHub
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

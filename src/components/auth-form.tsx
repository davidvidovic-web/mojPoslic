'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Briefcase, User, Building, Mail, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { UserRole } from '@/types/user'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupRole, setSignupRole] = useState<UserRole>('employee')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) throw error

      toast.success('Successfully logged in!')
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log in'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
            role: signupRole,
          },
        },
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: signupEmail,
            name: signupName,
            role: signupRole,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      toast.success('Check your email for the confirmation link!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Apple'
      toast.error(errorMessage)
      setLoading(false)
    }
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
          <h2 className="text-xl font-semibold">Welcome</h2>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            <Button
              onClick={handleAppleLogin}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                <path d="M15.53 3.83c.893-1.09 1.491-2.58 1.326-4.105-1.281.052-2.847.916-3.766 2.03-.832.956-1.56 2.471-1.365 3.899 1.454.104 2.96-.739 3.805-1.824z"/>
              </svg>
              Continue with Apple
            </Button>
          </div>

          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/Password Forms */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
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
            </TabsContent>
            
            <TabsContent value="signup">
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
                  <Label htmlFor="signup-role">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      I am a...
                    </div>
                  </Label>
                  <Select value={signupRole} onValueChange={(value) => setSignupRole(value as UserRole)}>
                    <SelectTrigger id="signup-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Employee - Looking for jobs
                        </div>
                      </SelectItem>
                      <SelectItem value="employer">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Employer - Posting jobs
                        </div>
                      </SelectItem>
                      <SelectItem value="company">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Company - Business account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

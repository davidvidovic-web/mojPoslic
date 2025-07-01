'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Briefcase } from 'lucide-react'
import { SocialLoginSection } from './auth/social-login-section'
import { LoginFormSection } from './auth/login-form-section'
import { SignupFormSection } from './auth/signup-form-section'
import { MagicLinkSignupForm } from './auth/magic-link-signup-form'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [activeTab, setActiveTab] = useState('login')

  // Set initial tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['login', 'signup', 'magic'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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
          <SocialLoginSection loading={loading} setLoading={setLoading} />

          <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="px-3 text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/Password Forms */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginFormSection
                loading={loading}
                setLoading={setLoading}
                onSuccess={onSuccess}
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupFormSection
                loading={loading}
                setLoading={setLoading}
                onSuccess={onSuccess}
                signupEmail={signupEmail}
                setSignupEmail={setSignupEmail}
                signupPassword={signupPassword}
                setSignupPassword={setSignupPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                signupName={signupName}
                setSignupName={setSignupName}
              />
            </TabsContent>

            <TabsContent value="magic">
              <MagicLinkSignupForm
                loading={loading}
                setLoading={setLoading}
                onSuccess={onSuccess}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

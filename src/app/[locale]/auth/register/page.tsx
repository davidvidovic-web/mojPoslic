'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)

    try {
      // First create the user account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('registrationFailed'))
      }

      // Show success message - email should be sent automatically
      showToast.success(data.message || t('accountCreated'))
      
      // In development mode, show verification code in alert
      if (data.developmentMode && data.verificationCode) {
        alert(`🔐 Development Mode\n\nYour verification code: ${data.verificationCode}\n\nThis code will be auto-filled on the next page.`)
      }
      
      // Redirect to verification page
      if (data.redirectTo) {
        // In development mode, append the verification code to the URL for auto-fill
        const redirectUrl = data.developmentMode && data.verificationCode 
          ? `${data.redirectTo}&code=${data.verificationCode}`
          : data.redirectTo
        router.push(redirectUrl)
        return
      }
      
      // Reset form
      setFormData({
        email: "",
        password: ""
      })
      
      // Don't auto-sign in, wait for email verification
    } catch (error) {
      let errorMessage = t('registrationFailed')
      
      if (error instanceof Error) {
        // Map API error messages to translation keys
        if (error.message.includes('User with this email already exists')) {
          errorMessage = t('errorMessages.userAlreadyExists')
        } else if (error.message.includes('Invalid email address')) {
          errorMessage = t('errorMessages.invalidEmailAddress')
        } else if (error.message.includes('Password must be at least 8 characters')) {
          errorMessage = t('errorMessages.passwordTooShort')
        } else if (error.message.includes('Internal server error')) {
          errorMessage = t('errorMessages.internalServerError')
        } else if (error.message.includes('Account created successfully, but there was an issue sending the verification email')) {
          errorMessage = t('errorMessages.emailSendFailed')
        }
      }
      
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('createAccount')}</CardTitle>
          <CardDescription className="text-center">
            {t('createAccountDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Registration Form */}
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('enterEmail')}
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('createPassword')}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.password && (
                <PasswordStrengthIndicator 
                  password={formData.password} 
                  userInfo={{ email: formData.email }}
                  showStrengthBar={true}
                  showRequirements={true}
                  className="mt-3"
                />
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-foreground hover:bg-foreground/90 text-background" 
              disabled={loading}
            >
              {loading ? t('creatingAccount') : t('createAccountButton')}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('alreadyHaveAccount')} </span>
            <Link
              href="/auth/signin"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('signIn')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

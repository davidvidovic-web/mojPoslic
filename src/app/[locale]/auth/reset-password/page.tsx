'use client'

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  // Check if we have the necessary tokens/session for password reset
  useEffect(() => {
    const checkResetSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        showToast.error(t('resetTokenExpired') || 'Reset link has expired. Please request a new one.')
        router.push(`/${locale}/auth/forgot-password`)
        return
      }
    }

    checkResetSession()
  }, [router, locale, t])

  const validatePasswords = () => {
    if (!formData.password) {
      showToast.error(t('passwordRequired') || 'Password is required')
      return false
    }

    if (formData.password.length < 8) {
      showToast.error(t('passwordTooShort') || 'Password must be at least 8 characters')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      showToast.error(t('passwordsDoNotMatch') || 'Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        console.error('Password update error:', error)
        showToast.error(error.message || 'Failed to update password')
        return
      }

      setResetComplete(true)
      showToast.success(t('passwordResetSuccess') || 'Password updated successfully!')

    } catch (error) {
      console.error('Password reset error:', error)
      showToast.error(t('passwordResetError') || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">
              {t('passwordResetSuccessTitle') || 'Password Reset Complete'}
            </CardTitle>
            <CardDescription>
              {t('passwordResetSuccessDescription') || 'Your password has been successfully updated.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/auth/signin`}>
              <Button className="w-full">
                {t('signInWithNewPassword') || 'Sign In with New Password'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t('resetPasswordTitle') || 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {t('resetPasswordDescription') || 'Enter your new password below.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('newPassword') || 'New Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('newPasswordPlaceholder') || 'Enter new password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={loading}
                  autoComplete="new-password"
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
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('passwordRequirements') || 'Password must be at least 8 characters long'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t('confirmPassword') || 'Confirm Password'}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('confirmPasswordPlaceholder') || 'Confirm new password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (t('updatingPassword') || 'Updating Password...') : (t('updatePassword') || 'Update Password')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link 
              href={`/${locale}/auth/signin`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {t('backToSignIn') || 'Back to Sign In'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

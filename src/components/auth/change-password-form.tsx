'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordStrengthIndicator, usePasswordValidation } from '@/components/auth/password-strength-indicator'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'

export function ChangePasswordForm() {
  const { user } = useAuth()
  const t = useTranslations('auth.changePassword')
  const tErrors = useTranslations('errors.auth')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [resetTime, setResetTime] = useState<number | null>(null)

  // Use the new password validation hook
  const passwordValidation = usePasswordValidation(newPassword, {
    name: user?.name || undefined,
    email: user?.email || undefined,
  })

  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0
  const canSubmit = passwordValidation?.isValid && passwordsMatch && currentPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit) {
      toast.error(t('passwordMustMeetRequirements'))
      return
    }

    setIsLoading(true)
    setRateLimited(false)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(t('passwordChangedSuccessfully'))
        // Clear form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        if (data.rateLimited) {
          setRateLimited(true)
          setResetTime(data.resetTime)
          toast.error(tErrors('rateLimitedToast', { resetTime: data.resetTime }))
        } else {
          toast.error(data.error || t('failedToChangePassword'))
          if (data.remainingAttempts !== undefined) {
            toast.warning(t('attemptsRemaining', { count: data.remainingAttempts }))
          }
        }
      }
    } catch (err) {
      console.error('Password change error:', err)
      toast.error(t('changeError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rateLimited && resetTime && (
          <Alert className="mb-4 border-destructive/50 text-destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {tErrors('tooManyAttempts', { resetTime })}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('enterCurrentPassword')}
                disabled={rateLimited}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={rateLimited}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('enterNewPassword')}
                disabled={rateLimited}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={rateLimited}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmNewPassword')}
                disabled={rateLimited}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={rateLimited}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password match indicator */}
            {newPassword && confirmPassword && (
              <div className="flex items-center gap-2 text-sm">
                {passwordsMatch ? (
                  <>
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="h-2 w-2 bg-background rounded-full" />
                    </div>
                    <span className="text-blue-600">{t('passwordsMatch')}</span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                      <div className="h-1 w-2 bg-background rounded-full" />
                    </div>
                    <span className="text-red-600">{t('passwordsDoNotMatch')}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <PasswordStrengthIndicator
              password={newPassword}
              userInfo={{
                name: user?.name || undefined,
                email: user?.email || undefined,
              }}
              showStrengthBar={true}
              showRequirements={true}
            />
          )}

          <Button 
            type="submit" 
            disabled={isLoading || !canSubmit || rateLimited}
            className="w-full"
          >
            {isLoading ? t('changingPassword') : t('changePasswordButton')}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">{t('securityNotes')}</p>
              <ul className="space-y-1">
                <li>• {t('maxAttempts')}</li>
                <li>• {t('accountLocked')}</li>
                <li>• {t('useStrongPassword')}</li>
                <li>• {t('dontReuseCurrentPassword')}</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

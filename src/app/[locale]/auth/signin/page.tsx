'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"

export default function SignInPage() {
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle specific verification email errors
        if (result.error === 'EMAIL_NOT_VERIFIED_RESENT') {
          showToast.success(t('verificationEmailResent'))
          // Redirect to verification page with email
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
        } else if (result.error === 'EMAIL_NOT_VERIFIED_FAILED_TO_RESEND') {
          showToast.error(t('emailNotVerifiedFailedResend'))
          // Still redirect to verification page so user can manually resend
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(formData.email)}`
        } else {
          showToast.error(t('invalidCredentials'))
        }
      } else {
        showToast.success(t('signedInSuccessfully'))
        window.location.href = '/dashboard'
      }
    } catch {
      showToast.error(t('signInFailed'))
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('signInToMojPoslic')}</CardTitle>
          <CardDescription className="text-center">
            {t('signInDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  placeholder={t('enterPassword')}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pr-10"
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
            </div>

            <Button 
              type="submit" 
              className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold border-0 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
            <Link
              href="/auth/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('register')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

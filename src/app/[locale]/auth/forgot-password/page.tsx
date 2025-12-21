'use client'

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { showToast } from "@/lib/toast"
import { useTranslations } from "next-intl"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"

export default function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const { resetPassword } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      showToast.error(t('emailRequired') || 'Email is required')
      return
    }

    setLoading(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        console.error('Password reset error:', error)
        // Handle specific error messages with translations
        let errorMessage = error.message || 'Failed to send reset email'
        if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
          errorMessage = t('toast.rateLimitExceeded') || 'Previše zahtjeva. Molimo sačekajte prije slanja novog emaila za resetovanje lozinke.'
        }
        showToast.error(errorMessage)
        return
      }

      setEmailSent(true)
      showToast.success(t('resetEmailSent') || 'Password reset email sent! Check your inbox.')

    } catch (error) {
      console.error('Password reset error:', error)
      showToast.error(t('resetEmailError') || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">
              {t('resetEmailSentTitle') || 'Check Your Email'}
            </CardTitle>
            <CardDescription>
              {t('resetEmailSentDescription') || `We've sent a password reset link to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('resetEmailInstructions') || "Click the link in the email to reset your password. The link will expire in 1 hour."}
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                {t('sendAnotherEmail') || 'Send Another Email'}
              </Button>
              <Link href={`/${locale}/auth/signin`}>
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('backToSignIn') || 'Back to Sign In'}
                </Button>
              </Link>
            </div>
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
            {t('forgotPasswordTitle') || 'Forgot Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {t('forgotPasswordDescription') || 'Enter your email address and we\'ll send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('email') || 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder') || 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (t('sendingResetEmail') || 'Sending...') : (t('sendResetEmail') || 'Send Reset Email')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Link 
              href={`/${locale}/auth/signin`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4 inline" />
              {t('backToSignIn') || 'Back to Sign In'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

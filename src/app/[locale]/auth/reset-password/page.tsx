'use client'

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
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
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })

  // Debug information for troubleshooting
  useEffect(() => {
    const urlInfo = {
      href: window.location.href,
      search: window.location.search,
      hash: window.location.hash,
      pathname: window.location.pathname
    }
    
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const searchParams = new URLSearchParams(window.location.search)
    
    const debugData = {
      url: urlInfo,
      hashParams: Object.fromEntries(hashParams),
      searchParams: Object.fromEntries(searchParams),
      hasTokens: !!(hashParams.get('access_token') || searchParams.get('access_token')),
      tokenType: hashParams.get('type') || searchParams.get('type')
    }
    
    console.log('Reset Password Page Debug:', debugData)
    setDebugInfo(JSON.stringify(debugData, null, 2))
  }, [])

  // Enhanced session validation with server-side fallback
  const [sessionValid, setSessionValid] = useState<boolean | null>(null)
  const [sessionDiagnostics, setSessionDiagnostics] = useState<Record<string, unknown> | null>(null)
  const [serverVerifiedUser, setServerVerifiedUser] = useState<{ id: string; email: string } | null>(null)
  const [verificationMethod, setVerificationMethod] = useState<'client' | 'server' | null>(null)
  
  // Check session on component mount with comprehensive diagnostics and server fallback
  useEffect(() => {
    const validateSession = async () => {
      console.log('=== PASSWORD RESET SESSION DIAGNOSTICS ===')
      console.log('URL:', window.location.href)
      console.log('Timestamp:', new Date().toISOString())
      
      // First try client-side session validation
      const sessionChecks = []
      
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        const checkResult = {
          attempt: i + 1,
          timestamp: new Date().toISOString(),
          hasSession: !!session,
          sessionId: session?.access_token?.substring(0, 10) + '...',
          userEmail: session?.user?.email,
          expiresAt: session?.expires_at,
          timeUntilExpiry: session?.expires_at ? new Date(session.expires_at * 1000).getTime() - Date.now() : null,
          error: error?.message
        }
        
        sessionChecks.push(checkResult)
        console.log(`Session check ${i + 1}:`, checkResult)
        
        if (session) {
          setSessionValid(true)
          setVerificationMethod('client')
          setSessionDiagnostics({
            method: 'client',
            sessionFound: true,
            sessionChecks
          })
          return
        }
      }
      
      console.log('Client-side session failed, trying server-side verification...')
      
      // Extract token from URL for server-side verification
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const searchParams = new URLSearchParams(window.location.search)
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
      const tokenType = hashParams.get('type') || searchParams.get('type')
      
      if (accessToken && tokenType === 'recovery') {
        try {
          console.log('Attempting server-side token verification...')
          const response = await fetch('/api/auth/verify-reset-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: accessToken,
              type: tokenType
            })
          })
          
          const result = await response.json()
          
          if (response.ok && result.valid && result.user) {
            console.log('Server-side verification successful:', result.user)
            setSessionValid(true)
            setVerificationMethod('server')
            setServerVerifiedUser(result.user)
            setSessionDiagnostics({
              method: 'server',
              sessionFound: true,
              sessionChecks,
              serverVerification: {
                success: true,
                user: result.user
              }
            })
            return
          } else {
            console.error('Server-side verification failed:', result)
          }
        } catch (serverError) {
          console.error('Server-side verification error:', serverError)
        }
      }
      
      console.log('Both client and server verification failed')
      setSessionValid(false)
      setSessionDiagnostics({
        method: 'none',
        sessionFound: false,
        sessionChecks,
        urlAnalysis: {
          hasHash: !!window.location.hash,
          hasSearch: !!window.location.search,
          hashContent: window.location.hash,
          searchContent: window.location.search,
          hasAccessToken: !!accessToken,
          tokenType
        }
      })
    }
    
    validateSession()
  }, [])

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
      // First try client-side session approach
      if (verificationMethod === 'client') {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Updating password with client session...')
          const { error } = await supabase.auth.updateUser({
            password: formData.password
          })

          if (error) {
            console.error('Client password update error:', error)
            showToast.error(error.message || 'Failed to update password')
            return
          }

          console.log('Password updated successfully via client')
          setResetComplete(true)
          showToast.success(t('passwordResetSuccess') || 'Password updated successfully!')
          return
        }
      }

      // If client session failed or we're using server verification, use server approach
      if (verificationMethod === 'server' && serverVerifiedUser) {
        console.log('Updating password via server verification for user:', serverVerifiedUser.email)
        
        // Extract token for server-side password update
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        
        if (!accessToken) {
          showToast.error(t('resetTokenExpired') || 'Reset link has expired. Please request a new one.')
          router.push(`/${locale}/auth/forgot-password`)
          return
        }

        // Create a temporary Supabase client with the recovery token
        const tempSupabase = supabase
        const { error: setSessionError } = await tempSupabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '', // Recovery tokens don't have refresh tokens
        })

        if (setSessionError) {
          console.error('Failed to set recovery session:', setSessionError)
          showToast.error(t('resetTokenExpired') || 'Reset link has expired. Please request a new one.')
          router.push(`/${locale}/auth/forgot-password`)
          return
        }

        // Now update the password
        const { error } = await tempSupabase.auth.updateUser({
          password: formData.password
        })

        if (error) {
          console.error('Server password update error:', error)
          showToast.error(error.message || 'Failed to update password')
          return
        }

        console.log('Password updated successfully via server verification')
        setResetComplete(true)
        showToast.success(t('passwordResetSuccess') || 'Password updated successfully!')
        return
      }

      // If neither method worked
      console.error('No valid verification method available')
      showToast.error(t('resetTokenExpired') || 'Reset link has expired. Please request a new one.')
      router.push(`/${locale}/auth/forgot-password`)

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
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <div className="mb-2">
                Session Status: {sessionValid === null ? '⏳ Checking...' : sessionValid ? '✅ Valid' : '❌ Invalid'}
              </div>
              {verificationMethod && (
                <div className="mb-2">
                  Method: {verificationMethod === 'client' ? '🔵 Client Session' : '🟠 Server Verification'}
                </div>
              )}
              {serverVerifiedUser && (
                <div className="mb-2">
                  Verified User: {serverVerifiedUser.email}
                </div>
              )}
              {sessionDiagnostics && (
                <details>
                  <summary className="cursor-pointer">Session Diagnostics</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(sessionDiagnostics, null, 2)}</pre>
                </details>
              )}
              {debugInfo && (
                <details>
                  <summary className="cursor-pointer">URL Debug Info</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                </details>
              )}
            </div>
          )}
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

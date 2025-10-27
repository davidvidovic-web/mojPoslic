'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface RoleOption {
  id: 'tasker' | 'client' | 'company'
  titleKey: string
  descriptionKey: string
  icon: React.ReactNode
  featuresKey: string
  badgeKey?: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'tasker',
    titleKey: 'tasker.title',
    descriptionKey: 'tasker.description',
    icon: <User className="h-8 w-8" />,
    featuresKey: 'tasker.features',
    badgeKey: 'tasker.badge'
  },
  {
    id: 'client',
    titleKey: 'client.title',
    descriptionKey: 'client.description',
    icon: <Briefcase className="h-8 w-8" />,
    featuresKey: 'client.features'
  },
  {
    id: 'company',
    titleKey: 'company.title',
    descriptionKey: 'company.description',
    icon: <Building2 className="h-8 w-8" />,
    featuresKey: 'company.features',
    badgeKey: 'company.badge'
  }
]

export default function RoleSelectionPage() {
  const t = useTranslations('roleSelection')
  const router = useRouter()
  const { user, loading, refreshUser } = useSupabaseAuth()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<'tasker' | 'client' | 'company' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitingForSession, setWaitingForSession] = useState(false)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  // Check if user just verified email
  const isVerified = searchParams.get('verified') === 'true'
  const verifyToken = searchParams.get('token') // This indicates fresh verification

    loading,
    user: user ? { id: user.id, email: user.email } : null,
    isVerified,
    verifyToken,
    waitingForSession,
    initialCheckDone
  })

  // CRITICAL: Immediate detection and waiting state setup
  useEffect(() => {
    if (isVerified && verifyToken) {
      setWaitingForSession(true)
      // Give the auth context some time to initialize, then start refreshing
      setTimeout(() => {
        let attempts = 0
        const maxAttempts = 30 // Increased attempts
        
        const tryRefresh = async () => {
          attempts++
          
          try {
            await refreshUser()
            
            // Check if we need to continue
            if (attempts < maxAttempts) {
              setTimeout(tryRefresh, 800) // Longer delay between attempts
            } else {
              setWaitingForSession(false)
              setInitialCheckDone(true)
            }
          } catch (error) {
            console.error('RoleSelection: Error in refresh:', error)
            if (attempts < maxAttempts) {
              setTimeout(tryRefresh, 1000) // Even longer delay on error
            } else {
              setWaitingForSession(false)
              setInitialCheckDone(true)
            }
          }
        }
        
        tryRefresh()
      }, 1500) // Increased initial wait time
    } else {
      // Not a fresh verification, proceed normally
      setTimeout(() => {
        setInitialCheckDone(true)
      }, 500)
    }
  }, [isVerified, verifyToken, refreshUser])

  // Monitor for successful user detection
  useEffect(() => {
    if (waitingForSession && user) {
      setWaitingForSession(false)
      setInitialCheckDone(true)
    }
  }, [waitingForSession, user])

  // Debug auth state
  useEffect(() => {
      loading, 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      isVerified 
    })
  }, [loading, user, isVerified])

  // Pre-select user's current role if they have one
  useEffect(() => {
    if (user && user.role && !selectedRole) {
      setSelectedRole(user.role as 'tasker' | 'client' | 'company')
    }
  }, [user, selectedRole])

  // Handle redirects with proper flow tracking
  useEffect(() => {
    // Don't do any redirects until initial check is done
    if (!initialCheckDone) {
      return
    }
    
      loading, 
      user: !!user, 
      waitingForSession, 
      isVerified, 
      verifyToken,
      initialCheckDone,
      userDetails: user ? {
        email: user.email,
        role: user.role,
        profileSetupCompleted: user.profileSetupCompleted,
        emailVerified: user.emailVerified,
      } : null,
      'decision': (() => {
        if (waitingForSession) return 'WAIT - waitingForSession=true'
        if (loading) return 'WAIT - still loading'
        if (!user && !isVerified) return 'REDIRECT - no user, not verified'
        if (user && user.profileSetupCompleted) return 'REDIRECT - profile complete'
        if (user && !user.profileSetupCompleted) return 'CONTINUE - show role selection'
        return 'CONTINUE - default case'
      })()
    })
    
    // Don't redirect if we're waiting for session to establish
    if (waitingForSession) {
      return
    }
    
    // Don't redirect if still loading
    if (loading) {
      return
    }
    
    // Only redirect to signin if we're sure there's no user and we're not in a verification flow
    if (!user && !isVerified) {
      router.push('/auth/signin')
      return
    }
    
    // Special case: if we were expecting a user from verification but still don't have one
    if (!user && isVerified && verifyToken) {
      router.push('/auth/signin?error=verification_session_failed')
      return
    }

    // If user exists and profile is complete, redirect to dashboard
    if (user && user.profileSetupCompleted && user.role) {
      router.push('/dashboard')
      return
    }
    
    // If user exists but has no role (regardless of profile setup status), stay on role selection
    if (user && !user.role) {
      // This is the correct state - user should select role here
      return
    }
    
    // If user has role but profile not complete, redirect to profile setup
    if (user && user.role && !user.profileSetupCompleted) {
      router.push('/profile-setup')
      return
    }
    
  }, [user, loading, router, isVerified, verifyToken, waitingForSession, initialCheckDone])

  // Show loading if auth is still loading or if user just verified and we're waiting for session
  if (loading || waitingForSession || (isVerified && verifyToken && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            {waitingForSession ? 'Setting up your account...' : 
             isVerified && verifyToken ? 'Finalizing email verification...' : 
             'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting (but not for verified users who might still be establishing session)
  if (!isVerified && (!user || user.profileSetupCompleted)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  const handleRoleSelect = (roleId: 'tasker' | 'client' | 'company') => {
    // Disable company role selection for now
    if (roleId === 'company') {
      return
    }
    setSelectedRole(roleId)
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select your account type')
      return
    }

    setIsSubmitting(true)

    try {
      // Get the current session from Supabase client
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No valid session found:', sessionError)
        toast.error('Please sign in again to continue')
        router.push('/auth/signin')
        return
      }

      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Pass session token
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          role: selectedRole
        })
      })
      
      if (response.ok) {
        toast.success('Role updated successfully!')
        await refreshUser()
        router.push('/profile-setup')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update your role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update your role')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('selectRole')}</h1>
          <p className="text-muted-foreground text-lg">
            {selectedRole ? t('welcomeMessage', { role: t(`${selectedRole}.title`) }) : t('chooseRole')}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <Card
              key={role.id}
              className={`relative transition-all duration-300 ${
                role.id === 'company'
                  ? 'opacity-50 cursor-not-allowed'
                  : selectedRole === role.id
                  ? 'ring-2 ring-primary shadow-lg bg-primary/5 border-primary cursor-pointer'
                  : 'hover:shadow-md border-border cursor-pointer'
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              {role.badgeKey && (
                <Badge 
                  className="absolute -top-2 left-4 bg-primary text-primary-foreground"
                  variant="default"
                >
                  {t(role.badgeKey)}
                </Badge>
              )}
              
              {selectedRole === role.id && role.id !== 'company' && (
                <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full transition-colors ${
                    selectedRole === role.id && role.id !== 'company'
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {role.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{t(role.titleKey)}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t(role.descriptionKey)}
                </p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-sm">
                  {Object.values(t.raw(role.featuresKey) || {}).map((feature, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {String(feature)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isSubmitting}
            size="lg"
            className="px-8 py-3 text-lg font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {t('updating')}
              </>
            ) : (
              <>
                {selectedRole ? t('continue', { role: t(`${selectedRole}.title`) }) : t('continueAsUser')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          
          {selectedRole && (
            <p className="text-sm text-muted-foreground mt-3">
              {t('canChangeRole')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

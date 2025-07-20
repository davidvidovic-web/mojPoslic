'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface RoleGuardProps {
  children: React.ReactNode
  requireRole?: boolean
  requireProfileSetup?: boolean
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  requireRole = true, 
  requireProfileSetup = false,
  fallbackPath 
}: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const t = useTranslations('common')

  useEffect(() => {
    if (loading || redirecting) return

    // If no user, let middleware handle it
    if (!user) return

    // Check if role is required but missing
    if (requireRole && !user.role) {
      setRedirecting(true)
      router.replace(fallbackPath || '/role-selection')
      return
    }

    // Check if profile setup is required but not completed
    if (requireProfileSetup && user.role && !user.profileSetupCompleted) {
      setRedirecting(true)
      router.replace(fallbackPath || '/profile-setup')
      return
    }

  }, [user, loading, requireRole, requireProfileSetup, fallbackPath, router, redirecting])

  // Show loading state while checking authentication or redirecting
  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Don't render if user doesn't meet requirements
  if (requireRole && (!user || !user.role)) {
    return null
  }

  if (requireProfileSetup && (!user || !user.role || !user.profileSetupCompleted)) {
    return null
  }

  // All checks passed, render children
  return <>{children}</>
}

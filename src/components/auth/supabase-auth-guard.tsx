/**
 * Supabase Authentication Guard
 * Replaces NextAuth-based auth guard with Supabase auth
 */
'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { UserRole } from '@/contexts/supabase-auth-context'

interface SupabaseAuthGuardProps {
  children: React.ReactNode
  requireRole?: boolean
  requireProfileComplete?: boolean
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function SupabaseAuthGuard({ 
  children, 
  requireRole = false, 
  requireProfileComplete = false,
  allowedRoles,
  redirectTo 
}: SupabaseAuthGuardProps) {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (loading) return

    // Not authenticated
    if (!user) {
      const currentPath = window.location.pathname + window.location.search
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    // Check role requirement
    if (requireRole && !user.role) {
      router.push('/role-selection')
      return
    }

    // Check profile completion requirement
    if (requireProfileComplete && !user.profileSetupCompleted) {
      router.push('/profile-setup')
      return
    }

    // Check allowed roles
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push(redirectTo || '/dashboard')
      return
    }

    setIsChecking(false)
  }, [user, loading, requireRole, requireProfileComplete, allowedRoles, redirectTo, router])

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}

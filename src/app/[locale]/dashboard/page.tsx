'use client'

import { useAuth } from '@/contexts/auth-context'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { TaskerDashboard } from '@/components/dashboard/tasker-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { useEffect, Suspense, useRef } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { AuthUser } from '@/contexts/auth-context';

type DashboardContentProps = {
  user: AuthUser | null;
  loading: boolean;
};

function DashboardContent({ user, loading }: DashboardContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectAttempted = useRef(false)
  const tDashboard = useTranslations('dashboard')
  const tAuth = useTranslations('auth')

  // Check if we've recently redirected (within last 5 seconds)
  const checkRecentRedirect = () => {
    const lastRedirect = localStorage.getItem('lastRedirectTime')
    if (lastRedirect) {
      const timeDiff = Date.now() - parseInt(lastRedirect)
      return timeDiff < 5000 // 5 seconds
    }
    return false
  }

  // Handle payment success/cancellation
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    
    if (payment === 'success' && sessionId) {
      toast.success(tDashboard('notifications.paymentSuccessful'))
      // Clean up URL
      router.replace('/dashboard')
    } else if (payment === 'cancelled') {
      toast.error(tDashboard('notifications.paymentCancelled'))
      // Clean up URL
      router.replace('/dashboard')
    }
  }, [searchParams, router, tDashboard])

  // Redirect to role selection if no role, or profile setup if role but profile incomplete
  useEffect(() => {
    // Prevent multiple redirect attempts, during loading, or if recently redirected
    if (redirectAttempted.current || loading || checkRecentRedirect()) return
    
    // Only redirect if we have a user object and it's stable
    if (user) {
      if (!user.role) {
        redirectAttempted.current = true
        localStorage.setItem('lastRedirectTime', Date.now().toString())
        router.replace('/role-selection')
      } else if (user.profileSetupCompleted === false) {
        redirectAttempted.current = true
        localStorage.setItem('lastRedirectTime', Date.now().toString())
        router.replace('/profile-setup')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tDashboard('loading.dashboard')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>{tDashboard('access.required')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {tDashboard('access.signInRequired')}
            </p>
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              {tAuth('signIn')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render role-specific dashboard with admin override
  const dashboardView = searchParams.get('view') || 'default'
  
  // Admin can access any dashboard view
  if (user.role === UserRole.admin) {
    switch (dashboardView) {
      case 'client':
        return <ClientDashboard />
      case 'company':
        return <CompanyDashboard />
      case 'tasker':
        return <TaskerDashboard />
      case 'admin':
      default:
        return <AdminDashboard />
    }
  }
  
  // Regular users get their role-specific dashboard
  switch (user.role) {
    case 'client':
      return <ClientDashboard />
    case 'company':
      return <CompanyDashboard />
    case 'tasker':
      return <TaskerDashboard />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {t('errors.unknownUserRole')}
              </p>
            </CardContent>
          </Card>
        </div>
      )
  }
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user, loading } = useAuth();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading.dashboard')}</p>
        </div>
      </div>
    }>
      <DashboardContent user={user} loading={loading} />
    </Suspense>
  )
}
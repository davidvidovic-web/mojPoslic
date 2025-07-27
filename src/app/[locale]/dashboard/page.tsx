'use client'

import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'
import { TaskerDashboard } from '@/components/dashboard/tasker-dashboard'
import { RegistrationFlowGuard } from '@/components/auth/registration-flow-guard'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { AuthUser } from '@/contexts/supabase-auth-context';

type DashboardContentProps = {
  user: AuthUser | null;
  loading: boolean;
};

function DashboardContent({ user, loading }: DashboardContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tDashboard = useTranslations('dashboard')

  // Handle payment-related toasts based on search params
  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') {
      toast.success(tDashboard('notifications.paymentSuccessful'))
      // Clean up URL
      router.replace('/dashboard')
    } else if (payment === 'cancelled') {
      toast.error(tDashboard('notifications.paymentCancelled'))
      // Clean up URL
      router.replace('/dashboard')
    }
  }, [searchParams, router, tDashboard])

  // Show loading state
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

  // RoleGuard ensures user exists and has role + completed setup, so we can safely access user
  if (!user) {
    return null // This shouldn't happen due to RoleGuard, but keep for safety
  }

  // Render role-specific dashboard with admin override
  const dashboardView = searchParams.get('view') || 'default'
  
  // Admin can access any dashboard view
  if (user.role === UserRole.admin) {
    switch (dashboardView) {
      case 'client':
        return <ClientDashboard />
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
  const { user, loading } = useSupabaseAuth();
  
  // Determine the appropriate loading message based on user role
  const getLoadingMessage = () => {
    if (user?.role) {
      return t(`loading.${user.role}`)
    }
    return t('loading.dashboard')
  }
  
  // Single loading state for better UX - show dashboard loading immediately
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{getLoadingMessage()}</p>
        </div>
      </div>
    )
  }
  
  return (
    <RegistrationFlowGuard>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{getLoadingMessage()}</p>
          </div>
        </div>
      }>
        <DashboardContent user={user} loading={false} />
      </Suspense>
    </RegistrationFlowGuard>
  )
}
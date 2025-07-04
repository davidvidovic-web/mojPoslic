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
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle payment success/cancellation
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    
    if (payment === 'success' && sessionId) {
      toast.success('Payment successful! Your connections have been added to your account.')
      // Clean up URL
      router.replace('/dashboard')
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled.')
      // Clean up URL
      router.replace('/dashboard')
    }
  }, [searchParams, router])

  // Redirect to profile setup if not completed
  useEffect(() => {
    if (user && !user.profileSetupCompleted) {
      router.push('/profile-setup')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to be signed in to access the dashboard.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading while redirecting to profile setup if not completed
  if (user && !user.profileSetupCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  // Render role-specific dashboard with admin override
  const dashboardView = searchParams.get('view') || 'default'
  
  // Admin can access any dashboard view
  if (user.role === UserRole.admin) {
    switch (dashboardView) {
      case 'client':
      case 'client':
        return <ClientDashboard />
      case 'company':
        return <CompanyDashboard />
      case 'tasker':
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
                Unknown user role. Please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
  }
}

'use client'

import { useAuth } from '@/contexts/prisma-auth-context'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { EmployerDashboard } from '@/components/dashboard/employer-dashboard'
import { EmployeeDashboard } from '@/components/dashboard/employee-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  // Render role-specific dashboard
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'employer':
      return <EmployerDashboard />
    case 'employee':
      return <EmployeeDashboard />
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

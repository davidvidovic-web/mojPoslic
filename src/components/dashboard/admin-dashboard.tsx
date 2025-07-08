'use client'

import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield } from 'lucide-react'
import AdminStatsCards from './admin/admin-stats-cards'
import UserManagementTab from './admin/user-management-tab'
import JobManagementTab from './admin/job-management-tab'
import SystemManagementTab from './admin/system-management-tab'
import BillingManagementTab from './admin/billing-management-tab'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import { 
  useAdminUsers, 
  useAdminJobs, 
  useAdminStats, 
  useAdminCategories, 
  useAdminCities 
} from '@/hooks/use-admin'

export function AdminDashboard() {
  const { user } = useAuth()
  const { currentAdminTab, setAdminTab } = useNavigationStore()
  
  // TanStack Query hooks for all admin data
  const { data: users, isLoading: usersLoading } = useAdminUsers()
  const { data: jobs, isLoading: jobsLoading } = useAdminJobs()
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: categories } = useAdminCategories()
  const { data: cities } = useAdminCities()

  // Check if any critical data is still loading
  const isLoading = usersLoading || jobsLoading || statsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Convert data types to match component expectations
  const mappedCategories = categories?.map(cat => ({
    id: cat.id,
    key: cat.key,
    nameEN: cat.name_en,
    nameBS: cat.name_bs,
    isPopular: true, // Default to true since hook doesn't have this field
    sortOrder: cat.sort_order,
    isActive: cat.is_active,
    createdAt: new Date().toISOString(), // Default since hook doesn't have this field
  })) || []

  const mappedCities = cities?.map(city => ({
    id: city.id,
    key: city.key,
    nameEN: city.name_en,
    nameBS: city.name_bs,
    isSpecial: false, // Default to false since hook doesn't have this field
    sortOrder: city.sort_order,
    isActive: city.is_active,
    createdAt: new Date().toISOString(), // Default since hook doesn't have this field
  })) || []

  // Convert stats format
  const mappedStats = stats ? {
    users: {
      total: stats.totalUsers,
      admin: 0, // These detailed breakdowns might not be in the hook's stats
      client: 0,
      tasker: 0,
      company: 0,
    },
    jobs: {
      total: stats.totalJobs,
      active: stats.totalActiveJobs,
      featured: stats.totalFeaturedJobs,
    },
    growth: {
      percentage: 0, // Default values
      recentUsers: stats.monthlySignups,
      previousUsers: 0,
    }
  } : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>!
          </p>
        </div>

        {/* Management Tabs */}
        <Tabs 
          value={currentAdminTab} 
          onValueChange={(value) => setAdminTab(value as 'users' | 'jobs' | 'system' | 'billing' | 'analytics')} 
          className="space-y-6"
        >
          {/* Mobile: Dropdown-style tabs */}
          <div className="block sm:hidden">
            <TabsList className="w-full grid grid-cols-1 h-auto p-1 bg-muted">
              <div className="grid grid-cols-2 gap-1">
                <TabsTrigger value="users" className="text-xs px-2 py-2">
                  Users
                </TabsTrigger>
                <TabsTrigger value="jobs" className="text-xs px-2 py-2">
                  Jobs
                </TabsTrigger>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <TabsTrigger value="system" className="text-xs px-2 py-2">
                  System
                </TabsTrigger>
                <TabsTrigger value="billing" className="text-xs px-2 py-2">
                  Billing
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs px-2 py-2">
                  Statistics
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
          
          {/* Desktop: Horizontal tabs */}
          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="jobs">Job Management</TabsTrigger>
              <TabsTrigger value="system">System Management</TabsTrigger>
              <TabsTrigger value="billing">Billing Management</TabsTrigger>
              <TabsTrigger value="analytics">Statistics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users">
            <UserManagementTab 
              users={users || []} 
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagementTab 
              jobs={jobs || []} 
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemManagementTab 
              categories={mappedCategories}
              cities={mappedCities}
            />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagementTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminStatsCards 
              stats={mappedStats} 
              isLoading={statsLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

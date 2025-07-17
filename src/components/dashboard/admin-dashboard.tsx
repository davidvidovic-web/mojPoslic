'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdminStatsCards from './admin/admin-stats-cards'
import UserManagementTab from './admin/user-management-tab'
import JobManagementTab from './admin/job-management-tab'
import SystemManagementTab from './admin/system-management-tab'
import BillingManagementTab from './admin/billing-management-tab'
import { DashboardLayout } from './dashboard-layout'
import { useNavigationStore } from '@/stores/navigation-store'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()
  
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
      <DashboardLayout userRole="admin" userName={user?.name}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('dashboard.loading.admin')}</p>
          </div>
        </div>
      </DashboardLayout>
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

  return (
    <DashboardLayout userRole="admin" userName={user?.name}>
      {/* Admin Stats - collapsed on mobile */}
      <div className="hidden md:block mb-8">
        {stats && (
          <AdminStatsCards 
            stats={stats} 
            isLoading={statsLoading}
          />
        )}
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
                {t('userManagement')}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs px-2 py-2">
                {t('jobManagement')}
              </TabsTrigger>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              <TabsTrigger value="system" className="text-xs px-2 py-2">
                {t('systemManagement')}
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-xs px-2 py-2">
                {t('billingManagement')}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs px-2 py-2">
                {t('statistics')}
              </TabsTrigger>
            </div>
          </TabsList>
        </div>
        
        {/* Desktop: Horizontal tabs */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">{t('userManagement')}</TabsTrigger>
            <TabsTrigger value="jobs">{t('jobManagement')}</TabsTrigger>
            <TabsTrigger value="system">{t('systemManagement')}</TabsTrigger>
            <TabsTrigger value="billing">{t('billingManagement')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('statistics')}</TabsTrigger>
          </TabsList>
        </div>

        {/* Mobile stats */}
        {stats && (
          <div className="block sm:hidden mb-6">
            <AdminStatsCards 
              stats={stats} 
              isLoading={statsLoading}
            />
          </div>
        )}

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
            stats={stats || null} 
            isLoading={statsLoading}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

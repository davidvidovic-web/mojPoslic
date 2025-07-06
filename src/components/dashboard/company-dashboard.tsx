'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { CompanyStatsCards } from './company/company-stats-cards'
import { OverviewTab } from './company/overview-tab'
import { JobsManagementTab } from './company/jobs-management-tab'
import { ConnectionsSection } from '@/components/dashboard/connections-section'
import { CompanyFinancesSection } from './company/company-finances-section'
import { CompanyMessagesSection } from './company/company-messages-section'
import { formatDisplayName, getTimeBasedGreetingWithIcon } from '@/lib/utils'
import { DashboardFooter } from '@/components/core/dashboard-footer'
import { Sunrise, Sun, Moon } from 'lucide-react'

interface CompanyJob {
  id: string
  title: string
  description: string
  type: string
  salary?: string
  location: string
  createdAt: string
  status: 'active' | 'inactive' | 'featured'
  applicationsCount: number
  viewsCount: number
}

interface CompanyStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalViews: number
  featuredJobs: number
  monthlyApplications: number
}

export function CompanyDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<CompanyJob[]>([])
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Get time-based greeting with icon
  const { greeting, iconName } = getTimeBasedGreetingWithIcon()
  
  // Helper to render the appropriate icon
  const renderTimeIcon = () => {
    const iconProps = { className: "h-4 w-4" }
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise {...iconProps} />
      case 'Sun':
        return <Sun {...iconProps} />
      case 'Moon':
        return <Moon {...iconProps} />
      default:
        return <Sun {...iconProps} />
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchJobs(),
        fetchStats()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/company/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/company/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading company dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16l3.5-2 3.5 2 3.5-2 3.5 2zM13 8l-2 2-2-2m0 4l2 2 2-2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Company Dashboard
                </h1>
                <p className="text-purple-600 dark:text-purple-300 mt-1 flex items-center gap-2">
                  <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>
                  {renderTimeIcon()}
                  <span>{greeting}! Manage your enterprise hiring.</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-purple-600 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Enterprise Account</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Team Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Messages</TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Statistics</TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Finances
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Analytics
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white disabled:opacity-50" disabled>
              <div className="flex items-center gap-1">
                Integrations
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Company Overview */}
              <div className="lg:col-span-2 space-y-8">
                <OverviewTab jobs={jobs} />
                <JobsManagementTab jobs={jobs} />
              </div>

              {/* Right Column - Connections */}
              <div className="space-y-8">
                <ConnectionsSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finances">
            <CompanyFinancesSection />
          </TabsContent>

          <TabsContent value="messages">
            <CompanyMessagesSection />
          </TabsContent>

          <TabsContent value="statistics">
            <CompanyStatsCards stats={stats} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Enterprise-level analytics, team performance metrics, and advanced reporting dashboards will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1a2 2 0 104 0V4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Enterprise Integrations Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect with enterprise tools like Salesforce, SAP, Microsoft Teams, HubSpot, and other business systems to streamline your hiring workflow.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}

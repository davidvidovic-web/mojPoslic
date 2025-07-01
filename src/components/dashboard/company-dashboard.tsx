'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { CompanyStatsCards } from './company/company-stats-cards'
import { OverviewTab } from './company/overview-tab'
import { JobsManagementTab } from './company/jobs-management-tab'
import { ApplicationsTab, AnalyticsTab } from './company/applications-analytics-tabs'

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
  const [activeTab, setActiveTab] = useState('overview')

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Building2 className="h-8 w-8 mr-3" />
            Company Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}! Manage your company&apos;s job postings and recruitment.
          </p>
        </div>

        {/* Stats Cards */}
        <CompanyStatsCards stats={stats} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab jobs={jobs} />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsManagementTab jobs={jobs} />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

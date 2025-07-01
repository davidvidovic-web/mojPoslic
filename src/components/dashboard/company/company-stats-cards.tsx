'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, TrendingUp, Eye, UserCheck } from 'lucide-react'

interface CompanyStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalViews: number
  featuredJobs: number
  monthlyApplications: number
}

interface CompanyStatsCardsProps {
  stats: CompanyStats | null
}

export function CompanyStatsCards({ stats }: CompanyStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.activeJobs || 0} active
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Applications</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.monthlyApplications || 0} this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
          <p className="text-xs text-muted-foreground">Job listing views</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Featured Jobs</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.featuredJobs || 0}</div>
          <p className="text-xs text-muted-foreground">Premium listings</p>
        </CardContent>
      </Card>
    </div>
  )
}

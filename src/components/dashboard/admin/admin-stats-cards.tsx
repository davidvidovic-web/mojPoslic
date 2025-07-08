'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Building,
  Building2,
  User
} from 'lucide-react'
import { type AdminStats } from '@/hooks/use-admin'

interface AdminStatsCardsProps {
  stats: AdminStats | null
  isLoading?: boolean
}

export function AdminStatsCards({ stats, isLoading = false }: AdminStatsCardsProps) {
  // Handle loading state or missing data
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8 opacity-60">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium bg-muted h-4 w-24 rounded"></CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-muted h-8 w-16 rounded mb-1"></div>
              <p className="text-xs text-muted-foreground bg-muted h-3 w-20 rounded"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Map the stats from the API format to the display format
  const userStats = {
    total: stats.totalUsers || 0,
    admins: 0, // These detailed stats aren't in our current API
    clients: 0,
    taskers: 0,
    companies: 0,
  }
  
  const jobStats = {
    total: stats.totalJobs || 0,
    active: stats.totalActiveJobs || 0,
    featured: stats.totalFeaturedJobs || 0,
  }
  
  const growthStats = {
    percentage: 0, // Calculate this if needed
    recentUsers: stats.monthlySignups || 0,
    previousUsers: 0,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.total}</div>
          <p className="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.clients}</div>
          <p className="text-xs text-muted-foreground">Hiring clients</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taskers</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.taskers}</div>
          <p className="text-xs text-muted-foreground">Service providers</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userStats.companies}</div>
          <p className="text-xs text-muted-foreground">Company accounts</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{jobStats.total}</div>
          <p className="text-xs text-muted-foreground">Job postings</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {growthStats.percentage !== undefined 
              ? `${growthStats.percentage > 0 ? '+' : ''}${growthStats.percentage}%` 
              : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Add default export
export default AdminStatsCards

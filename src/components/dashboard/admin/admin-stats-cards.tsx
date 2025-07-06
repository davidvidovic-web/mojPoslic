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

interface AdminStats {
  users: {
    total: number
    admin: number
    client: number
    tasker: number
    company: number
  }
  jobs: {
    total: number
    active: number
    featured: number
  }
  growth: {
    percentage: number
    recentUsers: number
    previousUsers: number
  }
}

interface AdminStatsCardsProps {
  stats: AdminStats | null
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const userStats = {
    total: stats?.users.total || 0,
    admins: stats?.users.admin || 0,
    clients: stats?.users.client || 0,
    taskers: stats?.users.tasker || 0,
    companies: stats?.users.company || 0,
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
          <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
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
            {stats?.growth.percentage !== undefined 
              ? `${stats.growth.percentage > 0 ? '+' : ''}${stats.growth.percentage}%` 
              : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}

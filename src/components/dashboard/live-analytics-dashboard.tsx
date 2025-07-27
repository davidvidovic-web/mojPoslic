'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Users, Briefcase, Eye, Calendar, MessageCircle, Activity } from 'lucide-react'
import { useRealtimeAnalytics } from '@/hooks/use-realtime-analytics'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'
import { formatDistanceToNow } from 'date-fns'

interface LiveAnalyticsDashboardProps {
  className?: string
}

export function LiveAnalyticsDashboard({ className }: LiveAnalyticsDashboardProps) {
  const { 
    liveStats, 
    jobStats, 
    userEngagement, 
    isLoading, 
    error, 
    lastUpdated, 
    refresh,
    isAdmin
  } = useRealtimeAnalytics()
  
  const { unreadCount } = useRealtimeNotifications()

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Failed to load analytics: {error}</p>
            <Button onClick={refresh} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Analytics</h2>
          {lastUpdated && (
            <p className="text-muted-foreground">
              Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          )}
        </div>
        <Button onClick={refresh} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Live Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{liveStats.activeJobs}</span> active
            </p>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">{liveStats.pendingApplications}</span> pending review
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{liveStats.activeUsers}</span> active today
            </p>
          </CardContent>
        </Card>

        {/* Job Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{jobStats.uniqueViews}</span> unique views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Posted Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.jobsPostedToday}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((liveStats.jobsPostedToday / Math.max(liveStats.totalJobs, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.applicationsToday}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((liveStats.applicationsToday / Math.max(liveStats.totalApplications, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveStats.newUsersToday}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((liveStats.newUsersToday / Math.max(liveStats.totalUsers, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Jobs */}
      {jobStats.topPerformingJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
            <CardDescription>
              Jobs with the highest engagement (views + applications)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobStats.topPerformingJobs.map((job, index) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium truncate max-w-[300px]">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.views} views • {job.applications} applications
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Score: {job.views + job.applications * 2}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Engagement */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Active user statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Daily Active Users</span>
                <Badge variant="secondary">{userEngagement.dailyActiveUsers}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Weekly Active Users</span>
                <Badge variant="secondary">{userEngagement.weeklyActiveUsers}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Retention Rate</span>
                <Badge variant="secondary">
                  {Math.round((userEngagement.dailyActiveUsers / Math.max(userEngagement.weeklyActiveUsers, 1)) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time system indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Connections Used Today</span>
                <Badge variant="outline">{liveStats.connectionsUsed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unread Notifications</span>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                  {unreadCount}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Applications/Job</span>
                <Badge variant="secondary">
                  {jobStats.averageApplicationsPerJob.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">System Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Activity className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              View Messages ({unreadCount})
            </Button>
            <Button size="sm" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button size="sm" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            {isAdmin && (
              <Button size="sm" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

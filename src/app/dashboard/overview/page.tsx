'use client'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'
import { 
  Briefcase, 
  BarChart3, 
  MessageSquare, 
  Zap,
  ArrowRight,
  Lock,
  Puzzle
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardOverview() {
  const { user } = useAuth()

  const quickActions = [
    {
      title: 'Job Applications',
      description: 'Track applications, saved jobs, and recommendations',
      icon: <Briefcase className="h-6 w-6" />,
      href: '/dashboard/applications',
      color: 'text-blue-600'
    },
    {
      title: 'Messages',
      description: 'Communicate with clients and employers',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/dashboard/messages',
      color: 'text-orange-600'
    },
    {
      title: 'Connections',
      description: 'Manage your application credits',
      icon: <Zap className="h-6 w-6" />,
      href: '/dashboard/connections',
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! What would you like to do today?
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Quick Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Active Applications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Saved Jobs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Completed Jobs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.href} className="hover:shadow-md transition-all hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`${action.color}`}>
                    {action.icon}
                  </div>
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                <Link href={action.href} className="block">
                  <Button variant="outline" className="w-full group">
                    Go to {action.title}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          
          {/* Statistics Card - Locked */}
          <Card className="hover:shadow-md transition-all relative">
            <div className="absolute inset-0 bg-muted/20 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <CardHeader className="pb-3 opacity-50">
              <CardTitle className="flex items-center gap-3">
                <div className="text-purple-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 opacity-50">
              <p className="text-sm text-muted-foreground">
                View your performance and work metrics
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Statistics
              </Button>
            </CardContent>
          </Card>
          
          {/* Finances Card - Locked */}
          <Card className="hover:shadow-md transition-all relative">
            <div className="absolute inset-0 bg-muted/20 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <CardHeader className="pb-3 opacity-50">
              <CardTitle className="flex items-center gap-3">
                <div className="text-emerald-600">
                  <Lock className="h-6 w-6" />
                </div>
                Finances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 opacity-50">
              <p className="text-sm text-muted-foreground">
                Manage earnings and payment history
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Finances
              </Button>
            </CardContent>
          </Card>
          
          {/* Integrations Card - Locked */}
          <Card className="hover:shadow-md transition-all relative">
            <div className="absolute inset-0 bg-muted/20 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              </div>
            </div>
            <CardHeader className="pb-3 opacity-50">
              <CardTitle className="flex items-center gap-3">
                <div className="text-indigo-600">
                  <Puzzle className="h-6 w-6" />
                </div>
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 opacity-50">
              <p className="text-sm text-muted-foreground">
                Connect with external tools and services
              </p>
              <Button variant="outline" className="w-full" disabled>
                View Integrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

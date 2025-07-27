'use client'

import React from 'react'
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MigrationItem {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'pending' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  estimatedHours?: number
  dependencies?: string[]
}

const migrationItems: MigrationItem[] = [
  {
    id: 'jobs-api',
    title: 'Jobs API Migration',
    description: 'Replace /api/jobs/* routes with useJobManager() hooks',
    status: 'completed',
    priority: 'high',
    estimatedHours: 8
  },
  {
    id: 'applications-api',
    title: 'Applications API Migration', 
    description: 'Replace /api/applications/* routes with useApplicationManager() hooks',
    status: 'in-progress',
    priority: 'high',
    estimatedHours: 6,
    dependencies: ['jobs-api']
  },
  {
    id: 'notifications-api',
    title: 'Notifications API Migration',
    description: 'Replace /api/notifications/* routes with useNotificationManager() hooks',
    status: 'pending',
    priority: 'high',
    estimatedHours: 4,
    dependencies: ['applications-api']
  },
  {
    id: 'static-data-api',
    title: 'Static Data API Migration',
    description: 'Replace /api/cities & /api/categories with useStaticDataManager() hooks',
    status: 'completed',
    priority: 'medium',
    estimatedHours: 3
  },
  {
    id: 'messaging-api',
    title: 'Messaging API Migration',
    description: 'Replace messaging API routes with real-time hooks',
    status: 'pending',
    priority: 'medium',
    estimatedHours: 12,
    dependencies: ['jobs-api', 'applications-api']
  },
  {
    id: 'user-management-api',
    title: 'User Management API Migration',
    description: 'Replace user API routes with Supabase auth hooks',
    status: 'pending',
    priority: 'medium',
    estimatedHours: 8,
    dependencies: ['static-data-api']
  },
  {
    id: 'file-upload-migration',
    title: 'File Upload Migration',
    description: 'Replace custom file upload with Supabase Storage',
    status: 'pending',
    priority: 'low',
    estimatedHours: 6
  },
  {
    id: 'admin-api',
    title: 'Admin API Migration',
    description: 'Replace admin API routes with Supabase RLS policies',
    status: 'pending',
    priority: 'low',
    estimatedHours: 10,
    dependencies: ['user-management-api']
  }
]

const StatusIcon = ({ status }: { status: MigrationItem['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'in-progress':
      return <Clock className="h-5 w-5 text-yellow-500" />
    case 'pending':
      return <Circle className="h-5 w-5 text-gray-400" />
    case 'blocked':
      return <AlertCircle className="h-5 w-5 text-red-500" />
  }
}

const PriorityBadge = ({ priority }: { priority: MigrationItem['priority'] }) => {
  const variants = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary'
  } as const

  return (
    <Badge variant={variants[priority]} className="text-xs">
      {priority.toUpperCase()}
    </Badge>
  )
}

export function MigrationChecklist() {
  const completedItems = migrationItems.filter(item => item.status === 'completed')
  const inProgressItems = migrationItems.filter(item => item.status === 'in-progress')
  const pendingItems = migrationItems.filter(item => item.status === 'pending')
  const blockedItems = migrationItems.filter(item => item.status === 'blocked')

  const totalEstimatedHours = migrationItems.reduce((total, item) => total + (item.estimatedHours || 0), 0)
  const completedHours = completedItems.reduce((total, item) => total + (item.estimatedHours || 0), 0)
  const progressPercentage = Math.round((completedHours / totalEstimatedHours) * 100)

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Migration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{inProgressItems.length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{pendingItems.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{blockedItems.length}</div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Items */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrationItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <StatusIcon status={item.status} />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <PriorityBadge priority={item.priority} />
                    {item.estimatedHours && (
                      <Badge variant="outline" className="text-xs">
                        {item.estimatedHours}h
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  
                  {item.dependencies && item.dependencies.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Depends on:</span>
                      {item.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-xs">
                          {migrationItems.find(i => i.id === dep)?.title || dep}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <div className="font-medium">Complete Applications API Migration</div>
                <div className="text-sm text-muted-foreground">
                  Finish migrating useApplicationManager() hooks and update components
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <div className="font-medium">Update Component Imports</div>
                <div className="text-sm text-muted-foreground">
                  Replace old API route calls in existing components with new hooks
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <div className="font-medium">Test Real-time Features</div>
                <div className="text-sm text-muted-foreground">
                  Verify real-time updates work across multiple browser sessions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

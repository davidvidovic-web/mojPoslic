'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Job } from '@/types/job'
import { TaskerStatsCards } from '@/components/dashboard/tasker/tasker-stats-cards'
import { formatDisplayName, getTimeBasedGreeting } from '@/lib/utils'

interface JobApplication {
  id: string
  job_id: string
  applied_at: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'completed'
  job: Job
}

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  completed: number
  rejected: number
  totalEarnings: number
}

export default function StatisticsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    totalEarnings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/user/applications?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setApplications(data.applications || [])
          setStats(data.stats || {
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            rejected: 0,
            totalEarnings: 0
          })
        } else {
          console.error('Error fetching statistics:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your statistics...</p>
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
          <h1 className="text-3xl font-bold text-foreground">
            Statistics
          </h1>
          <p className="text-muted-foreground mt-2">
            {getTimeBasedGreeting()}, <span className="font-bold">{formatDisplayName(user?.name || undefined)}</span>! View your work performance and earnings.
          </p>
        </div>

        {/* Statistics Content */}
        <div className="max-w-6xl">
          <TaskerStatsCards 
            applications={applications} 
            completedJobs={stats.completed}
            totalEarnings={stats.totalEarnings}
          />
        </div>
      </div>
    </div>
  )
}

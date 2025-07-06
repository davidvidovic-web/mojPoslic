'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, CheckCircle, DollarSign } from "lucide-react"
import { Job } from "@/types/job"

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

interface TaskerQuickStatsProps {
  applications: JobApplication[]
  stats: ApplicationStats
}

export function TaskerQuickStats({ stats }: Omit<TaskerQuickStatsProps, 'applications'>) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Applications */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Total Applications
          </CardTitle>
          <Briefcase className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {stats.total}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            {stats.pending} pending review
          </p>
        </CardContent>
      </Card>

      {/* Active Applications */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Active Applications
          </CardTitle>
          <Clock className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {stats.pending + stats.accepted}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            {stats.accepted} accepted
          </p>
        </CardContent>
      </Card>

      {/* Completed Jobs */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Completed Jobs
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {stats.completed}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            This month
          </p>
        </CardContent>
      </Card>

      {/* Total Earnings */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Total Earnings
          </CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {stats.totalEarnings.toLocaleString()} BAM
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            All time
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

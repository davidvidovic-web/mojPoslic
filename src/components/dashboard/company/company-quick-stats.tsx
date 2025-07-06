'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Eye, TrendingUp } from "lucide-react"

interface CompanyStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  totalViews: number
  featuredJobs: number
  monthlyApplications: number
}

interface CompanyQuickStatsProps {
  stats: CompanyStats | null
}

export function CompanyQuickStats({ stats }: CompanyQuickStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2">
              <div className="h-4 bg-purple-100 dark:bg-purple-900/40 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-purple-100 dark:bg-purple-900/40 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-purple-100 dark:bg-purple-900/40 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Jobs */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Total Jobs Posted
          </CardTitle>
          <Briefcase className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.totalJobs}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            {stats.activeJobs} currently active
          </p>
        </CardContent>
      </Card>

      {/* Total Applications */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Applications Received
          </CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.totalApplications}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            {stats.monthlyApplications} this month
          </p>
        </CardContent>
      </Card>

      {/* Job Views */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Total Views
          </CardTitle>
          <Eye className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.totalViews.toLocaleString()}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Across all listings
          </p>
        </CardContent>
      </Card>

      {/* Featured Jobs */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Featured Listings
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.featuredJobs}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Premium placements
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

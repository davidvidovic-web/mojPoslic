'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, TrendingUp, Eye, UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('dashboard.stats')
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalJobs')}</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.activeJobs || 0} {t('active')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('applications')}</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{stats?.monthlyApplications || 0} {t('thisMonthShort')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalViews')}</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
          <p className="text-xs text-muted-foreground">{t('jobListingViews')}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('featuredJobs')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.featuredJobs || 0}</div>
          <p className="text-xs text-muted-foreground">{t('premiumListings')}</p>
        </CardContent>
      </Card>
    </div>
  )
}

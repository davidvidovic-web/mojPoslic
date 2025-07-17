'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ApplicationsTab() {
  const t = useTranslations('dashboard.company.applications')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('comingSoon')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsTab() {
  const t = useTranslations('dashboard.company.analytics')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('comingSoon')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

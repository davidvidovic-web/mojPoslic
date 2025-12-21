'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp, Info } from 'lucide-react'
import { getJobApplicationCost, getJobPostingCost } from '@/lib/connections/index'
import { useTranslations } from 'next-intl'

interface ConnectionCostsProps {
  userRole?: string
}

export function ConnectionCosts({ userRole = 'tasker' }: ConnectionCostsProps) {
  const t = useTranslations('dashboard.connections')
  
  const renderTaskerCosts = () => (
    <>
      {/* Info message for taskers */}
      <div className="p-3 rounded-[var(--radius)] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {t('taskerInfo')}
        </p>
      </div>
      
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between items-center">
          <span>{t('jobApplicationProfessional')}</span>
          <Badge variant="secondary">{getJobApplicationCost()} {t('connections')}</Badge>
        </div>
      </div>
    </>
  )

  const renderClientCosts = () => (
    <>
      {/* Info message for clients */}
      <div className="p-3 rounded-[var(--radius)] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {t('clientInfo')}
        </p>
      </div>
      
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between items-center">
          <span>{t('quickJobPosting')}</span>
          <Badge variant="secondary">3 {t('connections')}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('featureJob')}</span>
          <Badge variant="secondary">5 {t('connections')}</Badge>
        </div>
      </div>
    </>
  )

  const renderCompanyCosts = () => (
    <>
      {/* Info message for companies */}
      <div className="p-3 rounded-[var(--radius)] bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <p className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {t('companyInfo')}
        </p>
      </div>
      
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between items-center">
          <span>{t('partTimeJobPosting')}</span>
          <Badge variant="secondary">{getJobPostingCost('part-time')} {t('connections')}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('fullTimeJobPosting')}</span>
          <Badge variant="secondary">{getJobPostingCost('full-time')} {t('connections')}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('remoteJobPosting')}</span>
          <Badge variant="secondary">{getJobPostingCost('remote')} {t('connections')}</Badge>
        </div>
      </div>
    </>
  )
  const renderContent = () => {
    switch (userRole) {
      case 'client':
        return renderClientCosts()
      case 'company':
        return renderCompanyCosts()
      case 'tasker':
      default:
        return renderTaskerCosts()
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        {t('connectionCosts')}
      </h4>
      
      {renderContent()}
    </div>
  )
}

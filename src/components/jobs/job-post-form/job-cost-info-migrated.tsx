'use client'

import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { Info, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useJobTodayCount } from '@/hooks/use-misc-apis'
import { useConnectionBalance } from '@/hooks/use-connections'

interface JobCostInfoProps {
  jobType?: 'quick_job' | 'full_time' | 'part_time' | 'remote'
  isCompany?: boolean
}

export function JobCostInfoMigrated({ jobType = 'quick_job', isCompany = false }: JobCostInfoProps) {
  const t = useTranslations('jobs.posting')
  const { user } = useSupabaseAuth()
  
  // Use Supabase hooks instead of manual fetch() calls
  const { data: todayCount, isLoading: loadingTodayCount, isError: todayCountError } = useJobTodayCount(user?.id)
  const { data: balanceData, isLoading: isLoadingBalance, isError: balanceError } = useConnectionBalance()
  
  const loading = loadingTodayCount || isLoadingBalance
  const isError = todayCountError || balanceError
  const connections = balanceData?.connections

  const getCostInfo = () => {
    const baseConnectionCost = jobType === 'quick_job' ? 1 : 2
    const companyMultiplier = isCompany ? 1.5 : 1
    const finalCost = Math.ceil(baseConnectionCost * companyMultiplier)

    const isFirstJobFree = (todayCount?.count || 0) === 0
    const actualCost = isFirstJobFree ? 0 : finalCost

    return {
      baseCost: finalCost,
      actualCost,
      isFirstJobFree,
      hasPostedToday: todayCount?.hasPostedToday || false,
      todayJobCount: todayCount?.count || 0
    }
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('costInfo.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            {t('costInfo.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            {t('costInfo.errorLoading')}
          </p>
          <div className="mt-3 p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">
              {t('costInfo.defaultCost', { cost: jobType === 'quick_job' ? 1 : 2 })}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const costInfo = getCostInfo()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          {t('costInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">{t('costInfo.connectionCost')}</span>
          <div className="flex items-center gap-2">
            {costInfo.isFirstJobFree && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t('costInfo.free')}
              </Badge>
            )}
            <span className={`text-lg font-bold ${costInfo.actualCost === 0 ? 'text-green-600' : 'text-blue-600'}`}>
              {costInfo.actualCost} {t('costInfo.connections')}
            </span>
            {costInfo.actualCost !== costInfo.baseCost && (
              <span className="text-sm text-gray-500 line-through">
                {costInfo.baseCost} {t('costInfo.connections')}
              </span>
            )}
          </div>
        </div>

        {/* Today's Job Count */}
        {costInfo.todayJobCount > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('costInfo.todayJobCount', { count: costInfo.todayJobCount })}
            </p>
          </div>
        )}

        {/* First Job Free Notice */}
        {costInfo.isFirstJobFree && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              {t('costInfo.firstJobFree')}
            </p>
          </div>
        )}

        {/* Job Type Info */}
        <div className="text-sm text-gray-600">
          <p>
            {t('costInfo.jobTypeInfo', {
              type: t(`jobTypes.${jobType}`),
              cost: costInfo.baseCost
            })}
          </p>
          {isCompany && (
            <p className="mt-1">
              {t('costInfo.companyMultiplier')}
            </p>
          )}
        </div>

        {/* Connection Balance Info */}
        {connections !== undefined && (
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('costInfo.currentBalance')}</span>
              <span className="font-bold text-blue-600">
                {connections} {t('costInfo.connections')}
              </span>
            </div>
            {connections < costInfo.actualCost && (
              <p className="text-sm text-red-600 mt-2">
                {t('costInfo.insufficientBalance')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

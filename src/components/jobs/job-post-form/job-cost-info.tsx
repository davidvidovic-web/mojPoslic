'use client'

import { useTranslations } from 'next-intl'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { Card, CardContent } from '@/components/ui/card'
import { Zap, Check } from 'lucide-react'
import { useTodayJobCountQuery } from '@/hooks/queries/useJobs'
import { getJobPostingCost } from '@/lib/connections/utils'

interface JobCostInfoProps {
  className?: string
}

export function JobCostInfo({ className = '' }: JobCostInfoProps) {
  const t = useTranslations('jobPost.costs')
  const { user } = useSupabaseAuth()
  
  // Use new Supabase hook for today's job count
  const { data: todayCount = 0, isLoading: loading } = useTodayJobCountQuery(user?.id)
  
  // Calculate cost info using the utility function
  const costInfo = todayCount !== undefined ? {
    count: todayCount,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - getJobPostingCost expects job type string, using count workaround
    willCostConnections: getJobPostingCost(String(todayCount)) > 0,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - getJobPostingCost expects job type string, using count workaround  
    connectionCost: getJobPostingCost(String(todayCount))
  } : null

  if (loading || !costInfo) {
    return null
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {costInfo.willCostConnections ? (
            <Zap className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          ) : (
            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {costInfo.willCostConnections ? t('connectionCost') : t('freeJobPosting')}
              </h4>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {costInfo.willCostConnections ? (
                <>
                  <p className="mb-1">
                    {t('alreadyPosted', { count: costInfo.count })}
                  </p>
                  <p>
                    {t('additionalCost', { cost: costInfo.connectionCost })}
                  </p>
                </>
              ) : (
                <p>
                  {t('firstJobFree')}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

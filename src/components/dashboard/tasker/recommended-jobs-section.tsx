'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobCard } from '@/components/jobs/job-card'
import { Target } from 'lucide-react'
import { Job } from '@/types/job'
import { useTranslations } from 'next-intl'

interface RecommendedJobsSectionProps {
  recommendedJobs: Job[]
  savedJobIds?: Set<string>
  onSaveToggle?: (jobId: string, isSaved: boolean) => void
}

export function RecommendedJobsSection({ recommendedJobs, savedJobIds, onSaveToggle }: RecommendedJobsSectionProps) {
  const t = useTranslations('dashboard.tasker.recommendations')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('noRecommendationsYet')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('completeProfileForRecommendations')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {recommendedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSaved={savedJobIds?.has(job.id) || false}
                onSaveToggle={onSaveToggle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

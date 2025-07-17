'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bookmark } from 'lucide-react'
import { Job } from '@/types/job'
import { JobCard } from '@/components/jobs/job-card'
import { useTranslations } from 'next-intl'

interface SavedJobsSectionProps {
  savedJobs: Job[]
  onSaveToggle?: (jobId: string, isSaved: boolean) => void
}

export function SavedJobsSection({ savedJobs, onSaveToggle }: SavedJobsSectionProps) {
  const t = useTranslations('dashboard.tasker')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          {t('savedJobs.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {savedJobs.length === 0 ? (
          <div className="text-center py-8">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{t('savedJobs.noSavedJobs')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('savedJobs.saveJobsToSeeHere')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {savedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSaved={true}
                onSaveToggle={onSaveToggle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
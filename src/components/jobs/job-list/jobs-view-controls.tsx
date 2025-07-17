'use client'

import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

interface JobsViewControlsProps {
  filteredJobsCount: number
  startIndex: number
  endIndex: number
  jobsPerPage: number
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function JobsViewControls({
  filteredJobsCount,
  startIndex,
  endIndex,
  jobsPerPage,
  hasActiveFilters,
  onClearFilters
}: JobsViewControlsProps) {
  const t = useTranslations('common')
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filteredJobsCount}</span> job{filteredJobsCount !== 1 ? 's' : ''} found
        {filteredJobsCount > jobsPerPage && (
          <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredJobsCount)} of {filteredJobsCount}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearFilters}
            className="border-border/50"
          >
            {t('actions.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  )
}

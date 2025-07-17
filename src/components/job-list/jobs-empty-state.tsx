'use client'

import { Button } from "@/components/ui/button"
import { useFilterStore } from "@/stores/filter-store"
import { useTranslations } from 'next-intl'

interface JobsEmptyStateProps {
  message?: string
  subMessage?: string
  showClearFilters?: boolean
}

export function JobsEmptyState({
  message,
  subMessage,
  showClearFilters = true
}: JobsEmptyStateProps) {
  const t = useTranslations('common.emptyStates')
  const { clearJobFilters } = useFilterStore()

  return (
    <div className="text-center py-12 bg-muted/30 rounded-xl border border-border/40">
      <div className="text-muted-foreground">
        <p className="text-lg font-medium">{message || t('noJobsFound')}</p>
        <p className="mt-1">{subMessage || t('tryAdjustingFilters')}</p>
      </div>
      {showClearFilters && (
        <Button 
          variant="outline" 
          onClick={clearJobFilters}
          className="mt-4"
        >
          {t('clearAllFilters')}
        </Button>
      )}
    </div>
  )
}

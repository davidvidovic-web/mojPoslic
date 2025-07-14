'use client'

import { Button } from "@/components/ui/button"
import { Briefcase, Plus } from "lucide-react"
import Link from "next/link"
import { useTranslations } from 'next-intl'

interface JobsEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function JobsEmptyState({ hasActiveFilters, onClearFilters }: JobsEmptyStateProps) {
  const t = useTranslations('jobs.list')
  
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">{t('noJobs')}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {hasActiveFilters
            ? t('noJobsWithFiltersMessage')
            : t('noJobsMessage')}
        </p>
        
        <div className="flex justify-center">
          {hasActiveFilters ? (
            <Button 
              className="bg-foreground hover:bg-foreground/90 text-background font-bold border-0 transition-all duration-200"
              onClick={onClearFilters}
            >
              {t('clearAllFilters')}
            </Button>
          ) : (
            <Link href="/auth/register">
              <Button 
                className="bg-foreground hover:bg-foreground/90 text-background font-bold border-0 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('beTheFirst')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

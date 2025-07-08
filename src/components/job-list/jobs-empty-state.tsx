'use client'

import { Button } from "@/components/ui/button"
import { useFilterStore } from "@/stores/filter-store"

interface JobsEmptyStateProps {
  message?: string
  subMessage?: string
  showClearFilters?: boolean
}

export function JobsEmptyState({
  message = "No jobs found",
  subMessage = "Try adjusting your filters or search criteria",
  showClearFilters = true
}: JobsEmptyStateProps) {
  const { clearJobFilters } = useFilterStore()

  return (
    <div className="text-center py-12 bg-muted/30 rounded-xl border border-border/40">
      <div className="text-muted-foreground">
        <p className="text-lg font-medium">{message}</p>
        <p className="mt-1">{subMessage}</p>
      </div>
      {showClearFilters && (
        <Button 
          variant="outline" 
          onClick={clearJobFilters}
          className="mt-4"
        >
          Clear all filters
        </Button>
      )}
    </div>
  )
}

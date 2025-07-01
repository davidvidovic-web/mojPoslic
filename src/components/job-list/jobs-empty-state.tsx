'use client'

import { Button } from "@/components/ui/button"
import { Briefcase } from "lucide-react"

interface JobsEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function JobsEmptyState({ hasActiveFilters, onClearFilters }: JobsEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No jobs found</h3>
        <p className="text-muted-foreground leading-relaxed">
          {hasActiveFilters
            ? "We couldn't find any jobs matching your criteria. Try adjusting your search filters or check back later for new opportunities." 
            : "No jobs have been posted yet. Be the first to post a job opportunity!"}
        </p>
        {hasActiveFilters && (
          <Button 
            variant="outline"
            onClick={onClearFilters}
            className="border-border/50"
          >
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  )
}

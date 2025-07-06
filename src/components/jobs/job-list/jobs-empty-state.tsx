'use client'

import { Button } from "@/components/ui/button"
import { Briefcase, Plus } from "lucide-react"
import Link from "next/link"

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
            : "No jobs have been posted yet. Someone needs to break the ice!"}
        </p>
        
        <div className="flex justify-center">
          {hasActiveFilters ? (
            <Button 
              className="bg-brand-green hover:bg-brand-green/90 text-white font-bold border-0 transition-all duration-200"
              onClick={onClearFilters}
            >
              Clear all filters
            </Button>
          ) : (
            <Link href="/auth/register">
              <Button 
                className="bg-brand-green hover:bg-brand-green/90 text-white font-bold border-0 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Be the first
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Button } from "@/components/ui/button"
import { List, LayoutGrid } from "lucide-react"

type ViewMode = 'grid' | 'list'

interface JobsViewControlsProps {
  filteredJobsCount: number
  startIndex: number
  endIndex: number
  jobsPerPage: number
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function JobsViewControls({
  filteredJobsCount,
  startIndex,
  endIndex,
  jobsPerPage,
  viewMode,
  setViewMode,
  hasActiveFilters,
  onClearFilters
}: JobsViewControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filteredJobsCount}</span> job{filteredJobsCount !== 1 ? 's' : ''} found
        {filteredJobsCount > jobsPerPage && (
          <span> • Showing {startIndex + 1}-{Math.min(endIndex, filteredJobsCount)} of {filteredJobsCount}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <div className="flex items-center border border-border/40 rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearFilters}
            className="border-border/50"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { Button } from "@/components/ui/button"
import { Grid2X2, List, RefreshCcw, XCircle } from "lucide-react"
import { useFilterStore } from "@/stores/filter-store"
import { useQueryClient } from "@tanstack/react-query"
import { jobKeys } from "@/hooks/use-jobs"

interface JobsViewControlsProps {
  onRefresh?: () => void;
}

export function JobsViewControls({ onRefresh }: JobsViewControlsProps) {
  const queryClient = useQueryClient()
  const {
    viewMode,
    setViewMode,
    clearJobFilters,
    hasActiveJobFilters,
    getJobFiltersCount
  } = useFilterStore()

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      // Default refresh behavior using TanStack Query
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    }
  }

  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      {/* Active Filters Display */}
      <div className="flex items-center gap-2">
        {hasActiveJobFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearJobFilters}
            className="h-8"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Clear Filters ({getJobFiltersCount()})
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="h-8"
        >
          <RefreshCcw className="h-3.5 w-3.5 mr-1" />
          Refresh
        </Button>
      </div>
      
      {/* View Mode Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('grid')}
          className="h-8 px-2"
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { isTimeForMonthlyRefresh } from '@/lib/connections/index'

interface ConnectionRefreshButtonProps {
  onRefresh: () => Promise<void>
  refreshing: boolean
  lastRefresh: Date | null
}

export function ConnectionRefreshButton({ 
  onRefresh, 
  refreshing, 
  lastRefresh 
}: ConnectionRefreshButtonProps) {
  return (
    <div className="flex justify-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={refreshing || !isTimeForMonthlyRefresh(lastRefresh)}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Monthly Refresh'}
      </Button>
    </div>
  )
}

'use client'

import { Calendar } from 'lucide-react'

interface MonthlyRefreshInfoProps {
  lastRefresh: Date | null
}

export function MonthlyRefreshInfo({ lastRefresh }: MonthlyRefreshInfoProps) {
  const getNextRefreshDate = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Monthly Refresh
      </h4>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>You receive 10 connections automatically on the 1st of each month.</p>
        <p className="font-medium">Next refresh: {getNextRefreshDate()}</p>
        {lastRefresh && (
          <p>Last refresh: {lastRefresh.toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}

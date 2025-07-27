'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, ChevronDown, ChevronUp } from 'lucide-react'

interface ConnectionHistoryEntry {
  id: string
  action: string
  connectionsBefore: number
  connectionsAfter: number
  amountChanged: number
  reason?: string
  createdAt: string
  adminId?: string
  jobId?: string
}

interface ConnectionActivityProps {
  history: ConnectionHistoryEntry[]
}

export function ConnectionActivity({ history }: ConnectionActivityProps) {
  const t = useTranslations('dashboard.connections')
  const [showFullHistory, setShowFullHistory] = useState(false)
  
  const recentHistory = showFullHistory ? history : history.slice(0, 5)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <History className="h-4 w-4" />
          {t('activity.title')}
        </h4>
        {history.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullHistory(!showFullHistory)}
          >
            {showFullHistory ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {t('activity.showLess')}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {t('activity.showAll', { count: history.length })}
              </>
            )}
          </Button>
        )}
      </div>
      
      {recentHistory.length > 0 ? (
        <ScrollArea className={showFullHistory ? "h-48" : "h-32"}>
          <div className="space-y-2">
            {recentHistory.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-[var(--radius)] bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{entry.action}</p>
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground">{entry.reason}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    entry.amountChanged > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {entry.amountChanged > 0 ? '+' : ''}{entry.amountChanged}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">No recent activity</p>
      )}
    </div>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'

interface ConnectionHistoryEntry {
  id: string
  action: string
  actionLabel: string
  amount: number
  description: string | null
  jobId: string | null
  createdAt: string
  isPositive: boolean
  isNegative: boolean
}

interface ConnectionHistorySimpleProps {
  history: ConnectionHistoryEntry[]
}

export function ConnectionHistorySimple({ history }: ConnectionHistorySimpleProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet</p>
  }

  return (
    <div className="space-y-2">
      {history.slice(0, 10).map((entry) => (
        <div key={entry.id} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
          <div className="flex-1">
            <div className="font-medium">{entry.actionLabel}</div>
            {entry.description && (
              <div className="text-muted-foreground">{entry.description}</div>
            )}
            <div className="text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Badge variant={entry.isPositive ? 'default' : 'destructive'} className="text-xs">
            {entry.isPositive ? '+' : ''}{entry.amount}
          </Badge>
        </div>
      ))}
    </div>
  )
}

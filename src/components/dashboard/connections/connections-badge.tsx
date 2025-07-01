'use client'

import { Badge } from '@/components/ui/badge'

interface ConnectionsBadgeProps {
  connections: number
  className?: string
}

export function ConnectionsBadge({ connections, className }: ConnectionsBadgeProps) {
  const getConnectionColor = (count: number) => {
    if (count >= 10) return 'default'
    if (count >= 5) return 'secondary'
    return 'destructive'
  }

  return (
    <Badge variant={getConnectionColor(connections)} className={`flex items-center gap-1 ${className}`}>
      {connections}
    </Badge>
  )
}

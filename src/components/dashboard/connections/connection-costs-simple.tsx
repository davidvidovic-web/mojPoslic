'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { getConnectionCost } from '@/lib/connections/index'

export function ConnectionCostsSimple() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Connection Costs
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Apply for a job:</span>
          <Badge variant="outline">{getConnectionCost('JOB_APPLICATION')}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Post job (Client):</span>
          <Badge variant="outline">{getConnectionCost('JOB_POST_CLIENT')}</Badge>
        </div>
        <div className="flex justify-between">
          <span>Post job (Company):</span>
          <Badge variant="outline">{getConnectionCost('JOB_POST_COMPANY')}</Badge>
        </div>
      </div>
    </div>
  )
}

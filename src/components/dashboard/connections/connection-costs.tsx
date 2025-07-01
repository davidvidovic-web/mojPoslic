'use client'

import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { getJobApplicationCost, getJobPostingCost } from '@/lib/connections/index'

export function ConnectionCosts() {
  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Connection Costs
      </h4>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Job Application</span>
          <Badge variant="secondary">{getJobApplicationCost()} connections</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Quick Job Posting</span>
          <Badge variant="secondary">{getJobPostingCost('quick-job')} connections</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Part-time Job Posting</span>
          <Badge variant="secondary">{getJobPostingCost('part-time')} connections</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Full-time Job Posting</span>
          <Badge variant="secondary">{getJobPostingCost('full-time')} connections</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span>Remote Job Posting</span>
          <Badge variant="secondary">{getJobPostingCost('remote')} connections</Badge>
        </div>
      </div>
    </div>
  )
}

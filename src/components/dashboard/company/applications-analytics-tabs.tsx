'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, TrendingUp } from 'lucide-react'

export function ApplicationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Application Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Application management coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Analytics & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Analytics dashboard coming soon...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

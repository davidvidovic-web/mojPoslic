'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Users, MessageSquare, BarChart3, Settings } from 'lucide-react'

interface ClientQuickActionsProps {
  onPostNewJob: () => void
}

export function ClientQuickActions({ onPostNewJob }: ClientQuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onPostNewJob} className="w-full justify-start" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Post a New Job
        </Button>
        
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Search className="h-4 w-4 mr-2" />
          Browse Available Taskers
        </Button>
        
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Users className="h-4 w-4 mr-2" />
          Manage Applications
        </Button>
        
        <Button variant="outline" className="w-full justify-start" size="lg">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message Center
        </Button>
        
        <div className="pt-3 border-t">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

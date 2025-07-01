'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Zap, Info, TrendingUp, RefreshCw, History } from 'lucide-react'
import { isTimeForMonthlyRefresh, getConnectionCost } from '@/lib/connections/index'
import { useAuth } from '@/contexts/prisma-auth-context'
import { PurchaseConnections } from '@/components/purchase-connections'
import { ConnectionsBadge } from '@/components/dashboard/connections/connections-badge'
import { ConnectionRefreshButton } from '@/components/dashboard/connections/connection-refresh-button'
import { ConnectionCostsSimple } from '@/components/dashboard/connections/connection-costs-simple'
import { ConnectionHistorySimple } from '@/components/dashboard/connections/connection-history-simple'

interface ConnectionsDisplayProps {
  className?: string
  showDetails?: boolean
}

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

export function ConnectionsDisplay({ className, showDetails = false }: ConnectionsDisplayProps) {
  const { user } = useAuth()
  const [connections, setConnections] = useState<number>(0)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [history, setHistory] = useState<ConnectionHistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/user/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || 0)
        setLastRefresh(data.lastRefresh ? new Date(data.lastRefresh) : null)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/user/connections/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error fetching connection history:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/user/connections/refresh', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        setConnections(data.newBalance)
        setLastRefresh(new Date())
        // Refresh history to show the new entry
        await fetchHistory()
      } else {
        console.error('Refresh failed:', data.error)
      }
    } catch (error) {
      console.error('Error refreshing connections:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchConnections()
      fetchHistory()
    }
  }, [user])

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse">
          <Badge variant="outline" className="h-6 w-16 bg-muted"></Badge>
        </div>
      </div>
    )
  }

  // The compact display used in the header
  const CompactDisplay = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <ConnectionsBadge connections={connections} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <ConnectionsInfoCard />
        </PopoverContent>
      </Popover>
    </div>
  )

  // The full card display used in the popover and when showDetails is true
  const ConnectionsInfoCard = () => (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Connections
        </CardTitle>
        <CardDescription>
          Use connections to apply for jobs and post opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Balance:</span>
          <ConnectionsBadge connections={connections} className="text-lg px-3 py-1" />
        </div>

        <ConnectionRefreshButton 
          onRefresh={handleRefresh}
          refreshing={refreshing}
          lastRefresh={lastRefresh}
        />
        
        <Separator />
        
        <ConnectionCostsSimple />
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">How to earn connections:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Get 10 connections on signup</li>
            <li>• Receive 10 connections monthly (1st of each month)</li>
          </ul>
        </div>

        {/* History Toggle */}
        <div className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Hide' : 'Show'} Connection History
          </Button>
        </div>

        {/* History Display */}
        {showHistory && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium">Recent Activity:</h4>
            <ConnectionHistorySimple history={history} />
          </div>
        )}

        {/* Purchase Connects Button */}
        <Separator />
        <div className="text-center space-y-2">
          <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default"
                size="sm"
                className="w-full"
              >
                Purchase Connects
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Purchase Connections</DialogTitle>
              </DialogHeader>
              <PurchaseConnections onClose={() => setPurchaseDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <p className="text-xs text-muted-foreground">
            Need more connections for applications and job posts?
          </p>
        </div>
      </CardContent>
    </Card>
  )

  if (showDetails) {
    return <ConnectionsInfoCard />
  }

  return <CompactDisplay />
}

export function ConnectionsWarning({ 
  requiredConnections, 
  userConnections, 
  action 
}: { 
  requiredConnections: number
  userConnections: number
  action: string 
}) {
  if (userConnections >= requiredConnections) return null

  return (
    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
      <Info className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-destructive">Insufficient Connections</p>
        <p className="text-muted-foreground">
          You need {requiredConnections} connections to {action}, but you only have {userConnections}.
        </p>
      </div>
    </div>
  )
}

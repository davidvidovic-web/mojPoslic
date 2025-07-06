'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, Check } from 'lucide-react'

interface JobCostInfoProps {
  className?: string
}

export function JobCostInfo({ className = '' }: JobCostInfoProps) {
  const { user } = useAuth()
  const [costInfo, setCostInfo] = useState<{
    count: number
    willCostConnections: boolean
    connectionCost: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCostInfo = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/jobs/today-count')
        if (response.ok) {
          const data = await response.json()
          setCostInfo(data)
        }
      } catch (error) {
        console.error('Error fetching job cost info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCostInfo()
  }, [user])

  // Listen for refresh events to update cost info after job posting
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Received refresh-job-cost event')
      if (user) {
        const fetchCostInfo = async () => {
          try {
            const response = await fetch('/api/jobs/today-count')
            if (response.ok) {
              const data = await response.json()
              setCostInfo(data)
            }
          } catch (error) {
            console.error('Error fetching job cost info:', error)
          }
        }
        fetchCostInfo()
      }
    }

    window.addEventListener('refresh-job-cost', handleRefresh)
    
    return () => {
      window.removeEventListener('refresh-job-cost', handleRefresh)
    }
  }, [user])

  if (loading || !costInfo) {
    return null
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {costInfo.willCostConnections ? (
            <Zap className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
          ) : (
            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                {costInfo.willCostConnections ? 'Connection Cost' : 'Free Job Posting'}
              </h4>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {costInfo.willCostConnections ? (
                <>
                  <p className="mb-1">
                    You&apos;ve already posted <strong>{costInfo.count} job{costInfo.count > 1 ? 's' : ''}</strong> today.
                  </p>
                  <p>
                    Additional jobs cost <strong>{costInfo.connectionCost} connections</strong> each.
                  </p>
                </>
              ) : (
                <p>
                  This is your <strong>first job today</strong> - it&apos;s completely free! 
                  Additional jobs will cost <strong>3 connections</strong> each.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

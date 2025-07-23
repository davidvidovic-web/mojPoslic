'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Flag, ThumbsUp, CheckCircle, Star } from 'lucide-react'
import { toast } from 'sonner'

interface JobCompletionCardProps {
  jobAssignment: {
    id: string
    contractStatus: string
    job: {
      id: string
      title: string
      company?: string
      postedBy: {
        id: string
        name: string
        email: string
      }
    }
    selectedApplication: {
      user: {
        id: string
        name: string
        email: string
      }
    }
  }
  userRole: 'tasker' | 'client' | 'admin'
  onUpdate?: () => void
}

export function JobCompletionCard({ jobAssignment, userRole, onUpdate }: JobCompletionCardProps) {
  const [completionNotes, setCompletionNotes] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMarkComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/job-assignments/${jobAssignment.id}/complete-work`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completionNotes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark work as completed')
      }

      toast.success('Work marked as completed! Waiting for client confirmation.')
      setCompletionNotes('')
      onUpdate?.()
    } catch (error) {
      console.error('Error marking work as completed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mark work as completed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/job-assignments/${jobAssignment.id}/confirm-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientNotes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm work completion')
      }

      toast.success('Work completion confirmed! The job is now completed and you can rate each other.')
      setClientNotes('')
      onUpdate?.()
    } catch (error) {
      console.error('Error confirming work completion:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to confirm work completion')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Acceptance</Badge>
      case 'ACCEPTED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Work in Progress</Badge>
      case 'WORK_COMPLETED':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Work Completed (Awaiting Confirmation)</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Job Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{jobAssignment.job.title}</CardTitle>
          {getStatusBadge(jobAssignment.contractStatus)}
        </div>
        <p className="text-sm text-gray-600">
          {jobAssignment.job.company && `${jobAssignment.job.company} • `}
          Client: {jobAssignment.job.postedBy.name}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tasker Actions */}
        {userRole === 'tasker' && jobAssignment.contractStatus === 'ACCEPTED' && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Mark Work as Completed</h4>
            <Textarea
              placeholder="Add any notes about the completed work (optional)..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleMarkComplete}
              disabled={loading}
              className="w-full"
            >
              <Flag className="h-4 w-4 mr-2" />
              {loading ? 'Marking Complete...' : 'Mark Work as Completed'}
            </Button>
          </div>
        )}

        {/* Client Actions */}
        {userRole === 'client' && jobAssignment.contractStatus === 'WORK_COMPLETED' && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Confirm Work Completion</h4>
            <p className="text-sm text-gray-600">
              {jobAssignment.selectedApplication.user.name} has marked the work as completed. 
              Please review and confirm if you&apos;re satisfied with the work.
            </p>
            <Textarea
              placeholder="Add feedback about the completed work (optional)..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleConfirmComplete}
              disabled={loading}
              className="w-full"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {loading ? 'Confirming...' : 'Confirm Work is Completed'}
            </Button>
          </div>
        )}

        {/* Completed Status */}
        {jobAssignment.contractStatus === 'COMPLETED' && (
          <div className="space-y-3">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Job Completed Successfully!</span>
            </div>
            <p className="text-sm text-gray-600">
              Both parties have confirmed the work is complete. You can now rate each other.
            </p>
            <Button variant="outline" className="w-full">
              <Star className="h-4 w-4 mr-2" />
              Rate & Review
            </Button>
          </div>
        )}

        {/* Waiting Status */}
        {jobAssignment.contractStatus === 'WORK_COMPLETED' && userRole === 'tasker' && (
          <div className="space-y-3">
            <div className="flex items-center text-orange-600">
              <Flag className="h-5 w-5 mr-2" />
              <span className="font-medium">Work Marked as Completed</span>
            </div>
            <p className="text-sm text-gray-600">
              Waiting for the client to confirm completion. You&apos;ll be notified once they review your work.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  useShortlist, 
  useRemoveFromShortlist, 
  useAssignJob 
} from '@/hooks/use-applications'
import { 
  Star, 
  MessageSquare, 
  Award, 
  X,
  CheckCircle2,
  MapPin,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ShortlistManagerProps {
  jobId: string
  jobTitle: string
}

export function ShortlistManager({ jobId, jobTitle }: ShortlistManagerProps) {
  const t = useTranslations('admin.applications')
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [selectedForAssignment, setSelectedForAssignment] = useState<string | null>(null)

  const { data: shortlistedApplications = [], isLoading } = useShortlist(jobId)
  const removeFromShortlistMutation = useRemoveFromShortlist()
  const assignJobMutation = useAssignJob()

  const handleRemoveFromShortlist = async (applicationId: string) => {
    try {
      await removeFromShortlistMutation.mutateAsync({
        jobId,
        applicationId
      })
    } catch (error) {
      console.error('Remove from shortlist error:', error)
    }
  }

  const handleAssignJob = async (applicationId: string) => {
    try {
      await assignJobMutation.mutateAsync({
        jobId,
        selectedApplicationId: applicationId,
        notes: assignmentNotes || undefined
      })
      
      setSelectedForAssignment(null)
      setAssignmentNotes('')
    } catch (error) {
      console.error('Job assignment error:', error)
    }
  }

  const toggleComparison = (applicationId: string) => {
    if (selectedForComparison.includes(applicationId)) {
      setSelectedForComparison(prev => prev.filter(id => id !== applicationId))
    } else {
      setSelectedForComparison(prev => [...prev, applicationId])
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (shortlistedApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('shortlist.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">
              {t('shortlist.empty.title')}
            </p>
            <p className="text-gray-500">
              {t('shortlist.empty.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              {t('shortlist.titleWithJob', { jobTitle })}
            </CardTitle>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {t('shortlist.candidateCount', { count: shortlistedApplications.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {selectedForComparison.length > 0 && (
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-purple-800">
                    {t('comparison.selectedCount', { count: selectedForComparison.length })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedForComparison([])}
                    >
                      {t('comparison.clearSelection')}
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      {t('comparison.compareCandidates')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlistedApplications.map((application) => (
              <Card 
                key={application.id} 
                className={`relative transition-all duration-200 ${
                  selectedForComparison.includes(application.id)
                    ? 'ring-2 ring-purple-500 shadow-lg'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {application.user?.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {application.user?.email}
                      </p>
                      {application.user?.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {application.user.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromShortlist(application.id)}
                      disabled={removeFromShortlistMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      {t('status.shortlisted')}
                    </Badge>
                    {application.user?.averageRating && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">
                          {application.user.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t('reviews.count', { count: application.user.totalReviews || 0 })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {application.user?.bio && (
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {application.user.bio}
                      </p>
                    </div>
                  )}

                  {application.user?.skills && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {t('labels.skills')}:
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {application.user.skills}
                      </p>
                    </div>
                  )}

                  {application.message && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {t('labels.coverLetter')}:
                      </p>
                      <div className="p-2 bg-gray-50 rounded text-sm line-clamp-3">
                        {application.message}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {t('shortlist.shortlistedAgo', { time: formatDistanceToNow(new Date(application.shortlistedAt!)) })}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleComparison(application.id)}
                        className={selectedForComparison.includes(application.id) 
                          ? 'bg-purple-100 border-purple-300 text-purple-700' 
                          : ''
                        }
                      >
                        {selectedForComparison.includes(application.id) ? t('actions.remove') : t('actions.compare')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {t('actions.message')}
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setSelectedForAssignment(application.id)}
                      disabled={assignJobMutation.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t('actions.selectForJob')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Assignment Confirmation */}
      {selectedForAssignment && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              {t('assignment.confirmTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              {t('assignment.confirmDescription', { 
                candidateName: shortlistedApplications.find(app => app.id === selectedForAssignment)?.user?.name || 'Unknown'
              })}
            </p>
            <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
              <li>{t('assignment.actions.markSelected')}</li>
              <li>{t('assignment.actions.rejectOthers')}</li>
              <li>{t('assignment.actions.closeJob')}</li>
              <li>{t('assignment.actions.sendNotifications')}</li>
            </ul>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-2">
                {t('assignment.notesLabel')}
              </label>
              <Textarea
                placeholder={t('assignment.notesPlaceholder')}
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleAssignJob(selectedForAssignment)}
                disabled={assignJobMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {assignJobMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('assignment.assigning')}
                  </div>
                ) : (
                  t('assignment.confirmButton')
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedForAssignment(null)
                  setAssignmentNotes('')
                }}
                disabled={assignJobMutation.isPending}
              >
                {t('assignment.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

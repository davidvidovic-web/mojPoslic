"use client"

import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, User, FileText, ArrowLeft } from 'lucide-react'
import { JobApplication } from '@/types/application'
import { ApplicationStatusBadge } from '@/components/ui/application-status-badge'
import { useAddToShortlist, useRemoveFromShortlist, useAssignJob } from '@/hooks/use-applications'

interface CandidateComparisonViewProps {
  applications: JobApplication[]
  jobId: string
  onBack: () => void
  onSelect: (applicationId: string) => void
}

interface ComparisonMetric {
  label: string
  getValue: (app: JobApplication) => string | number
  type: 'text' | 'number' | 'date' | 'rating'
}

export function CandidateComparisonView({ 
  applications, 
  jobId, 
  onBack, 
  onSelect 
}: CandidateComparisonViewProps) {
  const t = useTranslations('applications')
  const tCommon = useTranslations('common')
  
  const comparisonMetrics: ComparisonMetric[] = [
    {
      label: t('comparison.metrics.experience'),
      getValue: (app) => app.user?.experience || tCommon('messages.notSpecified'),
      type: 'text'
    },
    {
      label: t('comparison.metrics.location'), 
      getValue: (app) => app.user?.location || tCommon('messages.notSpecified'),
      type: 'text'
    },
    {
      label: t('comparison.metrics.applicationDate'),
      getValue: (app) => new Date(app.createdAt).toLocaleDateString(),
      type: 'date'
    },
    {
      label: t('comparison.metrics.responseTime'),
      getValue: (app) => {
        const diff = Date.now() - new Date(app.createdAt).getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        return `${hours}h ago`
      },
      type: 'text'
    }
  ]
  
  const addToShortlist = useAddToShortlist()
  const removeFromShortlist = useRemoveFromShortlist()
  const assignJob = useAssignJob()

  const handleShortlistToggle = async (applicationId: string, isShortlisted: boolean) => {
    try {
      if (isShortlisted) {
        await removeFromShortlist.mutateAsync({ jobId, applicationId })
      } else {
        await addToShortlist.mutateAsync({ jobId, applicationIds: [applicationId] })
      }
    } catch (error) {
      console.error('Error toggling shortlist:', error)
    }
  }

  const handleAssignJob = async (applicationId: string) => {
    try {
      await assignJob.mutateAsync({ jobId, selectedApplicationId: applicationId })
    } catch (error) {
      console.error('Error assigning job:', error)
    }
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No applications to compare</h3>
        <p className="text-muted-foreground">Select applications to view them side by side.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Candidate Comparison</h2>
            <p className="text-muted-foreground">
              Comparing {applications.length} candidate{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(applications.length, 3)}, 1fr)` }}>
        {applications.slice(0, 3).map((application) => (
          <Card key={application.id} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={application.user?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {application.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{application.user?.name || tCommon('messages.unknown')}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span>{application.user?.location || tCommon('messages.locationNotSpecified')}</span>
                    </CardDescription>
                  </div>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Applied:</span>
                </div>
                <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Rating:</span>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= (application.user?.averageRating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Comparison Metrics */}
              <div className="space-y-3">
                {comparisonMetrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}:</span>
                    <span className="font-medium">{metric.getValue(application)}</span>
                  </div>
                ))}
              </div>

              {/* Cover Letter Preview */}
              {application.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Application Message</p>
                    <ScrollArea className="h-20">
                      <p className="text-sm text-muted-foreground">
                        {application.message.substring(0, 200)}
                        {application.message.length > 200 && '...'}
                      </p>
                    </ScrollArea>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  onClick={() => onSelect(application.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {tCommon('actions.viewDetails')}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleShortlistToggle(application.id, !!application.shortlistedAt)}
                    variant={application.shortlistedAt ? "secondary" : "outline"}
                    size="sm"
                    className="flex-1"
                    disabled={addToShortlist.isPending || removeFromShortlist.isPending}
                  >
                    <Star className={`mr-2 h-4 w-4 ${application.shortlistedAt ? 'fill-current' : ''}`} />
                    {application.shortlistedAt ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={application.status === 'SELECTED'}
                        className="flex-1"
                      >
                        Assign Job
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle>{t('comparison.assignmentDialog.title', { name: application.user?.name || tCommon('messages.unknown') })}</DialogTitle>
                        <DialogDescription>
                          {t('comparison.assignmentDialog.description')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">
                          {tCommon('buttons.cancel')}
                        </Button>
                        <Button 
                          onClick={() => handleAssignJob(application.id)}
                          disabled={assignJob.isPending}
                        >
                          {assignJob.isPending ? tCommon('actions.assigning') : t('comparison.assignmentDialog.confirm')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Candidates */}
      {applications.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Candidates ({applications.length - 3})</CardTitle>
            <CardDescription>
              View more candidates individually or adjust your selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {applications.slice(3).map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={application.user?.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {application.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{application.user?.name || tCommon('messages.unknown')}</p>
                      <p className="text-sm text-muted-foreground">
                        Applied {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ApplicationStatusBadge status={application.status} />
                    <Button
                      onClick={() => onSelect(application.id)}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

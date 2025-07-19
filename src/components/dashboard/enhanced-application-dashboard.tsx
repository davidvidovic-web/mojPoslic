"use client"

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { JobApplication } from '@/types/application'
import { useJobApplications } from '@/hooks/use-applications'

// Import our new advanced components
import { CandidateComparisonView } from './candidate-comparison-view'
import { MessageTemplates } from './message-templates'
import { InterviewScheduling } from './interview-scheduling'
import { AdvancedFilters } from './advanced-filters'
import { ApplicationDetailsModal } from './application-details-modal'

// Import types
interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'application_received' | 'application_reviewed' | 'shortlisted' | 'selected' | 'rejected' | 'interview_invite' | 'follow_up' | 'custom'
  isDefault: boolean
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

interface EnhancedApplicationDashboardProps {
  jobId: string
  jobTitle: string
}

interface DashboardStats {
  total: number
  pending: number
  reviewed: number
  shortlisted: number
  selected: number
  rejected: number
  withdrawn: number
  conversionRate: number
  avgResponseTime: number
}

export function EnhancedApplicationDashboard({ jobId, jobTitle }: EnhancedApplicationDashboardProps) {
  const { data: applications = [], isLoading, error } = useJobApplications(jobId)
  const [activeTab, setActiveTab] = useState('overview')
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([])
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [showComparisonView, setShowComparisonView] = useState(false)

  useEffect(() => {
    setFilteredApplications(applications)
  }, [applications])

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    reviewed: applications.filter(app => app.status === 'REVIEWED').length,
    shortlisted: applications.filter(app => app.status === 'SHORTLISTED').length,
    selected: applications.filter(app => app.status === 'SELECTED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
    withdrawn: applications.filter(app => app.status === 'WITHDRAWN').length,
    conversionRate: applications.length > 0 
      ? (applications.filter(app => app.status === 'SELECTED').length / applications.length) * 100 
      : 0,
    avgResponseTime: applications.length > 0 
      ? applications.reduce((acc, app) => {
          const responseTime = app.reviewedAt 
            ? new Date(app.reviewedAt).getTime() - new Date(app.createdAt).getTime()
            : 0
          return acc + responseTime
        }, 0) / applications.length / (1000 * 60 * 60) // Convert to hours
      : 0
  }

  const handleCompareSelected = () => {
    if (selectedApplications.length > 0) {
      const selectedApps = applications.filter(app => selectedApplications.includes(app.id))
      setFilteredApplications(selectedApps)
      setShowComparisonView(true)
      setActiveTab('comparison')
    }
  }

  const handleApplicationSelect = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
  }

  const handleScheduleInterview = (interview: Record<string, unknown>) => {
    console.log('Schedule interview:', interview)
    // Here you would typically make an API call to schedule the interview
  }

  const handleUpdateInterview = (id: string, updates: Record<string, unknown>) => {
    console.log('Update interview:', id, updates)
    // Here you would typically make an API call to update the interview
  }

  const handleCancelInterview = (id: string) => {
    console.log('Cancel interview:', id)
    // Here you would typically make an API call to cancel the interview
  }

  const handleSelectTemplate = (template: MessageTemplate) => {
    console.log('Selected template:', template)
    // Here you would typically open a message composer with the template
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load applications</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Application Management</h1>
          <p className="text-muted-foreground">{jobTitle}</p>
        </div>
        <div className="flex space-x-2">
          {selectedApplications.length > 0 && (
            <Button onClick={handleCompareSelected} variant="outline">
              Compare Selected ({selectedApplications.length})
            </Button>
          )}
          <Badge variant="secondary">
            {applications.length} Total Applications
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shortlisted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.shortlisted / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <Progress value={stats.conversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}h</div>
            <p className="text-xs text-muted-foreground">
              Time to review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="scheduling">Interviews</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Advanced Filters */}
          <AdvancedFilters
            applications={applications}
            onFilterChange={setFilteredApplications}
            onFiltersReset={() => setFilteredApplications(applications)}
          />

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>
                Manage and review candidate applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-muted-foreground">
                    {applications.length === 0 
                      ? 'No applications have been received yet.'
                      : 'Try adjusting your search or filter criteria.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedApplications.includes(application.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications([...selectedApplications, application.id])
                            } else {
                              setSelectedApplications(selectedApplications.filter(id => id !== application.id))
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium">{application.user?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{application.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplicationSelect(application.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {showComparisonView ? (
            <CandidateComparisonView
              applications={filteredApplications}
              jobId={jobId}
              onBack={() => {
                setShowComparisonView(false)
                setFilteredApplications(applications)
              }}
              onSelect={handleApplicationSelect}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Candidate Comparison</CardTitle>
                <CardDescription>
                  Select candidates from the Overview tab to compare them side by side
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No candidates selected for comparison
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('overview')}
                  className="mt-4"
                >
                  Go to Overview
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <InterviewScheduling
            applications={applications.filter(app => 
              app.status === 'SHORTLISTED' || app.status === 'REVIEWED'
            )}
            jobId={jobId}
            onScheduleInterview={handleScheduleInterview}
            onUpdateInterview={handleUpdateInterview}
            onCancelInterview={handleCancelInterview}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <MessageTemplates
            onSelectTemplate={handleSelectTemplate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Funnel</CardTitle>
                <CardDescription>Track candidate progression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Applied</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <Progress value={100} />
                  
                  <div className="flex justify-between items-center">
                    <span>Reviewed</span>
                    <span className="font-medium">{stats.reviewed}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0} />
                  
                  <div className="flex justify-between items-center">
                    <span>Shortlisted</span>
                    <span className="font-medium">{stats.shortlisted}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.shortlisted / stats.total) * 100 : 0} />
                  
                  <div className="flex justify-between items-center">
                    <span>Selected</span>
                    <span className="font-medium">{stats.selected}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.selected / stats.total) * 100 : 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current distribution of applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'Pending', count: stats.pending, color: 'bg-yellow-500' },
                    { status: 'Reviewed', count: stats.reviewed, color: 'bg-blue-500' },
                    { status: 'Shortlisted', count: stats.shortlisted, color: 'bg-purple-500' },
                    { status: 'Selected', count: stats.selected, color: 'bg-green-500' },
                    { status: 'Rejected', count: stats.rejected, color: 'bg-red-500' },
                    { status: 'Withdrawn', count: stats.withdrawn, color: 'bg-gray-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1">{item.status}</span>
                      <span className="font-medium">{item.count}</span>
                      <span className="text-sm text-muted-foreground">
                        ({stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Details Modal */}
      {selectedApplicationId && (
        <ApplicationDetailsModal
          application={applications.find(app => app.id === selectedApplicationId) || null}
          isOpen={!!selectedApplicationId}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </div>
  )
}

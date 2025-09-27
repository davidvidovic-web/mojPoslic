'use client'

import { useState } from 'react'
import { JobApplication, ApplicationStatus } from '@/types/application'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Filter,
  MessageCircle,
  Calendar,
  Star,
  UserCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

interface ClientApplicationsManagerProps {
  applications: JobApplication[]
  onUpdateApplicationStatus?: (applicationId: string, status: string) => void
  onMessageApplicant?: (applicationId: string, userId: string) => void
  onViewProfile?: (userId: string, applicationId: string) => void
  loading?: boolean
}

export function ClientApplicationsManager({ 
  applications, 
  onUpdateApplicationStatus,
  onMessageApplicant,
  onViewProfile,
  loading = false 
}: ClientApplicationsManagerProps) {
  const t = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Function to strip HTML tags from text
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }
  
  // Filter applications
  const filteredApplications = applications.filter(application => {
    const matchesSearch = !searchTerm || 
      application.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || application.status.toLowerCase() === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === ApplicationStatus.PENDING).length
  const acceptedApplications = applications.filter(app => app.status === ApplicationStatus.SELECTED).length
  const rejectedApplications = applications.filter(app => app.status === ApplicationStatus.REJECTED).length

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300'
      case ApplicationStatus.SELECTED:
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300'
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300'
      case ApplicationStatus.REVIEWED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case ApplicationStatus.SELECTED:
        return <CheckCircle className="h-4 w-4" />
      case ApplicationStatus.REJECTED:
        return <XCircle className="h-4 w-4" />
      case ApplicationStatus.REVIEWED:
        return <UserCheck className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return t('dashboard.applications.status.pending') || 'Pending'
      case ApplicationStatus.SELECTED:
        return t('dashboard.applications.status.selected') || 'Selected'
      case ApplicationStatus.REJECTED:
        return t('dashboard.applications.status.rejected') || 'Rejected'
      case ApplicationStatus.REVIEWED:
        return t('dashboard.applications.status.reviewed') || 'Reviewed'
      case ApplicationStatus.SHORTLISTED:
        return t('dashboard.applications.status.shortlisted') || 'Shortlisted'
      case ApplicationStatus.WITHDRAWN:
        return t('dashboard.applications.status.withdrawn') || 'Withdrawn'
      default:
        return t('dashboard.applications.unknown') || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center lg:text-left">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Applications Loading */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
                  <div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-sm bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalApplications}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.totalApplications') || 'Total Applications'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.allTime') || 'All time'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-sm bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pendingApplications}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.pendingApplications') || 'Pending Review'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.needsAttention') || 'Needs attention'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-sm bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{acceptedApplications}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.acceptedApplications') || 'Accepted'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.approved') || 'Approved'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-sm bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{rejectedApplications}</div>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('dashboard.stats.rejectedApplications') || 'Rejected'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.stats.declined') || 'Declined'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('dashboard.search.applications') || 'Search applications, taskers, or jobs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-sm"
              />
            </div>
          </div>
          <div className="w-full lg:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('dashboard.applications.filterByStatus') || 'Filter by status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard.filter.allStatuses') || 'All Statuses'}</SelectItem>
                <SelectItem value="pending">{t('dashboard.filter.pending') || 'Pending'}</SelectItem>
                <SelectItem value="selected">{t('dashboard.filter.accepted') || 'Accepted'}</SelectItem>
                <SelectItem value="rejected">{t('dashboard.filter.rejected') || 'Rejected'}</SelectItem>
                <SelectItem value="reviewed">{t('dashboard.filter.reviewed') || 'Reviewed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('dashboard.client.applications.list') || 'Recent Applications'}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredApplications.length} {filteredApplications.length === 1 ? t('dashboard.applications.application') : t('dashboard.applications.applications')}
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-16 h-16 rounded-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('dashboard.applications.empty.title') || 'No applications found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? (t('dashboard.applications.empty.filtered') || 'No applications match your current filters. Try adjusting your search or filter criteria.')
                : (t('dashboard.applications.empty.none') || 'You haven\'t received any job applications yet. Applications will appear here once taskers apply to your jobs.')
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white dark:bg-gray-950 rounded-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {application.user?.name?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {application.user?.name || t('dashboard.applications.anonymousTasker')}
                        </h4>
                        {/* Note: is_verified property not available in current user type */}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('dashboard.applications.appliedFor')} <span className="font-medium">{application.job?.title || t('dashboard.applications.unknownJob')}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {application.createdAt ? formatDistanceToNow(new Date(application.createdAt), { addSuffix: true }) : t('dashboard.applications.unknownTime')}
                        </div>
                        {application.user?.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {application.user.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(application.status)} flex items-center gap-1 px-3 py-1`}>
                    {getStatusIcon(application.status)}
                    {getStatusText(application.status)}
                  </Badge>
                </div>

                {application.message && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-sm">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {stripHtml(application.message)}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {onViewProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProfile(application.user?.id || application.userId, application.id)}
                      className="rounded-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t('dashboard.applications.viewProfile') || 'View Profile'}
                    </Button>
                  )}
                  
                  {onMessageApplicant && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMessageApplicant(application.id, application.user?.id || application.userId)}
                      className="rounded-sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {t('dashboard.applications.message') || 'Message'}
                    </Button>
                  )}

                  {application.status === ApplicationStatus.PENDING && onUpdateApplicationStatus && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onUpdateApplicationStatus(application.id, ApplicationStatus.SELECTED)}
                        className="rounded-sm bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('dashboard.applications.accept') || 'Accept'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateApplicationStatus(application.id, ApplicationStatus.REJECTED)}
                        className="rounded-sm border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t('dashboard.applications.reject') || 'Reject'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

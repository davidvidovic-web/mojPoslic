'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateJobData } from '@/types/job'
import { Rocket, Star, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useRef } from 'react'
import { MapPin, Calendar, DollarSign, Mail, Globe, Briefcase, Phone } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTranslations, useLocale } from 'next-intl'
import { useData } from '@/hooks/use-data'
import type { City, Category } from '@/lib/static-data-types'
import { getJobPostingCost } from '@/lib/connections/utils'

interface ReviewStepProps {
  formData: CreateJobData
  onValidation: (isValid: boolean) => void
  onChange?: (updates: Partial<CreateJobData>) => void
  isEditMode?: boolean
}

export function ReviewStep({ formData, onValidation, onChange, isEditMode = false }: ReviewStepProps) {
  const { user } = useAuth()
  const t = useTranslations('jobs')
  const tCommon = useTranslations('common')
  const tSalary = useTranslations('jobPost.types.compensation')
  const tSchedule = useTranslations('jobPost.types.schedule')
  const tDuration = useTranslations('jobPost.types.schedule.durationOptions')
  const tTransportation = useTranslations('jobPost.types.transportation.options')
  const locale = useLocale()
  const { cities, categories } = useData()
  const [city, setCity] = useState<City | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [todayJobCount, setTodayJobCount] = useState<number>(0)

  // Helper function to map job type to translation key
  const getJobTypeTranslationKey = (type: string) => {
    switch (type) {
      case 'quick_job':
      case 'quick-job':
        return 'quickJob'
      case 'full_time':
      case 'full-time':
        return 'fullTime'
      case 'part_time':
      case 'part-time':
        return 'partTime'
      case 'remote':
        return 'remote'
      default:
        return type
    }
  }
  const getCityName = (city: City) => {
    return locale === 'bs' ? city.name_bs : city.name_en
  }

  const getCategoryName = (category: Category) => {
    return locale === 'bs' ? category.name_bs : category.name_en
  }

  // Fetch city and category details for display
  useEffect(() => {
    if (formData.city_id) {
      const foundCity = cities.find(c => c.id === formData.city_id)
      setCity(foundCity || null)
    }

    if (formData.category_id) {
      let foundCategory = null
      
      for (const cat of categories) {
        const found = cat.children?.find(child => child.id === formData.category_id)
        if (found) {
          foundCategory = found
          break
        }
      }
      setCategory(foundCategory)
    }
  }, [formData.city_id, formData.category_id, cities, categories])

  // Fetch today's job count to determine if connections will be deducted
  // Only fetch this for create mode, not edit mode
  // Use a ref to cache the result and avoid repeated API calls
  const todayJobCountRef = useRef<number | null>(null)
  
  useEffect(() => {
    const fetchTodayJobCount = async () => {
      if (!user?.id || isEditMode) return
      if (todayJobCountRef.current !== null) return // Already fetched
      
      try {
        const response = await fetch('/api/jobs/today-count')
        if (response.ok) {
          const data = await response.json()
          const count = data.count || 0
          setTodayJobCount(count)
          todayJobCountRef.current = count
        }
      } catch (error) {
        console.error('Error fetching today job count:', error)
        setTodayJobCount(0)
        todayJobCountRef.current = 0
      }
    }

    fetchTodayJobCount()
  }, [user?.id, isEditMode])

  // Validation - invalid if date/time has passed OR if required fields are missing
  useEffect(() => {
    // Check if the start date/time has passed
    const checkDateTimePassed = () => {
      if (!formData.start_date || formData.start_date === 'negotiable') return false
      
      const now = new Date()
      const startDate = new Date(formData.start_date)
      
      if (formData.start_time && formData.start_time !== 'negotiable') {
        // If we have both date and time, combine them
        const [hours, minutes] = formData.start_time.split(':').map(Number)
        startDate.setHours(hours, minutes, 0, 0)
        
        // Compare full datetime
        return startDate < now
      } else {
        // If we only have date, reset both to midnight for date-only comparison
        startDate.setHours(0, 0, 0, 0)
        now.setHours(0, 0, 0, 0)
        
        // Compare dates
        return startDate < now
      }
    }

    // Check if all required fields from previous steps are complete
    const areAllRequiredFieldsComplete = () => {
      const requiredFields = [
        'title',
        'description', 
        'category_id',
        'city_id',
        'start_date',
        'start_time'
      ]
      
      return requiredFields.every(field => {
        const value = formData[field as keyof CreateJobData]
        // More strict checking - must be truthy string, not just non-empty
        return value && typeof value === 'string' && value.trim().length > 0
      })
    }

    const hasPassedDateTime = checkDateTimePassed()
    const allFieldsComplete = areAllRequiredFieldsComplete()
    
    // Review step is only valid if date/time hasn't passed AND all required fields are complete
    onValidation(!hasPassedDateTime && allFieldsComplete)
  }, [onValidation, formData])

  // Check if the start date/time has passed for UI display
  const isDateTimePassed = () => {
    if (!formData.start_date || formData.start_date === 'negotiable') return false
    
    const now = new Date()
    const startDate = new Date(formData.start_date)
    
    if (formData.start_time && formData.start_time !== 'negotiable') {
      // If we have both date and time, combine them
      const [hours, minutes] = formData.start_time.split(':').map(Number)
      startDate.setHours(hours, minutes, 0, 0)
      
      // Compare full datetime
      return startDate < now
    } else {
      // If we only have date, reset both to midnight for date-only comparison
      startDate.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      
      // Compare dates
      return startDate < now
    }
  }

  const getTransportationDisplay = (transportation?: string, amount?: number) => {
    if (!transportation) return null
    
    switch (transportation) {
      case 'provided':
        return tTransportation('provided')
      case 'not_provided':
        return tTransportation('notProvided')
      case 'employee_responsible':
      case 'tasker_responsible':
        return tTransportation('taskerResponsible')
      case 'compensated':
        return amount ? `${tTransportation('compensated')}: ${amount} BAM` : tTransportation('compensated')
      default:
        return transportation.charAt(0).toUpperCase() + transportation.slice(1).replace(/_/g, ' ')
    }
  }

  const getSalaryDisplay = () => {
    if (!formData.salaryType && !formData.performance_bonus) return tCommon('messages.notSpecified')
    
    // Handle negotiable type
    if (formData.salaryType === 'negotiable') {
      return tSalary('salaryTypes.negotiable')
    }
    
    // Handle fixed price
    if (formData.salaryType === 'fixed' && formData.salaryMin) {
      return `${formData.salaryMin} BAM`
    }
    
    // Handle daily rate (single value)
    if (formData.salaryType === 'daily' && formData.salaryMin) {
      return `${formData.salaryMin} BAM`
    }
    
    // Handle hourly rate (range)
    if (formData.salaryType === 'hourly' && (formData.salaryMin || formData.salaryMax)) {
      if (formData.salaryMin && formData.salaryMax) {
        return `${formData.salaryMin} - ${formData.salaryMax} BAM`
      } else if (formData.salaryMin) {
        return `${formData.salaryMin} BAM`
      }
    }
    
    return tCommon('messages.notSpecified')
  }

  const getPerformanceBonusDisplay = () => {
    return formData.performance_bonus ? tCommon('general.yes') : tCommon('general.no')
  }

  const formatJobTypeForDisplay = (jobType: string) => {
    const formatted = jobType.replace(/[_-]/g, ' ')
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('review.title')}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t('review.description')}
        </p>
      </div>

      <div className="grid gap-4">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t('review.sections.basicInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{formData.title}</h4>
              <p className="text-muted-foreground">{formData.company}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t(`types.${getJobTypeTranslationKey(formData.type)}`)}</Badge>
              {city && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getCityName(city)}
                </Badge>
              )}
              {category && (
                <Badge variant="outline">{getCategoryName(category)}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('review.sections.jobDescription')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
            {formData.requirements && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">{t('form.requirements')}:</h5>
                <div 
                  className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.requirements }}
                />
              </div>
            )}
            {formData.benefits && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">{t('form.benefits')}:</h5>
                <div 
                  className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.benefits }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Schedule */}
        {(formData.job_address || formData.start_date || formData.start_time || formData.duration) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('review.sections.locationSchedule')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.job_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm">{formData.job_address}</span>
                </div>
              )}
              {formData.start_date && (
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${formData.start_date !== 'negotiable' && isDateTimePassed() ? 'text-destructive' : ''}`}>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.start_date === 'negotiable' ? (
                        `${t('review.starts')}: ${tSchedule('byAgreement')}`
                      ) : (
                        <>
                          {t('review.starts')}: {new Date(formData.start_date).toLocaleDateString()}
                          {formData.start_time && formData.start_time !== 'negotiable' && ` ${t('review.at')} ${new Date(`2000-01-01T${formData.start_time}`).toLocaleTimeString(locale === 'bs' ? 'bs-BA' : 'en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: locale !== 'bs'
                          })}`}
                          {formData.start_time === 'negotiable' && ` ${t('review.at')} ${tSchedule('byAgreement')}`}
                        </>
                      )}
                    </span>
                  </div>
                  {formData.start_date !== 'negotiable' && isDateTimePassed() && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <span className="font-medium">⚠️ {formData.start_time && formData.start_time !== 'negotiable' ? 'This date and time has already passed' : 'This date has already passed'}</span>
                    </div>
                  )}
                </div>
              )}
              {formData.duration && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('review.duration')}: {tDuration(formData.duration)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Compensation & Transportation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('sections.compensationTransportation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">{t('form.labels.paymentType')}: </span>
              <span className="text-sm">{formData.salaryType ? tSalary(`salaryTypes.${formData.salaryType}`) : tCommon('messages.notSpecified')}</span>
            </div>
            <div>
              <span className="text-sm font-medium">{t('labels.salary')}: </span>
              <span className="text-sm">{getSalaryDisplay()}</span>
            </div>
            <div>
              <span className="text-sm font-medium">{tSalary('performanceBonus')}: </span>
              <span className="text-sm">{getPerformanceBonusDisplay()}</span>
            </div>
            {formData.transportation && (
              <div>
                <span className="text-sm font-medium">{t('form.labels.transportation')}: </span>
                <span className="text-sm">{getTransportationDisplay(formData.transportation, formData.transportation_amount)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('review.sections.contactInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formData.email || user?.email}</span>
            </div>
            {formData.contact_email && formData.contact_email !== (formData.email || user?.email) && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.contact_email}</span>
                <span className="text-xs text-muted-foreground">({t('review.alternateContact')})</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">+387 {user.phone}</span>
              </div>
            )}
            {formData.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={formData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {formData.website}
                </a>
              </div>
            )}
            {formData.application_url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={formData.application_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {formData.application_url}
                </a>
                <span className="text-xs text-muted-foreground">({t('review.applicationUrl')})</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Job Option - only show for creating new jobs */}
      {!isEditMode && (
        <Card className="border-2 border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              {t('review.featureYourJob')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('review.makeJobFeatured')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('review.featuredJobsAppear')}
                </p>
                <p className="text-xs font-medium text-yellow-600 mt-1">
                  {t('review.willCostConnections', { connections: 5 })}
                </p>
              </div>
              <Switch
                checked={formData.is_featured || false}
                onCheckedChange={(checked) => onChange?.({ is_featured: checked })}
              />
            </div>
            {formData.is_featured && (
              <div className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <Star className="h-3 w-3 inline mr-1" />
                {t('review.willBeFeatured')}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error message if date/time has passed */}
      {isDateTimePassed() && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-[var(--radius)]">
          <h4 className="text-sm font-medium mb-2 text-destructive flex items-center gap-1">
            ⚠️ Cannot Submit Job
          </h4>
          <p className="text-xs text-destructive">
            {formData.start_time 
              ? 'The start date and time you selected has already passed. Please go back and choose a future date and time.'
              : 'The start date you selected has already passed. Please go back and choose a future date.'
            }
          </p>
        </div>
      )}

      {/* Connection deduction notification - show if user has already posted today */}
      {!isDateTimePassed() && todayJobCount >= 1 && formData.type && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-600 dark:border-blue-400 rounded-[var(--radius)]">
          <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <Zap className="h-4 w-4" />
            {t('review.connectionCostNotice')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t('review.alreadyPostedToday', { 
              count: todayJobCount, 
              plural: todayJobCount > 1 ? 's' : '' 
            })}{' '}
            {t('review.additionalCostMessage', {
              jobType: formatJobTypeForDisplay(formData.type),
              connections: getJobPostingCost(formData.type),
              plural: getJobPostingCost(formData.type) !== 1 ? 's' : ''
            })}
          </p>
        </div>
      )}

      {/* Ready to post message - only show if no errors and moved to final position */}
      {!isDateTimePassed() && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-600 dark:border-green-400 rounded-[var(--radius)]">
          <h4 className="text-sm font-medium mb-2 text-green-700 dark:text-green-400 flex items-center gap-1">
            <Rocket className="h-4 w-4" />
            {t('review.readyToPost')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t('review.jobLooksGreat')}
          </p>
        </div>
      )}
    </div>
  )
}

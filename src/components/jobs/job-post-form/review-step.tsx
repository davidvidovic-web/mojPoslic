'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateJobData } from '@/types/job'
import { Rocket } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { formatJobType, formatTransportation } from '@/lib/job-utils'
import { MapPin, Calendar, DollarSign, Mail, Globe, Briefcase } from 'lucide-react'

interface ReviewStepProps {
  formData: CreateJobData
  onValidation: (isValid: boolean) => void
}

interface City {
  id: string
  nameEN: string
  nameBS: string
}

interface Category {
  id: string
  nameEN: string
  nameBS: string
}

export function ReviewStep({ formData, onValidation }: ReviewStepProps) {
  const { user } = useAuth()
  const [city, setCity] = useState<City | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  // Fetch city and category details for display
  useEffect(() => {
    const fetchDetails = async () => {
      if (formData.city_id) {
        try {
          const response = await fetch('/api/cities')
          const data = await response.json()
          const foundCity = data.cities?.find((c: City) => c.id === formData.city_id)
          setCity(foundCity || null)
        } catch (error) {
          console.error('Error fetching city:', error)
        }
      }

      if (formData.category_id) {
        try {
          const response = await fetch('/api/categories')
          const data = await response.json()
          const allCategories = data.categories || []
          let foundCategory = null
          
          for (const cat of allCategories) {
            const found = cat.children?.find((child: Category) => child.id === formData.category_id)
            if (found) {
              foundCategory = found
              break
            }
          }
          setCategory(foundCategory)
        } catch (error) {
          console.error('Error fetching category:', error)
        }
      }
    }

    fetchDetails()
  }, [formData.city_id, formData.category_id])

  // Always valid since we're just reviewing
  useEffect(() => {
    onValidation(true)
  }, [onValidation])

  const getSalaryDisplay = () => {
    if (!formData.salaryType && !formData.salary) return 'Not specified'
    
    if (formData.salaryType === 'fixed' && formData.salaryMin) {
      return `${formData.salaryMin} BAM (${formData.salaryType})`
    }
    
    if (formData.salaryType && (formData.salaryMin || formData.salaryMax)) {
      const min = formData.salaryMin || 'Not specified'
      const max = formData.salaryMax || 'Not specified'
      return `${min} - ${max} BAM (${formData.salaryType})`
    }
    
    if (formData.salary) {
      return formData.salary
    }
    
    return 'Not specified'
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Job Posting</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please review all the information below before submitting your job posting.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{formData.title}</h4>
              <p className="text-muted-foreground">{formData.company}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatJobType(formData.type)}</Badge>
              {city && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {city.nameEN}
                </Badge>
              )}
              {category && (
                <Badge variant="outline">{category.nameEN}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="text-sm prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
            {formData.requirements && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">Requirements:</h5>
                <div 
                  className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.requirements }}
                />
              </div>
            )}
            {formData.benefits && (
              <div className="mt-4">
                <h5 className="font-medium text-sm mb-2">Benefits:</h5>
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
                Location & Schedule
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
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Starts: {new Date(formData.start_date).toLocaleDateString()}
                    {formData.start_time && ` at ${new Date(`2000-01-01T${formData.start_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                  </span>
                </div>
              )}
              {formData.duration && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Duration: {formData.duration.replace('_', ' ').replace(/(\d+)/, '$1 ').toLowerCase()}
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
              Compensation & Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm font-medium">Salary: </span>
              <span className="text-sm">{getSalaryDisplay()}</span>
            </div>
            {formData.transportation && (
              <div>
                <span className="text-sm font-medium">Transportation: </span>
                <span className="text-sm">{formatTransportation(formData.transportation, formData.transportation_amount)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formData.email || user?.email}</span>
            </div>
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
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="text-sm font-medium mb-2 text-primary flex items-center gap-1">
          <Rocket className="h-4 w-4" />
          Ready to Post!
        </h4>
        <p className="text-xs text-muted-foreground">
          Your job posting looks great! Click &quot;Submit Job Posting&quot; below to make it live and start receiving applications.
        </p>
      </div>
    </div>
  )
}

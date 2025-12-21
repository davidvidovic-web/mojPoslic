'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreateJobData } from "@/types/job"
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useData } from "@/hooks/use-data"
import { useCreateJobMutation } from "@/hooks/queries/useJobs"
import { useJobFormAutoSave } from "@/hooks/use-job-form-auto-save"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'
import { BasicInformationSection } from "./job-post-form/basic-information-section"
import { JobDetailsSection } from "./job-post-form/job-details-section"
import { SalarySection } from "./job-post-form/salary-section"
import { DescriptionSection } from "./job-post-form/description-section"
import { ContactSection } from "./job-post-form/contact-section"
import { getCityCoordinates } from "@/lib/city-coordinates"
import type { Category } from "@/lib/static-data-types"

interface JobPostFormProps {
  onJobPosted?: () => void
}

export function JobPostForm({ onJobPosted }: JobPostFormProps) {
  const t = useTranslations('jobs.postForm')
  const { cities, categories } = useData()
  const createJobMutation = useCreateJobMutation()
  
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('')
  const [availableChildCategories, setAvailableChildCategories] = useState<Category[]>([])
  const { user } = useSupabaseAuth()
  const [includeStartTime, setIncludeStartTime] = useState(false)
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    type: 'quick_job',
    job_type: 'quick_job',
    city_id: '',
    category_id: '',
    salary: '',
    salaryType: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    website: '',
    email: '',
    contact_email: '',
    application_url: '',
    start_date: undefined,
    job_address: undefined,
    job_latitude: undefined,
    job_longitude: undefined
  })

  // Auto-save functionality
  const { clearSavedFormData, saveNow, isFormDataMeaningful } = useJobFormAutoSave({
    formData,
    onRestore: (savedData) => {
      setFormData(savedData)
      // Restore parent category if available
      if (savedData.category_id) {
        const category = categories.find(cat => 
          cat.id === savedData.category_id || 
          cat.children?.some(child => child.id === savedData.category_id)
        )
        if (category) {
          if (category.children?.some(child => child.id === savedData.category_id)) {
            setSelectedParentCategory(category.id)
          }
        }
      }
    },
    enabled: true
  })

  // Update available child categories when parent category changes
  useEffect(() => {
    if (selectedParentCategory) {
      const parentCategory = categories.find(cat => cat.id === selectedParentCategory)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAvailableChildCategories((parentCategory?.children || []) as any)
      // Reset child category selection when parent changes
      setFormData(prev => ({ ...prev, category_id: '' }))
    } else {
      setAvailableChildCategories([])
    }
  }, [selectedParentCategory, categories])

  // Get city coordinates for map centering
  const getSelectedCityCoordinates = () => {
    if (!formData.city_id) return null
    
    // First check if we have predefined coordinates
    const cityKey = formData.city_id
    
    // Convert our new city format to the format expected by getCityCoordinates
    const legacyCities = cities.map(city => ({
      id: parseInt(city.id, 10),
      key: city.key,
      nameEN: city.name_en,
      nameBS: city.name_bs
    }))
    
    const predefinedCoords = getCityCoordinates(cityKey, legacyCities)
    if (predefinedCoords) {
      return predefinedCoords
    }
    
    // If not found in predefined coordinates, try to find from loaded cities
    const selectedCity = cities.find(city => city.key === cityKey)
    if (selectedCity) {
      // For cities not in our static mapping, provide approximate coordinates
      return {
        lat: 43.8563, // Default to Sarajevo area
        lng: 18.4131,
        name: selectedCity.name_en
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error(t('errors.mustBeLoggedIn'))
      return
    }

    if (!formData.title || !formData.description || !formData.city_id) {
      toast.error(t('errors.fillRequiredFields'))
      return
    }

    if (!formData.category_id) {
      toast.error(t('errors.selectCategorySubcategory'))
      return
    }

    // Ensure we have an email (either from form or user)
    const contactEmail = formData.email || user.email
    if (!contactEmail) {
      toast.error(t('errors.contactEmailRequired'))
      return
    }

    // Prepare job data for API submission
    const jobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type, // API expects 'type', not 'job_type'
      city_id: formData.city_id,
      category_id: formData.category_id,
      requirements: formData.requirements?.trim() || null,
      benefits: formData.performance_bonus ? 
        (formData.benefits ? `${formData.benefits}\n• Performance bonus available` : '• Performance bonus available') : 
        formData.benefits?.trim() || null,
      salaryType: formData.salaryType || null, // API expects 'salaryType', not 'salary_type'
      salaryMin: formData.salaryMin || null,
      salaryMax: formData.salaryMax || null,
      application_url: formData.application_url?.trim() || formData.website?.trim() || null,
      website: formData.website?.trim() || null,
      email: formData.email?.trim() || user.email,
      contact_email: formData.contact_email?.trim() || formData.email?.trim() || user.email,
      job_address: formData.job_address?.trim() || null,
      job_latitude: formData.job_latitude || null,
      job_longitude: formData.job_longitude || null,
      // Schedule and timing fields
      start_date: formData.start_date || null,
      start_time: formData.start_time || null,
      duration: formData.duration || null,
      duration_days: formData.duration_days || null,
      // Transportation fields
      transportation: formData.transportation || null,
      transportation_amount: formData.transportation_amount || null,
      has_parking: formData.has_parking || false,
      public_transport_info: formData.public_transport_info?.trim() || null,
      // Additional job fields
      application_deadline: formData.application_deadline || null,
      is_urgent: formData.is_urgent || false
    }

    createJobMutation.mutate(jobData, {
      onSuccess: () => {
        // Job posted successfully - toast will be handled by the component that calls this
        
        // Clear saved form data since job was posted successfully
        clearSavedFormData()
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          requirements: '',
          benefits: '',
          type: 'quick_job',
          job_type: 'quick_job',
          city_id: '',
          category_id: '',
          salary: '',
          salaryType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          website: '',
          email: '',
          contact_email: '',
          application_url: '',
          start_date: undefined,
          job_address: undefined,
          job_latitude: undefined,
          job_longitude: undefined
        })
        setSelectedParentCategory('')
        setAvailableChildCategories([])
        
        onJobPosted?.()
      },
      onError: (error) => {
        console.error('Error posting job:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to post job'
        toast.error(errorMessage)
        
        // Save current form data in case user wants to try again
        saveNow()
      }
    })
  }

  const handleFormDataChange = (newData: Partial<CreateJobData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  // Convert categories to legacy format expected by components
  const legacyCategories = categories.map(cat => ({
    id: cat.id,
    key: cat.key,
    nameBS: cat.name_bs,
    nameEN: cat.name_en,
    isPopular: cat.is_popular,
    sortOrder: cat.sort_order,
    children: (cat.children || []).map(child => ({
      id: child.id,
      key: child.key,
      nameBS: child.name_bs,
      nameEN: child.name_en,
      isPopular: child.is_popular,
      sortOrder: child.sort_order
    }))
  }))

  // Convert availableChildCategories to legacy format
  const legacyChildCategories = availableChildCategories.map(cat => ({
    id: cat.id,
    key: cat.key,
    nameBS: cat.name_bs,
    nameEN: cat.name_en,
    isPopular: cat.is_popular,
    sortOrder: cat.sort_order
  }))

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInformationSection
          formData={formData}
          onChange={handleFormDataChange}
          categories={legacyCategories}
          selectedParentCategory={selectedParentCategory}
          onParentCategoryChange={setSelectedParentCategory}
          availableChildCategories={legacyChildCategories}
        />

        <JobDetailsSection
          formData={formData}
          onChange={handleFormDataChange}
          includeStartTime={includeStartTime}
          onIncludeStartTimeChange={setIncludeStartTime}
          getSelectedCityCoordinates={getSelectedCityCoordinates}
        />

        <SalarySection
          formData={formData}
          onChange={handleFormDataChange}
        />

        <DescriptionSection
          formData={formData}
          onChange={handleFormDataChange}
        />

        <ContactSection
          formData={formData}
          onChange={handleFormDataChange}
        />

        {/* Auto-save status indicator */}
        {isFormDataMeaningful && (
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Draft saved automatically
            </div>
            <button
              type="button"
              onClick={() => {
                clearSavedFormData()
                toast.success('Draft cleared')
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear draft
            </button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={createJobMutation.isPending}>
          {createJobMutation.isPending ? t('posting') : t('submit')}
        </Button>
      </form>
    </div>
  )
}

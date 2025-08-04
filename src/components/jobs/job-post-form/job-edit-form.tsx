'use client'

import { CreateJobData, Job } from '@/types/job'
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { useTranslations } from 'next-intl'
import { useData } from '@/hooks/use-data'
import { useUpdateJobMutation } from '@/hooks/queries/useJobs'
import type { Database } from '@/types/supabase'

type JobUpdate = Database['public']['Tables']['job_listings']['Update']

interface JobEditFormProps {
  job: Job
  onJobUpdated?: () => void
  onCancel?: () => void
  showCard?: boolean
}

// Helper function to map Job to CreateJobData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJobToFormData(job: Job, cities: any[], categories: any[]): Partial<CreateJobData> {
  console.log('Mapping job to form data:', {
    jobId: job.id,
    jobTitle: job.title,
    jobCityId: job.city_id,
    jobCategoryId: job.category_id,
    availableCitiesCount: cities.length,
    availableCategoriesCount: categories.length
  })
  
  // If data isn't loaded yet, return what we have
  if (cities.length === 0 || categories.length === 0) {
    console.warn('Cities or categories not loaded yet, using raw data')
    return {
      title: job.title,
      description: job.description,
      type: job.job_type as 'quick_job' | 'full_time' | 'part_time' | 'remote',
      city_id: job.city_id, // Use as-is until data loads
      category_id: job.category_id, // Use as-is until data loads
      salary: job.salary_amount?.toString() || '',
      salaryType: job.salary_type as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable',
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      email: job.contact_info || '',
      website: job.application_url || '',
      tags: job.tags,
      start_date: job.start_date && job.start_date !== '' ? job.start_date : 'negotiable',
      start_time: job.start_time && job.start_time !== '' ? job.start_time : 'negotiable',
      duration: job.duration,
      transportation: job.transportation,
      transportation_amount: job.transportation_amount,
      has_parking: job.has_parking,
      public_transport_info: job.public_transport_info,
      job_address: job.job_address,
      job_latitude: job.job_latitude,
      job_longitude: job.job_longitude,
      requirements: job.requirements,
      benefits: job.benefits,
      contact_email: job.contact_email,
      application_url: job.application_url,
      is_featured: job.is_featured
    }
  }
  
  // Convert city key back to ID for the form
  // The job has city_id as a key (e.g., "banja-luka"), but the form expects an ID (e.g., "1")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityFromKey = cities.find((c: any) => c.key === job.city_id)
  const cityIdForForm = cityFromKey?.id || job.city_id
  
  console.log('City mapping:', {
    jobCityKey: job.city_id,
    foundCity: cityFromKey?.name,
    cityIdForForm
  })
  
  // Convert category key back to ID for the form  
  // The job has category_id as a key (e.g., "majstorski-radovi"), but the form expects an ID (e.g., "1")
  let categoryIdForForm = job.category_id
  if (job.category_id) {
    // Try to find in main categories first by key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryFromKey = categories.find((cat: any) => cat.key === job.category_id)
    if (categoryFromKey) {
      categoryIdForForm = categoryFromKey.id
    } else {
      // Search in subcategories by key
      for (const cat of categories) {
        // Handle both 'subcategories' (JSON) and 'children' (TypeScript type)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subcats = (cat as any).subcategories || cat.children
        if (subcats) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subcat = subcats.find((sub: any) => sub.key === job.category_id)
          if (subcat) {
            categoryIdForForm = subcat.id
            break
          }
        }
      }
    }
  }
  
  console.log('Category mapping:', {
    jobCategoryKey: job.category_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    foundInMain: categories.find((cat: any) => cat.key === job.category_id)?.name,
    categoryIdForForm
  })

  return {
    title: job.title,
    description: job.description,
    type: job.job_type as 'quick_job' | 'full_time' | 'part_time' | 'remote',
    city_id: cityIdForForm,
    category_id: categoryIdForForm,
    salary: job.salary_amount?.toString() || '',
    salaryType: job.salary_type as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable',
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    email: job.contact_info || '',
    website: job.application_url || '',
    tags: job.tags,
    // Handle special cases for start_date and start_time
    // If they're null/undefined/empty, it means "I don't know exact date/time" was selected
    start_date: job.start_date && job.start_date !== '' ? job.start_date : 'negotiable',
    start_time: job.start_time && job.start_time !== '' ? job.start_time : 'negotiable',
    duration: job.duration,
    transportation: job.transportation,
    transportation_amount: job.transportation_amount,
    has_parking: job.has_parking,
    public_transport_info: job.public_transport_info,
    job_address: job.job_address,
    job_latitude: job.job_latitude,
    job_longitude: job.job_longitude,
    requirements: job.requirements,
    benefits: job.benefits,
    contact_email: job.contact_email,
    application_url: job.application_url,
    is_featured: job.is_featured
  }
}

export function JobEditForm({ 
  job,
  onJobUpdated, 
  onCancel,
  showCard = true
}: JobEditFormProps) {
  const { cities, categories, loading, error } = useData()
  const updateJobMutation = useUpdateJobMutation()
  const t = useTranslations('jobs.review')
  
  // Add loading and error state debugging
  console.log('JobEditForm useData state:', {
    citiesLoaded: cities.length,
    categoriesLoaded: categories.length,
    loading,
    error
  })
  
  // Don't render form until data is loaded
  if (loading) {
    return <div>Loading form data...</div>
  }
  
  if (error) {
    return <div>Error loading form data: {error}</div>
  }
  
  if (cities.length === 0 || categories.length === 0) {
    return <div>No cities or categories data available</div>
  }

  const handleSubmit = async (formData: CreateJobData) => {
    try {
      console.log('Job edit form data:', formData)
      console.log('Available cities:', cities.length)
      console.log('Available categories:', categories.length)
      
      // Convert city_id to city key
      const selectedCity = formData.city_id ? cities.find(c => c.id === formData.city_id) : null
      const cityKey = selectedCity?.key
      
      console.log('City mapping:', { 
        formCityId: formData.city_id, 
        selectedCity: selectedCity?.name, 
        cityKey 
      })
      
      if (!cityKey) {
        toast.error('Please select a valid city')
        return
      }

      // Convert category_id to category key
      let categoryKey = null
      if (formData.category_id) {
        // Find category by ID (could be parent or subcategory)
        const foundCategory = categories.find(cat => cat.id === formData.category_id)
        if (foundCategory) {
          categoryKey = foundCategory.key
        } else {
          // Search in subcategories
          for (const cat of categories) {
            if (cat.children) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const subcat = cat.children.find((sub: any) => sub.id === formData.category_id)
              if (subcat) {
                categoryKey = subcat.key
                break
              }
            }
          }
        }
      }
      
      console.log('Category mapping:', { 
        formCategoryId: formData.category_id, 
        foundInMain: categories.find(cat => cat.id === formData.category_id)?.name,
        finalCategoryKey: categoryKey 
      })
      
      // Ensure we have a valid category key - this field is required
      if (!categoryKey) {
        console.error('Category mapping failed. Available categories:', categories.map(c => ({ id: c.id, key: c.key, name: c.name })))
        toast.error('Please select a valid category')
        return
      }
      
      // Prepare the update data for Supabase
      const updateData: JobUpdate = {
        title: formData.title,
        description: formData.description,
        job_type: formData.type,
        city_id: cityKey,
        category_id: categoryKey, // This will never be null now
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        salary_type: formData.salaryType || null,
        salary_min: formData.salaryMin || null,
        salary_max: formData.salaryMax || null,
        salary_amount: formData.salary ? parseFloat(formData.salary) : null,
        contact_info: formData.email || null,
        application_url: formData.website || null,
        exact_location: formData.job_address || null,
        latitude: formData.job_latitude || null,
        longitude: formData.job_longitude || null,
        updated_at: new Date().toISOString(),
      }

      // Use the mutation hook to update the job
      await updateJobMutation.mutateAsync({
        id: job.id,
        updates: updateData
      })
      
      // Show success message
      toast.success(t('jobUpdated') || 'Job updated successfully')
      
      // Add a small delay to ensure backend transaction is complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-connections'))
        window.dispatchEvent(new CustomEvent('refresh-job-cost'))
      }, 500)
      
      onJobUpdated?.()
      
    } catch (error) {
      console.error('Job update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update job')
      throw error
    }
  }

  // Recalculate initial data whenever cities/categories change
  const initialData = mapJobToFormData(job, cities, categories)

  return (
    <JobFormBase
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText={t('updateJobPosting') || 'Update Job Posting'}
      submittingText={t('updating') || 'Updating...'}
      showCard={showCard}
    />
  )
}

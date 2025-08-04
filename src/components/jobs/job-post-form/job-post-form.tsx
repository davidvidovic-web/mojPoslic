'use client'

import { CreateJobData } from '@/types/job'
import { StaticCategory } from '@/types/static-data'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { toast } from 'sonner'
import { JobFormBase } from './job-form-base'
import { useTranslations } from 'next-intl'
import { useData } from '@/hooks/use-data'
import { useCreateJobMutation } from '@/hooks/queries/useJobs'
import { mapFormDataToCreateAPI } from '@/lib/job-form-mappers'

interface JobPostFormProps {
  onJobPosted?: () => void
  onCancel?: () => void
  initialData?: Partial<CreateJobData>
  showCard?: boolean
}

export function JobPostForm({ 
  onJobPosted, 
  onCancel,
  initialData, 
  showCard = true
}: JobPostFormProps) {
  const { user } = useSupabaseAuth()
  const { cities, categories } = useData()
  const createJobMutation = useCreateJobMutation()
  const t = useTranslations('jobs.review')

  const handleSubmit = async (formData: CreateJobData) => {
    try {
      // Convert city_id to city key
      const selectedCity = formData.city_id ? cities.find(c => c.id === formData.city_id) : null
      const cityKey = selectedCity?.key
      
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
            // Handle both 'subcategories' (JSON) and 'children' (TypeScript type)
            const catWithSubs = cat as StaticCategory & { subcategories?: StaticCategory[] }
            const subcats = catWithSubs.subcategories || cat.children
            if (subcats) {
              const subcat = subcats.find((sub: StaticCategory) => sub.id === formData.category_id)
              if (subcat) {
                categoryKey = subcat.key
                break
              }
            }
          }
        }
      }
      
      const requestData = mapFormDataToCreateAPI(formData, user?.email || '', cityKey, categoryKey || undefined)

      // Ensure type is defined and convert null values to undefined to match API types
      const supabaseData = {
        ...requestData,
        type: requestData.type || 'quick_job',
        category_id: requestData.category_id || undefined,
        requirements: requestData.requirements || undefined,
        benefits: requestData.benefits || undefined,
        salaryType: requestData.salaryType || undefined,
        salaryMin: requestData.salaryMin || undefined,
        salaryMax: requestData.salaryMax || undefined,
        application_url: requestData.application_url || undefined,
        website: requestData.website || undefined,
        email: requestData.email || undefined,
        contact_email: requestData.contact_email || undefined,
        job_address: requestData.job_address || undefined,
        job_latitude: requestData.job_latitude || undefined,
        job_longitude: requestData.job_longitude || undefined,
        posted_by_id: user?.id || ''
      }

      // Use the Supabase-based mutation
      await createJobMutation.mutateAsync(supabaseData)
      
      // Show success message
      toast.success(t('jobPosted'))
      
      // Add a small delay to ensure backend transaction is complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-connections'))
        window.dispatchEvent(new CustomEvent('refresh-job-cost'))
      }, 500)
      
      onJobPosted?.()
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error('Failed to create job. Please try again.')
    }
  }

  return (
    <JobFormBase
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      submitButtonText={t('submitJobPosting')}
      submittingText={t('submitting')}
      showCard={showCard}
    />
  )
}

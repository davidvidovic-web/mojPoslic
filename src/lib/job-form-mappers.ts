import { CreateJobData } from '@/types/job'

/**
 * Maps form data to the create job API format
 */
export function mapFormDataToCreateAPI(
  formData: CreateJobData,
  userEmail: string,
  cityKey: string
) {
  return {
    title: formData.title,
    company: formData.company,
    description: formData.description,
    type: formData.type,
    city_id: cityKey,
    category_id: formData.category_id || null,
    salaryType: formData.salaryType || null,
    salaryMin: formData.salaryMin || null,
    salaryMax: formData.salaryMax || null,
    website: formData.website || null,
    email: formData.email || userEmail,
    start_date: formData.start_date || null,
    start_time: formData.start_time || null,
    job_address: formData.job_address || null,
    job_latitude: formData.job_latitude || null,
    job_longitude: formData.job_longitude || null,
    duration: formData.duration || null,
    transportation: formData.transportation || null,
    requirements: formData.requirements || null,
    benefits: formData.benefits || null,
    application_url: formData.application_url || formData.website || null,
    contact_email: formData.contact_email || formData.email || userEmail,
    is_featured: formData.is_featured || false
  }
}

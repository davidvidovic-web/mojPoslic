import { CreateJobData } from '@/types/job'

/**
 * Maps form data to the create job API format
 * Now consistently uses keys for both cities and categories
 */
export function mapFormDataToCreateAPI(
  formData: CreateJobData,
  userEmail: string,
  cityKey: string,
  categoryKey?: string
) {
  return {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    city_id: cityKey, // Send city key (e.g., "banja-luka")
    category_id: categoryKey || formData.category_id || null, // Send category key (e.g., "majstorski-radovi" or "popravke-u-kuci")
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

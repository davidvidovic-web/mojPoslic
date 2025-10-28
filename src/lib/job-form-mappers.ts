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
    duration_days: formData.duration_days || (() => {
      // Convert duration string to approximate days for legacy compatibility
      if (!formData.duration) return null
      const duration = formData.duration
      if (duration.includes('_days')) return parseInt(duration.replace('_days', ''))
      if (duration.includes('_hours')) return 1 // Hours = 1 day for simplicity
      if (duration.includes('_week')) return parseInt(duration.replace('_week', '')) * 7
      if (duration.includes('_month')) return parseInt(duration.replace('_month', '')) * 30
      if (duration === 'negotiable') return null
      return null
    })(),
    job_address: formData.job_address || null,
    job_latitude: formData.job_latitude || null,
    job_longitude: formData.job_longitude || null,
    duration: formData.duration || null, // Keep legacy field for compatibility
    transportation: formData.transportation || null,
    transportation_amount: formData.transportation_amount || null,
    has_parking: formData.has_parking ?? null,
    public_transport_info: formData.public_transport_info || null,
    requirements: formData.requirements || null,
    benefits: formData.benefits || null,
    tags: formData.tags || null,
    application_url: formData.application_url || formData.website || null,
    contact_email: formData.contact_email || formData.email || userEmail,
    is_featured: formData.is_featured || false,
    application_deadline: formData.application_deadline || null,
    is_urgent: formData.is_urgent || false,
    performance_bonus: formData.performance_bonus || false
  }
}

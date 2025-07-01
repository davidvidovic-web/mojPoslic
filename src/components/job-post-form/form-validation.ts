/**
 * Job form validation utilities
 */

import { CreateJobData } from '@/types/job'

export function validateFormData(formData: CreateJobData): string[] {
  const missingFields: string[] = []
  
  if (!formData.title?.trim()) missingFields.push('Job Title')
  if (!formData.description?.trim()) missingFields.push('Job Description')
  if (!formData.city_id) missingFields.push('Location')
  if (!formData.category_id) missingFields.push('Category')
  if (!formData.email?.trim()) missingFields.push('Contact Email')
  
  return missingFields
}

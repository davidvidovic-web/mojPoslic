'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreateJobData } from "@/types/job"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { BasicInformationSection } from "./job-post-form/basic-information-section"
import { JobDetailsSection } from "./job-post-form/job-details-section"
import { SalarySection } from "./job-post-form/salary-section"
import { DescriptionSection } from "./job-post-form/description-section"
import { ContactSection } from "./job-post-form/contact-section"
import { getCityCoordinates } from "@/lib/city-coordinates"

interface JobPostFormProps {
  onJobPosted?: () => void
}

export function JobPostForm({ onJobPosted }: JobPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cities, setCities] = useState<Array<{ id: number; key: string; nameEN: string; nameBS: string }>>([])
  const [categories, setCategories] = useState<Array<{
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
    sortOrder: number
    children: Array<{
      id: string
      key: string
      nameBS: string
      nameEN: string
      isPopular: boolean
      sortOrder: number
    }>
  }>>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('')
  const [availableChildCategories, setAvailableChildCategories] = useState<Array<{
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
    sortOrder: number
  }>>([])
  const { user } = useAuth()
  const [includeStartTime, setIncludeStartTime] = useState(false)
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    type: 'quick_job',
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

  // Load cities for coordinate mapping
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('/api/cities')
        const data = await response.json()
        setCities(data.cities || [])
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
  }, [])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Update available child categories when parent category changes
  useEffect(() => {
    if (selectedParentCategory) {
      const parentCategory = categories.find(cat => cat.id === selectedParentCategory)
      setAvailableChildCategories(parentCategory?.children || [])
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
    const predefinedCoords = getCityCoordinates(cityKey, cities)
    if (predefinedCoords) {
      console.log(`Found coordinates for ${cityKey}:`, predefinedCoords)
      return predefinedCoords
    }
    
    // If not found in predefined coordinates, try to find from loaded cities
    const selectedCity = cities.find(city => city.key === cityKey)
    if (selectedCity) {
      console.log(`City ${cityKey} not in coordinates mapping, using fallback for:`, selectedCity.nameEN)
      // For cities not in our static mapping, provide approximate coordinates
      return {
        lat: 43.8563, // Default to Sarajevo area
        lng: 18.4131,
        name: selectedCity.nameEN
      }
    }
    
    console.log(`No coordinates found for city key: ${cityKey}`)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to post a job')
      return
    }

    if (!formData.title || !formData.description || !formData.city_id) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.category_id) {
      toast.error('Please select a category and subcategory')
      return
    }

    // Ensure we have an email (either from form or user)
    const contactEmail = formData.email || user.email
    if (!contactEmail) {
      toast.error('A contact email is required to post a job')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          city_id: formData.city_id,
          category_id: formData.category_id || null,
          salary: formData.salary || null,
          salaryType: formData.salaryType || null,
          salaryMin: formData.salaryMin || null,
          salaryMax: formData.salaryMax || null,
          website: formData.website || null,
          email: formData.email || user.email, // Use form email or fallback to user email
          start_date: formData.start_date || null,
          job_address: formData.job_address || null,
          job_latitude: formData.job_latitude || null,
          job_longitude: formData.job_longitude || null,
          requirements: formData.requirements || null,
          benefits: formData.benefits || null,
          contact_email: formData.contact_email || formData.email || user.email,
          application_url: formData.application_url || formData.website || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post job')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to post job')
      }

      toast.success('Job posted successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        benefits: '',
        type: 'quick_job',
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
    } catch (error: unknown) {
      console.error('Error posting job:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to post job'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormDataChange = (newData: Partial<CreateJobData>) => {
    setFormData(prev => ({ ...prev, ...newData }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInformationSection
          formData={formData}
          onChange={handleFormDataChange}
          categories={categories}
          selectedParentCategory={selectedParentCategory}
          onParentCategoryChange={setSelectedParentCategory}
          availableChildCategories={availableChildCategories}
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Posting Job..." : "Post Job"}
        </Button>
      </form>
    </div>
  )
}

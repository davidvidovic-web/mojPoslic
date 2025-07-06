'use client'

import { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobData } from '@/types/job'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface Category {
  id: string
  nameEN: string
  nameBS: string
  children: Array<{
    id: string
    nameEN: string
    nameBS: string
  }>
}

interface BasicDetailsStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function BasicDetailsStep({ formData, onChange, onValidation }: BasicDetailsStepProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Check if user can post all job types (companies and admins)
  const canPostAllJobTypes = user?.role === 'company' || user?.role === 'admin'

  // Clear requirements and benefits for non-company/non-admin users and auto-set job type
  useEffect(() => {
    if (!canPostAllJobTypes) {
      const updates: Partial<CreateJobData> = {}
      
      // Clear requirements and benefits
      if (formData.requirements || formData.benefits) {
        updates.requirements = ''
        updates.benefits = ''
      }
      
      // Auto-set to quick_job if not already set or if it's a company-only job type
      if (!formData.type || ['full_time', 'part_time', 'remote'].includes(formData.type)) {
        updates.type = 'quick_job'
      }
      
      if (Object.keys(updates).length > 0) {
        onChange(updates)
      }
    }
  }, [canPostAllJobTypes, formData.requirements, formData.benefits, formData.type, onChange])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Set initial parent category when editing
  useEffect(() => {
    if (formData.category_id && categories.length > 0) {
      const parentCategory = categories.find(cat =>
        cat.children.some(child => child.id === formData.category_id)
      )
      if (parentCategory) {
        setSelectedParentCategory(parentCategory.id)
      }
    }
  }, [formData.category_id, categories])

  const selectedParent = categories.find(cat => cat.id === selectedParentCategory)
  const availableChildCategories = selectedParent?.children || []

  // Validation
  // Track if we've already reset the job type to prevent infinite loops
  const hasResetJobType = useRef(false)

  useEffect(() => {
    const isValid = !!(
      formData.title?.trim() &&
      formData.description?.trim() &&
      formData.category_id &&
      formData.type
    )
    
    onValidation(isValid)
  }, [formData.title, formData.description, formData.category_id, formData.type, onValidation])

  // Separate effect to handle job type validation for non-company/non-admin users
  useEffect(() => {
    if (!canPostAllJobTypes && formData.type && ['full_time', 'part_time', 'remote'].includes(formData.type) && !hasResetJobType.current) {
      hasResetJobType.current = true
      onChange({ type: 'quick_job' })
    } else if (canPostAllJobTypes || !['full_time', 'part_time', 'remote'].includes(formData.type || '')) {
      hasResetJobType.current = false
    }
  }, [canPostAllJobTypes, formData.type, onChange])

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title *</Label>
          <Input
            id="job-title"
            placeholder="e.g. House Cleaning, Furniture Assembly, Garden Maintenance"
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        {canPostAllJobTypes && (
          <div className="space-y-2">
            <Label htmlFor="job-type">Job Type *</Label>
            <Select value={formData.type || ''} onValueChange={(value) => onChange({ type: value as 'quick_job' | 'full_time' | 'part_time' | 'remote' })}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick_job">Quick Job</SelectItem>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Category</h3>
        
        <div className="space-y-2">
          <Label htmlFor="parent-category">Job Category *</Label>
          <Select 
            value={selectedParentCategory} 
            onValueChange={setSelectedParentCategory}
            disabled={isLoadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nameEN}
                  {category.nameBS !== category.nameEN && (
                    <span className="text-muted-foreground ml-2">({category.nameBS})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {availableChildCategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="child-category">Subcategory (Optional)</Label>
            <Select 
              value={
                availableChildCategories.find(child => child.id === formData.category_id) ? formData.category_id : '__none__'
              } 
              onValueChange={(value) => {
                if (value === '__none__') {
                  onChange({ category_id: selectedParentCategory })
                } else {
                  onChange({ category_id: value })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No specific subcategory</SelectItem>
                {availableChildCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameEN}
                    {category.nameBS !== category.nameEN && (
                      <span className="text-muted-foreground ml-2">({category.nameBS})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedParentCategory && availableChildCategories.length === 0 && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Category selected. This category doesn&apos;t have subcategories.
            </p>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Job Description</h3>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <SimpleRichTextEditor
            value={formData.description || ''}
            onChange={(value) => onChange({ description: value })}
            placeholder="Describe the job, what needs to be done, and any specific requirements..."
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about what you need done, timeline, and any special requirements.
          </p>
        </div>

        {/* Requirements and Benefits - Only for companies and admins */}
        {canPostAllJobTypes && (
          <>
            <div className="space-y-2">
              <Label htmlFor="requirements">
                Requirements <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <SimpleRichTextEditor
                value={formData.requirements || ''}
                onChange={(value) => onChange({ requirements: value })}
                placeholder="e.g. Own tools required, Experience preferred, References needed..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">
                Benefits <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <SimpleRichTextEditor
                value={formData.benefits || ''}
                onChange={(value) => onChange({ benefits: value })}
                placeholder="e.g. Flexible hours, Materials provided, Ongoing work opportunity..."
                className="min-h-[100px]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

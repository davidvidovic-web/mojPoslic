

'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobData } from '@/types/job'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useData } from '@/hooks/use-data'
import { StaticCategory } from '@/types/static-data'

interface BasicDetailsStepProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  onValidation: (isValid: boolean) => void
}

export function BasicDetailsStep({ formData, onChange, onValidation }: BasicDetailsStepProps) {
  const { user } = useSupabaseAuth()
  const t = useTranslations('jobPost.types')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { categories } = useData()
  const [selectedParentCategory, setSelectedParentCategory] = useState('')

  // Helper function to get category name in current locale
  const getCategoryName = (category: { name_en: string; name_bs: string }) => {
    return locale === 'bs' ? category.name_bs : category.name_en
  }

  // Get subcategories for selected parent category
  // Handle both 'children' (TypeScript type) and 'subcategories' (JSON structure)
  const availableSubcategories = selectedParentCategory 
    ? (() => {
        const parentCat = categories.find(cat => cat.id === selectedParentCategory)
        if (!parentCat) return []
        // Try both possible field names
        const parentWithSubs = parentCat as StaticCategory & { subcategories?: StaticCategory[] }
        return parentWithSubs.subcategories || parentCat.children || []
      })()
    : []

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPostAllJobTypes, formData.requirements, formData.benefits, formData.type])

  // Set initial parent category when editing
  useEffect(() => {
    if (formData.category_id && categories.length > 0) {
      // Check if category_id is a subcategory
      const parentCategory = categories.find(cat =>
        cat.children?.some(child => child.id === formData.category_id)
      )
      if (parentCategory) {
        setSelectedParentCategory(parentCategory.id)
      } else {
        // Check if category_id is a parent category itself
        const isParentCategory = categories.find(cat => cat.id === formData.category_id)
        if (isParentCategory) {
          setSelectedParentCategory(formData.category_id)
        }
      }
    }
  }, [formData.category_id, categories])

  // Validation
  // Track if we've already reset the job type to prevent infinite loops
  const hasResetJobType = useRef(false)

  useEffect(() => {
    const isValid = !!(
      formData.title?.trim() &&
      formData.description?.trim() &&
      (formData.category_id || selectedParentCategory) &&
      formData.type
    )
    
    onValidation(isValid)
  }, [formData.title, formData.description, formData.category_id, selectedParentCategory, formData.type, onValidation])

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
        {/* <h3 className="text-lg font-semibold">{t('sections.basicInformation')}</h3> */}
        
        <div className="space-y-2">
          <Label htmlFor="job-title" className="text-base md:text-sm">{t('labels.jobTitle')} *</Label>
          <Input
            id="job-title"
            placeholder={t('placeholders.jobTitleExample')}
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="text-base md:text-sm"
          />
        </div>

        {canPostAllJobTypes && (
          <div className="space-y-2">
            <Label htmlFor="job-type" className="text-base md:text-sm">{t('labels.jobType')} *</Label>
            <Select value={formData.type || ''} onValueChange={(value) => onChange({ type: value as 'quick_job' | 'full_time' | 'part_time' | 'remote' })}>
              <SelectTrigger className="text-base md:text-sm">
                <SelectValue placeholder={t('placeholders.selectJobType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick_job">{t('quickJob')}</SelectItem>
                <SelectItem value="full_time">{t('fullTime')}</SelectItem>
                <SelectItem value="part_time">{t('partTime')}</SelectItem>
                <SelectItem value="remote">{t('remote')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-4">
        <h3 className="text-lg md:text-xl font-semibold">{t('sections.category')}</h3>
        
        <div className="space-y-2">
          <Label htmlFor="parent-category" className="text-base md:text-sm">{t('labels.jobCategory')} *</Label>
          <Select 
            value={selectedParentCategory} 
            onValueChange={(value) => {
              setSelectedParentCategory(value)
              // Auto-set category_id to parent category when selected
              onChange({ category_id: value })
            }}
            disabled={categories.length === 0}
          >
            <SelectTrigger className="text-base md:text-sm">
              <SelectValue placeholder={categories.length === 0 ? t('placeholders.loadingCategories') : t('placeholders.selectCategory')} />
            </SelectTrigger>              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="block truncate">
                      {getCategoryName(category)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>
        </div>

        {selectedParentCategory && availableSubcategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="child-category" className="text-base md:text-sm">{t('labels.subcategory')}</Label>
            <Select 
              value={
                availableSubcategories.find((child: StaticCategory) => child.id === formData.category_id) ? formData.category_id : '__none__'
              } 
              onValueChange={(value) => {
                if (value === '__none__') {
                  // Set to parent category when no subcategory is selected
                  onChange({ category_id: selectedParentCategory })
                } else {
                  onChange({ category_id: value })
                }
              }}
            >
              <SelectTrigger className="text-base md:text-sm">
                <SelectValue placeholder={t('placeholders.selectSubcategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t('placeholders.noSpecificSubcategory')}</SelectItem>
                {availableSubcategories.map((category: StaticCategory) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedParentCategory && availableSubcategories.length === 0 && (
          <div className="p-3 bg-secondary/50 rounded-[var(--radius)]">
            <p className="text-base md:text-sm text-muted-foreground">
              {t('messages.categorySelectedNoSubcategories')}
            </p>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-4">
        <h3 className="text-lg md:text-xl font-semibold">{t('sections.jobDescription')}</h3>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base md:text-sm">{t('labels.description')} *</Label>
          <SimpleRichTextEditor
            value={formData.description || ''}
            onChange={(value) => onChange({ description: value })}
            placeholder={t('placeholders.describeJob')}
            className="min-h-[150px] text-base md:text-sm"
          />
          <p className="text-sm md:text-xs text-muted-foreground">
            {t('messages.descriptionTimeline')}
          </p>
        </div>

        {/* Requirements and Benefits - Only for companies and admins */}
        {canPostAllJobTypes && (
          <>
            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-base md:text-sm">
                {t('labels.requirements')} <span className="text-muted-foreground">({tCommon('forms.optional')})</span>
              </Label>
              <SimpleRichTextEditor
                value={formData.requirements || ''}
                onChange={(value) => onChange({ requirements: value })}
                placeholder={t('placeholders.requirementsExample')}
                className="min-h-[100px] text-base md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits" className="text-base md:text-sm">
                {t('labels.benefits')} <span className="text-muted-foreground">({tCommon('forms.optional')})</span>
              </Label>
              <SimpleRichTextEditor
                value={formData.benefits || ''}
                onChange={(value) => onChange({ benefits: value })}
                placeholder={t('placeholders.benefitsExample')}
                className="min-h-[100px] text-base md:text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

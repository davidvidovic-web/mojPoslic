'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CitiesFilter } from "@/components/filters/cities-filter"
import { CreateJobData } from "@/types/job"
import { useTranslations } from "next-intl"

interface BasicInformationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  categories: Array<{
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
  }>
  selectedParentCategory: string
  onParentCategoryChange: (categoryId: string) => void
  availableChildCategories: Array<{
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
    sortOrder: number
  }>
}

export function BasicInformationSection({
  formData,
  onChange,
  categories,
  selectedParentCategory,
  onParentCategoryChange,
  availableChildCategories
}: BasicInformationSectionProps) {
  const t = useTranslations('jobs.postForm.basicInformation')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="job-title">{t('jobTitle')} *</Label>
        <Input
          id="job-title"
          placeholder={t('jobTitlePlaceholder')}
          required
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">{t('city')} *</Label>
          <CitiesFilter
            value={formData.city_id || ""}
            onChange={(value) => onChange({ city_id: value })}
            placeholder={t('selectCity')}
            className="w-full"
            includeAllOption={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parent-category">{t('category')} *</Label>
          <Select 
            value={selectedParentCategory} 
            onValueChange={onParentCategoryChange}
          >
                        <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    {category.nameEN}
                    {category.nameBS !== category.nameEN && (
                      <span className="text-muted-foreground text-sm">({category.nameBS})</span>
                    )}
                    {category.isPopular && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">Popular</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedParentCategory && availableChildCategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="child-category">{t('subcategory')} *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => onChange({ category_id: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectSubcategory')} />
              </SelectTrigger>
              <SelectContent>
                {availableChildCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      {category.nameEN}
                      {category.nameBS !== category.nameEN && (
                        <span className="text-muted-foreground text-sm">({category.nameBS})</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  )
}

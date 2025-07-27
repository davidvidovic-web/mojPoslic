'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations, useLocale } from 'next-intl'
import { useCategories } from '@/hooks/use-static-data'

interface CategoriesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
  subcategoryValue?: string
  onSubcategoryChange?: (value: string) => void
  showSubcategories?: boolean
  stackOnMobile?: boolean
}

export function CategoriesFilter({ 
  value, 
  onChange, 
  placeholder, 
  className,
  includeAllOption = true,
  subcategoryValue,
  onSubcategoryChange,
  showSubcategories = false,
  stackOnMobile = false
}: CategoriesFilterProps) {
  const { categories, loading } = useCategories()
  const t = useTranslations('filters')
  const locale = useLocale()
  
  const defaultPlaceholder = placeholder || t('allCategories')

  // Get only main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parent_id)
  
  // Get subcategories based on selected category or all subcategories
  const relevantSubcategories = value && value !== 'all' 
    ? categories.filter(cat => cat.parent_id === value)
    : categories.filter(cat => cat.parent_id) // Get all subcategories when no parent is selected

  // Helper function to get category name based on locale
  const getCategoryName = (category: {
    name_bs?: string
    name_en?: string
    name?: string
  }) => {
    if (locale === 'bs') {
      return category.name_bs || category.name_en || category.name
    } else {
      return category.name_en || category.name_bs || category.name
    }
  }

  return (
    <div className={stackOnMobile ? "flex flex-col gap-4 sm:flex-row" : "flex gap-4"}>
      {/* Main Categories Dropdown */}
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={loading ? t('loadingCategories') : defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all">{t('allCategories')}</SelectItem>
          )}
          
          {Array.isArray(mainCategories) && mainCategories.map((category) => (
            <SelectItem key={category.id} value={category.key}>
              {getCategoryName(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subcategories Dropdown - always show when enabled */}
      {showSubcategories && (
        <Select 
          value={subcategoryValue || "all"} 
          onValueChange={onSubcategoryChange || (() => {})}
          disabled={loading}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={t('allSubcategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSubcategories')}</SelectItem>
            {Array.isArray(relevantSubcategories) && relevantSubcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.key}>
                {getCategoryName(subcategory)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

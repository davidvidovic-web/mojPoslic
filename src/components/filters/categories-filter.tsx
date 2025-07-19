'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations, useLocale } from 'next-intl'
import { useCategories } from '@/hooks/use-data'

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
  const { categories, isLoading, getCategoriesByParent } = useCategories()
  const t = useTranslations('filters')
  const locale = useLocale()
  
  const defaultPlaceholder = placeholder || t('allCategories')

  // Get only main categories (no parent)
  const mainCategories = getCategoriesByParent(undefined)
  
  // Get ALL subcategories from all main categories
  const allSubcategories = Array.isArray(categories) 
    ? categories.filter(cat => cat.parent_id) 
    : []

  // Helper function to get category name based on locale
  const getCategoryName = (category: {
    nameBS?: string
    name_bs?: string
    nameEN?: string
    name_en?: string
    name?: string
  }) => {
    if (locale === 'bs') {
      return category.nameBS || category.name_bs || category.nameEN || category.name_en || category.name
    } else {
      return category.nameEN || category.name_en || category.nameBS || category.name_bs || category.name
    }
  }

  return (
    <div className={stackOnMobile ? "flex flex-col gap-4 sm:flex-row" : "flex gap-4"}>
      {/* Main Categories Dropdown */}
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={isLoading ? t('loadingCategories') : defaultPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all">{t('allCategories')}</SelectItem>
          )}
          
          {Array.isArray(mainCategories) && mainCategories.map((category) => (
            <SelectItem key={category.id} value={category.key}>
              <span className="flex items-center gap-2">
                {getCategoryName(category)}
                {category.is_popular && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">{t('popular')}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subcategories Dropdown - always show when enabled */}
      {showSubcategories && (
        <Select 
          value={subcategoryValue || "all"} 
          onValueChange={onSubcategoryChange || (() => {})}
          disabled={isLoading}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={t('allSubcategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSubcategories')}</SelectItem>
            {Array.isArray(allSubcategories) && allSubcategories.map((subcategory) => (
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

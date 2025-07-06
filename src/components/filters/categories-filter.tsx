'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/contexts/data-context'

interface CategoriesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
  subcategoryValue?: string
  onSubcategoryChange?: (value: string) => void
  showSubcategories?: boolean
}

export function CategoriesFilter({ 
  value, 
  onChange, 
  placeholder = "All categories", 
  className,
  includeAllOption = true,
  subcategoryValue,
  onSubcategoryChange,
  showSubcategories = false
}: CategoriesFilterProps) {
  const { categories, loading, getCategoriesByParent } = useCategories()

  // Get only main categories (no parent)
  const mainCategories = getCategoriesByParent(undefined)
  
  // Get subcategories for the selected main category
  const selectedCategory = categories.find(cat => cat.key === value)
  const subcategories = selectedCategory ? getCategoriesByParent(selectedCategory.id) : []

  return (
    <div className="flex gap-4">
      {/* Main Categories Dropdown */}
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all">All categories</SelectItem>
          )}
          
          {mainCategories.map((category) => (
            <SelectItem key={category.id} value={category.key}>
              <span className="flex items-center gap-2">
                {category.name_en}
                {category.name_bs !== category.name_en && (
                  <span className="text-muted-foreground text-sm">({category.name_bs})</span>
                )}
                {category.is_popular && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">Popular</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subcategories Dropdown - only show if main category is selected and has subcategories */}
      {showSubcategories && value !== "all" && subcategories.length > 0 && (
        <Select 
          value={subcategoryValue || "all"} 
          onValueChange={onSubcategoryChange || (() => {})}
          disabled={loading}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder="All subcategories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subcategories</SelectItem>
            {subcategories.map((subcategory) => (
              <SelectItem key={subcategory.id} value={subcategory.key}>
                <span className="flex items-center gap-2">
                  {subcategory.name_en}
                  {subcategory.name_bs !== subcategory.name_en && (
                    <span className="text-muted-foreground text-sm">({subcategory.name_bs})</span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Category {
  id: string
  key: string
  nameBS: string
  nameEN: string
  isPopular?: boolean
  sortOrder: number
  children?: Category[]
}

interface CategoriesFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  includeAllOption?: boolean
}

export function CategoriesFilter({ 
  value, 
  onChange, 
  placeholder = "All categories", 
  className,
  includeAllOption = true
}: CategoriesFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Flatten categories to include both parent and child categories
  const flattenCategories = (cats: Category[]): Category[] => {
    const flattened: Category[] = []
    
    cats.forEach(category => {
      // Add parent category
      flattened.push(category)
      
      // Add child categories with indentation indicator
      if (category.children) {
        category.children.forEach(child => {
          flattened.push({
            ...child,
            nameEN: `  • ${child.nameEN}`,
            nameBS: `  • ${child.nameBS}`
          })
        })
      }
    })
    
    return flattened
  }

  const flatCategories = flattenCategories(categories)

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading categories..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">All categories</SelectItem>
        )}
        
        {flatCategories.map((category) => (
          <SelectItem key={category.id} value={category.key}>
            <span className="flex items-center gap-2">
              {category.nameEN}
              {category.nameBS !== category.nameEN && (
                <span className="text-muted-foreground text-sm">({category.nameBS})</span>
              )}
              {category.isPopular && !category.nameEN.startsWith('  •') && (
                <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">Popular</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

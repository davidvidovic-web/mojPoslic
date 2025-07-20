'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/static-data-types'
import { useTranslations, useLocale } from 'next-intl'
import { useStaticCategories } from '@/hooks/use-static-data'

interface SkillsBubbleInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  maxSkills?: number
  className?: string
  label?: string
}

export function SkillsBubbleInput({
  value = [],
  onChange,
  placeholder = "Add skills...",
  maxSkills = 10,
  className,
  label
}: SkillsBubbleInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('skills.ui')
  const locale = useLocale()
  
  // Use static categories instead of API
  const { data: categoriesData } = useStaticCategories()
  
  // Flatten categories for easier processing (static data manager now provides correct structure)
  const categories = useMemo(() => {
    if (!categoriesData) return []
    
    const flatCategories: Category[] = []
    
    categoriesData.forEach(category => {
      // Add parent category
      flatCategories.push(category)
      
      // Add children if they exist (processed by static data manager)
      if (category.children && Array.isArray(category.children)) {
        category.children.forEach(subcategory => {
          flatCategories.push({
            ...subcategory,
            is_popular: false        // Subcategories are not popular by default
          })
        })
      }
    })
    
    return flatCategories
  }, [categoriesData])

  // Helper function to get category name in current locale
  const getCategoryName = useCallback((category: Category) => {
    return locale === 'bs' ? category.name_bs : category.name_en
  }, [locale])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter suggestions based on input and selected skills
  useEffect(() => {
    // Helper function to get all subcategories for selected parent categories
    const getAllSubcategories = () => {
      const subcategorySuggestions: string[] = []
      const selectedParentIds = new Set<string>()

      // Find parent categories that are currently selected
      value.forEach(selectedSkill => {
        const parentCategory = categories.find(cat => 
          !cat.parent_id && (getCategoryName(cat) === selectedSkill || cat.name_en === selectedSkill || cat.name_bs === selectedSkill)
        )
        if (parentCategory) {
          selectedParentIds.add(parentCategory.id)
        }
      })

      // Get all subcategories from selected parents (cumulative)
      selectedParentIds.forEach(parentId => {
        const subcategories = categories.filter(cat => 
          cat.parent_id === parentId && 
          getCategoryName(cat) && 
          !value.includes(getCategoryName(cat)!) // Exclude already selected
        )
        subcategories.forEach(sub => {
          const subcategoryName = getCategoryName(sub)!
          if (!subcategorySuggestions.includes(subcategoryName)) {
            subcategorySuggestions.push(subcategoryName)
          }
        })
      })

      return subcategorySuggestions
    }

    const searchTerm = inputValue.toLowerCase()
    const newSuggestions: string[] = []

    // If there's no input, show only subcategories of selected parents
    if (!inputValue.trim()) {
      // Only show subcategories of selected parent categories
      const subcategories = getAllSubcategories()
      newSuggestions.push(...subcategories.slice(0, 6))
      
      setFilteredSuggestions(newSuggestions)
      return
    }

    // If there's input, filter only subcategories that match (no primary categories in suggestions)
    if (inputValue.trim()) {
      // Add matching subcategories only (not parent categories)
      categories.forEach((category: Category) => {
        const categoryName = getCategoryName(category)
        // Only include subcategories (those with parent_id) in search suggestions
        if (categoryName && 
            category.parent_id && // Only subcategories
            categoryName.toLowerCase().includes(searchTerm) && 
            !value.includes(categoryName)) {
          newSuggestions.push(categoryName)
        }
      })

      // Add common tech skills that might not be in categories
      const commonSkills = [
        // Programming Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'C++', 'C#', 'Swift', 'Kotlin', 'Go',
        
        // Frontend Technologies  
        'React', 'Vue.js', 'Angular', 'Next.js', 'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
        
        // Backend Technologies
        'Node.js', 'Express.js', 'Django', 'Spring', 'Laravel', 'Ruby on Rails', '.NET', 'FastAPI',
        
        // Databases
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Firebase',
        
        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'CI/CD',
        
        // Design & UI/UX
        'Photoshop', 'Figma', 'Adobe Illustrator', 'UI/UX Design', 'Sketch', 'Adobe XD', 'Canva',
        
        // Marketing & Business
        'Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Google Analytics', 'Project Management',
        
        // Soft Skills
        'Team Leadership', 'Communication', 'Problem Solving', 'Agile', 'Scrum', 'Time Management'
      ]

      commonSkills.forEach(skill => {
        if (skill.toLowerCase().includes(searchTerm) && 
            !value.includes(skill) && 
            !newSuggestions.includes(skill)) {
          newSuggestions.push(skill)
        }
      })

      setFilteredSuggestions(newSuggestions.slice(0, 10))
    } else {
      setFilteredSuggestions([])
    }
  }, [inputValue, categories, value, getCategoryName, locale])

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !value.includes(trimmedSkill) && value.length < maxSkills) {
      onChange([...value, trimmedSkill])
      setInputValue('')
      // Keep suggestions open to show related categories
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addSkill(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addSkill(suggestion)
  }

  // All parent categories for quick selection
  const allParentCategories = useMemo(() => {
    return categories
      .filter(cat => !cat.parent_id) // All parent categories
      .map(cat => getCategoryName(cat))
      .filter((name): name is string => name !== undefined) // Type guard to filter out undefined
      .slice(0, 8)
  }, [categories, getCategoryName])

  return (
    <div className={cn("space-y-3 relative", className)} ref={containerRef}>
      <Label>{label || t('skillsAndExpertise')}</Label>
      
      {/* Selected Skills Display */}
      <div className="min-h-[60px] p-3 border rounded-md bg-background">
        <div className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-2 pr-1 py-1 text-sm flex items-center gap-1 hover:bg-secondary/80 transition-colors"
            >
              <span>{skill}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                onClick={() => removeSkill(skill)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {/* Input for adding new skills */}
          <div className="flex-1 min-w-[150px]">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={value.length === 0 ? placeholder : t('addMore')}
              className="border-0 shadow-none p-0 h-6 text-sm focus-visible:ring-0"
              disabled={value.length >= maxSkills}
            />
          </div>
        </div>
      </div>

      {/* Subcategories and Related Skills Section - shows when skills are selected and no input */}
      {!inputValue.trim() && value.length > 0 && filteredSuggestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {categories.some(cat => !cat.parent_id && value.includes(getCategoryName(cat) || ''))
              ? t('availableSubcategories')
              : t('relatedSkills')
            }
          </Label>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addSkill(suggestion)}
                disabled={value.includes(suggestion)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Dropdown - only show when typing */}
      {showSuggestions && inputValue.trim() && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-2">
            <div className="max-h-48 overflow-y-auto thin-scrollbar">
              {/* Show filtered suggestions when typing */}
              {filteredSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start h-8 px-2 text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  {suggestion}
                </Button>
              ))}
              
              {/* Add custom skill option */}
              {!filteredSuggestions.includes(inputValue.trim()) && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start h-8 px-2 text-sm font-medium"
                  onClick={() => addSkill(inputValue)}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  {t('addCustom', { skill: inputValue.trim() })}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Categories Quick Add */}
      {allParentCategories.length > 0 && value.length < 10 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('allCategories')}</Label>
          <div className="flex flex-wrap gap-2">
            {allParentCategories.map((category, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addSkill(category)}
                disabled={value.includes(category)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {t('skillsCounter', { count: value.length, max: maxSkills })}
      </p>
    </div>
  )
}

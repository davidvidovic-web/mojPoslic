'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/job'
import { useTranslations, useLocale } from 'next-intl'

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
  maxSkills = 20,
  className,
  label
}: SkillsBubbleInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('skills.ui')
  const locale = useLocale()

  // Helper function to get category name in current locale
  const getCategoryName = useCallback((category: Category) => {
    return locale === 'bs' ? category.name_bs : category.name_en
  }, [locale])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

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
    // Get related categories based on selected skills
    const getRelatedCategories = () => {
      if (!categories || categories.length === 0 || value.length === 0) {
        return []
      }

      const relatedSuggestions: string[] = []
      const selectedCategoryIds = new Set<string>()

      // Find parent categories of selected skills
      value.forEach(skill => {
        const category = categories.find(cat => 
          getCategoryName(cat) === skill || cat.name_en === skill || cat.name_bs === skill
        )
        if (category) {
          if (category.parent_id) {
            selectedCategoryIds.add(category.parent_id)
          } else {
            selectedCategoryIds.add(category.id)
          }
        }
      })

      // Find subcategories of selected parent categories
      selectedCategoryIds.forEach(parentId => {
        const subcategories = categories.filter(cat => 
          cat.parent_id === parentId && 
          getCategoryName(cat) && 
          !value.includes(getCategoryName(cat))
        )
        subcategories.forEach(sub => {
          const categoryName = getCategoryName(sub)
          if (categoryName && !relatedSuggestions.includes(categoryName)) {
            relatedSuggestions.push(categoryName)
          }
        })
      })

      // If no related subcategories found, suggest popular categories
      if (relatedSuggestions.length === 0) {
        const popularUnselected = categories
          .filter(cat => cat.is_popular && getCategoryName(cat) && !value.includes(getCategoryName(cat)))
          .map(cat => getCategoryName(cat)!)
          .slice(0, 6)
        relatedSuggestions.push(...popularUnselected)
      }

      return relatedSuggestions
    }

    const searchTerm = inputValue.toLowerCase()
    const newSuggestions: string[] = []

    // If there's no input, show related categories based on selected skills
    if (!inputValue.trim() && value.length > 0) {
      const relatedSuggestions = getRelatedCategories()
      setFilteredSuggestions(relatedSuggestions.slice(0, 8))
      return
    }

    // If there's input, filter normally
    if (inputValue.trim()) {
      // Add category suggestions
      if (categories && Array.isArray(categories)) {
        categories.forEach((category: Category) => {
          // Add category name if it matches search and isn't already selected
          const categoryName = getCategoryName(category)
          if (categoryName && 
              categoryName.toLowerCase().includes(searchTerm) && 
              !value.includes(categoryName)) {
            newSuggestions.push(categoryName)
          }
        })
      }

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
        'Team Leadership', 'Communication', 'Problem Solving', 'Agile', 'Scrum', 'Time Management',
        
        // Handyman Skills (from categories)
        'Plumbing', 'Electrical Work', 'Carpentry', 'Painting', 'Home Repairs', 'Furniture Assembly',
        'Appliance Repair', 'HVAC', 'Tiling', 'Drywall', 'Flooring', 'Roofing'
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        // Use flatCategories for skills component
        setCategories(data.flatCategories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

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

  // Popular categories for quick selection
  const popularCategories = (categories || [])
    .filter(cat => cat.is_popular)
    .map(cat => getCategoryName(cat))
    .filter(name => name) // Filter out undefined names
    .slice(0, 8)

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

      {/* Related Skills Section - shows when skills are selected and no input */}
      {!inputValue.trim() && value.length > 0 && filteredSuggestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('relatedSkills')}</Label>
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
            <div className="max-h-48 overflow-y-auto">
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

      {/* Popular Skills Quick Add */}
      {popularCategories.length > 0 && value.length < 5 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t('popularCategories')}</Label>
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category, index) => (
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

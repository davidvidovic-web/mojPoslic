'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  key: string
  nameBS: string
  nameEN: string
  isPopular: boolean
  children: {
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
  }[]
}

interface SkillsBubbleInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  maxSkills?: number
  className?: string
}

export function SkillsBubbleInput({
  value = [],
  onChange,
  placeholder = "Add skills...",
  maxSkills = 20,
  className
}: SkillsBubbleInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Filter suggestions based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions([])
      return
    }

    const searchTerm = inputValue.toLowerCase()
    const newSuggestions: string[] = []

    // Add category suggestions
    if (categories && Array.isArray(categories)) {
      categories.forEach((category: Category) => {
        // Add parent category
        if (category.nameEN.toLowerCase().includes(searchTerm) && 
            !value.includes(category.nameEN)) {
          newSuggestions.push(category.nameEN)
        }
        
        // Add child categories
        if (category.children && Array.isArray(category.children)) {
          category.children.forEach((child) => {
            if (child.nameEN.toLowerCase().includes(searchTerm) && 
                !value.includes(child.nameEN)) {
              newSuggestions.push(child.nameEN)
            }
          })
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
  }, [inputValue, categories, value])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
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
      setShowSuggestions(false)
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
    .filter(cat => cat.isPopular)
    .flatMap(cat => [cat.nameEN, ...cat.children.map(child => child.nameEN)])
    .slice(0, 8)

  return (
    <div className={cn("space-y-3", className)} ref={containerRef}>
      <Label>Skills & Expertise</Label>
      
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
          <div className="relative flex-1 min-w-[150px]">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={value.length === 0 ? placeholder : "Add more..."}
              className="border-0 shadow-none p-0 h-6 text-sm focus-visible:ring-0"
              disabled={value.length >= maxSkills}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (filteredSuggestions.length > 0 || inputValue.trim()) && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
                <CardContent className="p-2">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-8 px-2 text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                    
                    {/* Add custom skill option */}
                    {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 px-2 text-sm font-medium"
                        onClick={() => addSkill(inputValue)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add &quot;{inputValue.trim()}&quot;
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Popular Skills Quick Add */}
      {popularCategories.length > 0 && value.length === 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Popular categories:</Label>
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
        {value.length}/{maxSkills} skills • Click suggestions or type and press Enter to add
      </p>
    </div>
  )
}

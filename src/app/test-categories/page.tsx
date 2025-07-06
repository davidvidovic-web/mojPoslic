'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const selectedParent = categories.find(cat => cat.id === selectedParentCategory)
  const availableChildCategories = selectedParent?.children || []

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Categories Page</h1>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">Parent Category</label>
          <Select 
            value={selectedParentCategory} 
            onValueChange={setSelectedParentCategory}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading categories..." : "Select a category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="block truncate">
                    {category.nameEN}
                    {category.nameBS !== category.nameEN && (
                      <span className="text-muted-foreground text-xs ml-1">({category.nameBS})</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {availableChildCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Subcategory (Optional)</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">No specific subcategory</span>
                </SelectItem>
                {availableChildCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="block truncate">
                      {category.nameEN}
                      {category.nameBS !== category.nameEN && (
                        <span className="text-muted-foreground text-xs ml-1">({category.nameBS})</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Categories count: {categories.length}</p>
          <p>Selected parent: {selectedParentCategory}</p>
          <p>Child categories: {availableChildCategories.length}</p>
        </div>
      </div>
    </div>
  )
}

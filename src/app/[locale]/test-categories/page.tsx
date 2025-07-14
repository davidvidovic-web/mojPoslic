'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
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
      <h1 className="text-2xl font-bold mb-6">{t('testCategories.title')}</h1>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">{t('testCategories.parentCategory')}</label>
          <Select 
            value={selectedParentCategory} 
            onValueChange={setSelectedParentCategory}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? t('testCategories.loadingCategories') : t('testCategories.selectCategory')} />
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
            <label className="block text-sm font-medium mb-2">{t('testCategories.subcategory')}</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t('testCategories.selectSubcategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">{t('testCategories.noSpecificSubcategory')}</span>
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

        <div className="mt-6 p-4 bg-muted rounded">
          <h3 className="font-medium mb-2">{t('testCategories.debugInfo')}:</h3>
          <p>{t('testCategories.loading')}: {isLoading ? t('common.yes') : t('common.no')}</p>
          <p>{t('testCategories.categoriesCount')}: {categories.length}</p>
          <p>{t('testCategories.selectedParent')}: {selectedParentCategory}</p>
          <p>{t('testCategories.childCategories')}: {availableChildCategories.length}</p>
        </div>
      </div>
    </div>
  )
}

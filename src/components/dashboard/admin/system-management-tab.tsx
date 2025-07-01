'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { Shield } from 'lucide-react'

interface AdminCategory {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isPopular: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface AdminCity {
  id: string
  key: string
  nameEN: string
  nameBS: string
  isSpecial: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface AdminJobType {
  key: string
  nameEN: string
  nameBS: string
  description: string
  isPopular: boolean
  sortOrder: number
  jobCount: number
}

interface SystemManagementTabProps {
  categories: AdminCategory[]
  cities: AdminCity[]
  jobTypes: AdminJobType[]
}

export function SystemManagementTab({ categories, cities, jobTypes }: SystemManagementTabProps) {
  const [systemActiveTab, setSystemActiveTab] = useState('categories')
  const [categoryPage, setCategoryPage] = useState(1)
  const [cityPage, setCityPage] = useState(1)
  const itemsPerPage = 10

  const paginatedCategories = categories.slice(
    (categoryPage - 1) * itemsPerPage,
    categoryPage * itemsPerPage
  )
  
  const paginatedCities = cities.slice(
    (cityPage - 1) * itemsPerPage,
    cityPage * itemsPerPage
  )

  const totalCategoryPages = Math.ceil(categories.length / itemsPerPage)
  const totalCityPages = Math.ceil(cities.length / itemsPerPage)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={systemActiveTab} onValueChange={setSystemActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
              <TabsTrigger value="types">Job Types</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Category Management</h3>
                  <Button onClick={() => {/* TODO: Add create category modal */}}>
                    Add Category
                  </Button>
                </div>
                <div className="space-y-2">
                  {paginatedCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{category.nameEN}</h4>
                          <span className="text-sm text-muted-foreground">({category.nameBS})</span>
                          {category.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                          {!category.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">Key: {category.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Pagination
                  currentPage={categoryPage}
                  totalPages={totalCategoryPages}
                  onPageChange={setCategoryPage}
                  className="mt-6"
                />
              </div>
            </TabsContent>

            <TabsContent value="cities">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">City Management</h3>
                  <Button onClick={() => {/* TODO: Add create city modal */}}>
                    Add City
                  </Button>
                </div>
                <div className="space-y-2">
                  {paginatedCities.map((city) => (
                    <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{city.nameEN}</h4>
                          <span className="text-sm text-muted-foreground">({city.nameBS})</span>
                          {city.isSpecial && <Badge variant="default" className="text-xs">Special</Badge>}
                          {!city.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">Key: {city.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Pagination
                  currentPage={cityPage}
                  totalPages={totalCityPages}
                  onPageChange={setCityPage}
                  className="mt-6"
                />
              </div>
            </TabsContent>

            <TabsContent value="types">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Job Type Management</h3>
                  <p className="text-sm text-muted-foreground">Job types are predefined enum values and cannot be modified.</p>
                </div>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{type.nameEN}</h4>
                          <span className="text-sm text-muted-foreground">({type.nameBS})</span>
                          {type.isPopular && <Badge variant="default" className="text-xs">Popular</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <p className="text-xs text-muted-foreground">Jobs using this type: {type.jobCount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

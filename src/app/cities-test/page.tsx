'use client'

import { useState } from 'react'
import { CitiesFilter } from '@/components/cities-filter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CitiesTestPage() {
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedCityJobPost, setSelectedCityJobPost] = useState('')

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Cities Filter Test</CardTitle>
          <CardDescription>
            Test the cities dropdown filter component to ensure it displays all available locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job List Filter (with &quot;All locations&quot;):</label>
              <CitiesFilter
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="Choose a location..."
                className="w-full"
                includeAllOption={true}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Post Form (without &quot;All locations&quot;):</label>
              <CitiesFilter
                value={selectedCityJobPost}
                onChange={setSelectedCityJobPost}
                placeholder="Select a city..."
                className="w-full"
                includeAllOption={false}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedCity && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Job List Filter - Selected:</strong> {selectedCity}
                </p>
              </div>
            )}
            
            {selectedCityJobPost && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Job Post Form - Selected:</strong> {selectedCityJobPost}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This component should display:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Remote work option at the top</li>
              <li>Major Bosnian cities (marked as special)</li>
              <li>All other Bosnian cities in alphabetical order</li>
              <li>Both English and Bosnian names where different</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

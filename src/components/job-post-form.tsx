'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CitiesFilter } from "@/components/cities-filter"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { LocationPicker } from "@/components/ui/location-picker"
import { CreateJobData } from "@/types/job"
import { useAuth } from "@/contexts/prisma-auth-context"
import { toast } from "sonner"

// Common Bosnia city coordinates for map centering
const CITY_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'sarajevo': { lat: 43.8563, lng: 18.4131, name: 'Sarajevo' },
  'banja-luka': { lat: 44.7666, lng: 17.1831, name: 'Banja Luka' },
  'tuzla': { lat: 44.5386, lng: 18.6708, name: 'Tuzla' },
  'zenica': { lat: 44.2031, lng: 17.9061, name: 'Zenica' },
  'mostar': { lat: 43.3438, lng: 17.8078, name: 'Mostar' },
  'bijeljina': { lat: 44.7594, lng: 19.2144, name: 'Bijeljina' },
  'brčko': { lat: 44.8694, lng: 18.8108, name: 'Brčko' },
  'doboj': { lat: 44.7328, lng: 18.0869, name: 'Doboj' },
  'cazin': { lat: 44.9669, lng: 15.9431, name: 'Cazin' },
  'livno': { lat: 43.8269, lng: 17.0050, name: 'Livno' },
  'trebinje': { lat: 42.7125, lng: 18.3428, name: 'Trebinje' },
  'goražde': { lat: 43.6683, lng: 18.9758, name: 'Goražde' },
  'prijedor': { lat: 44.9778, lng: 16.7144, name: 'Prijedor' },
  'bihać': { lat: 44.8167, lng: 15.8700, name: 'Bihać' },
  'velika-kladuša': { lat: 45.1847, lng: 15.8058, name: 'Velika Kladuša' },
  'bosanska-krupa': { lat: 44.8833, lng: 16.1547, name: 'Bosanska Krupa' },
  'buzim': { lat: 45.0333, lng: 15.8667, name: 'Buzim' },
  'visoko': { lat: 43.9897, lng: 18.1819, name: 'Visoko' },
  'kakanj': { lat: 44.1319, lng: 18.1211, name: 'Kakanj' },
  'vareš': { lat: 44.1667, lng: 18.3167, name: 'Vareš' },
  'žepče': { lat: 44.4269, lng: 18.0381, name: 'Žepče' },
  'maglaj': { lat: 44.5467, lng: 18.0933, name: 'Maglaj' },
  'zavidovići': { lat: 44.4456, lng: 18.1497, name: 'Zavidovići' },
  'travnik': { lat: 44.2289, lng: 17.6658, name: 'Travnik' },
  'vitez': { lat: 44.1467, lng: 17.7631, name: 'Vitez' },
  'busovača': { lat: 44.0978, lng: 17.8764, name: 'Busovača' },
  'novi-travnik': { lat: 44.1700, lng: 17.6617, name: 'Novi Travnik' },
  'kiseljak': { lat: 43.9436, lng: 18.0789, name: 'Kiseljak' },
  'fojnica': { lat: 43.9581, lng: 17.9019, name: 'Fojnica' },
  'čapljina': { lat: 43.1161, lng: 17.7186, name: 'Čapljina' },
  'stolac': { lat: 43.0833, lng: 17.9667, name: 'Stolac' },
  'neum': { lat: 42.9225, lng: 17.6161, name: 'Neum' },
  'konjic': { lat: 43.6517, lng: 17.9611, name: 'Konjic' },
  'jablanica': { lat: 43.6597, lng: 17.7653, name: 'Jablanica' },
  'široki-brijeg': { lat: 43.3850, lng: 17.5944, name: 'Široki Brijeg' },
  'posušje': { lat: 43.4739, lng: 17.3414, name: 'Posušje' },
  'grude': { lat: 43.3689, lng: 17.3917, name: 'Grude' },
  'ljubuški': { lat: 43.2006, lng: 17.5450, name: 'Ljubuški' },
  'čitluk': { lat: 43.2281, lng: 17.7011, name: 'Čitluk' },
  'tomislavgrad': { lat: 43.7283, lng: 17.2258, name: 'Tomislavgrad' },
  'glamoč': { lat: 44.0467, lng: 16.8500, name: 'Glamoč' },
  'drvar': { lat: 44.3739, lng: 16.3781, name: 'Drvar' },
  'zvornik': { lat: 44.3856, lng: 19.1017, name: 'Zvornik' },
  'vlasenica': { lat: 44.1833, lng: 18.9333, name: 'Vlasenica' },
  'bratunac': { lat: 44.1167, lng: 19.3167, name: 'Bratunac' },
  'srebrenica': { lat: 44.1069, lng: 19.2969, name: 'Srebrenica' },
  'rogatica': { lat: 43.7967, lng: 19.0097, name: 'Rogatica' },
  'višegrad': { lat: 43.7825, lng: 19.2911, name: 'Višegrad' },
  'foča': { lat: 43.5114, lng: 18.7786, name: 'Foča' },
  'gacko': { lat: 43.1697, lng: 18.5336, name: 'Gacko' },
  'nevesinje': { lat: 43.2583, lng: 18.1133, name: 'Nevesinje' },
  'istočno-sarajevo': { lat: 43.8061, lng: 18.3403, name: 'Istočno Sarajevo' },
  'sokolac': { lat: 43.9383, lng: 18.8000, name: 'Sokolac' }
}

interface JobPostFormProps {
  onJobPosted?: () => void
}

export function JobPostForm({ onJobPosted }: JobPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cities, setCities] = useState<Array<{ id: number; key: string; nameEN: string; nameBS: string }>>([])
  const [categories, setCategories] = useState<Array<{
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
    sortOrder: number
    children: Array<{
      id: string
      key: string
      nameBS: string
      nameEN: string
      isPopular: boolean
      sortOrder: number
    }>
  }>>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('')
  const [availableChildCategories, setAvailableChildCategories] = useState<Array<{
    id: string
    key: string
    nameBS: string
    nameEN: string
    isPopular: boolean
    sortOrder: number
  }>>([])
  const { user } = useAuth()
  const [includeStartTime, setIncludeStartTime] = useState(false)
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    type: 'quick_job',
    city_id: '',
    category_id: '',
    salary: '',
    salaryType: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    website: '',
    email: '',
    contact_email: '',
    application_url: '',
    start_date: undefined,
    job_address: undefined,
    job_latitude: undefined,
    job_longitude: undefined
  })

  // Load cities for coordinate mapping
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('/api/cities')
        const data = await response.json()
        setCities(data.cities || [])
      } catch (error) {
        console.error('Error loading cities:', error)
      }
    }
    loadCities()
  }, [])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data || [])
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Update available child categories when parent category changes
  useEffect(() => {
    if (selectedParentCategory) {
      const parentCategory = categories.find(cat => cat.id === selectedParentCategory)
      setAvailableChildCategories(parentCategory?.children || [])
      // Reset child category selection when parent changes
      setFormData(prev => ({ ...prev, category_id: '' }))
    } else {
      setAvailableChildCategories([])
    }
  }, [selectedParentCategory, categories])

  // Get city coordinates for map centering
  const getSelectedCityCoordinates = () => {
    if (!formData.city_id) return null
    
    // First check if we have predefined coordinates
    const cityKey = formData.city_id
    const predefinedCoords = CITY_COORDINATES[cityKey]
    if (predefinedCoords) {
      console.log(`Found coordinates for ${cityKey}:`, predefinedCoords)
      return predefinedCoords
    }
    
    // If not found in predefined coordinates, try to find from loaded cities
    const selectedCity = cities.find(city => city.key === cityKey)
    if (selectedCity) {
      console.log(`City ${cityKey} not in coordinates mapping, using fallback for:`, selectedCity.nameEN)
      // For cities not in our static mapping, provide approximate coordinates
      return {
        lat: 43.8563, // Default to Sarajevo area
        lng: 18.4131,
        name: selectedCity.nameEN
      }
    }
    
    console.log(`No coordinates found for city key: ${cityKey}`)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to post a job')
      return
    }

    if (!formData.title || !formData.description || !formData.city_id) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.category_id) {
      toast.error('Please select a category and subcategory')
      return
    }

    // Ensure we have an email (either from form or user)
    const contactEmail = formData.email || user.email
    if (!contactEmail) {
      toast.error('A contact email is required to post a job')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          city_id: formData.city_id,
          category_id: formData.category_id || null,
          salary: formData.salary || null,
          salaryType: formData.salaryType || null,
          salaryMin: formData.salaryMin || null,
          salaryMax: formData.salaryMax || null,
          website: formData.website || null,
          email: formData.email || user.email, // Use form email or fallback to user email
          start_date: formData.start_date || null,
          job_address: formData.job_address || null,
          job_latitude: formData.job_latitude || null,
          job_longitude: formData.job_longitude || null,
          requirements: formData.requirements || null,
          benefits: formData.benefits || null,
          contact_email: formData.contact_email || formData.email || user.email,
          application_url: formData.application_url || formData.website || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post job')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to post job')
      }

      toast.success('Job posted successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        benefits: '',
        type: 'quick_job',
        city_id: '',
        category_id: '',
        salary: '',
        salaryType: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        website: '',
        email: '',
        contact_email: '',
        application_url: '',
        start_date: undefined,
        job_address: undefined,
        job_latitude: undefined,
        job_longitude: undefined
      })
      setSelectedParentCategory('')
      setAvailableChildCategories([])
      
      onJobPosted?.()
    } catch (error: unknown) {
      console.error('Error posting job:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to post job'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title *</Label>
          <Input
            id="job-title"
            placeholder="Enter job title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <CitiesFilter
              value={formData.city_id || ""}
              onChange={(value) => setFormData({ ...formData, city_id: value })}
              placeholder="Select a city"
              className="w-full"
              includeAllOption={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent-category">Category *</Label>
            <Select 
              value={selectedParentCategory} 
              onValueChange={(value) => {
                setSelectedParentCategory(value)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      {category.nameEN}
                      {category.nameBS !== category.nameEN && (
                        <span className="text-muted-foreground text-sm">({category.nameBS})</span>
                      )}
                      {category.isPopular && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">Popular</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedParentCategory && availableChildCategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="child-category">Subcategory *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {availableChildCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        {category.nameEN}
                        {category.nameBS !== category.nameEN && (
                          <span className="text-muted-foreground text-sm">({category.nameBS})</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Job Location Address (Optional)</Label>
          <LocationPicker
            key={formData.city_id} // Force re-render when city changes
            value={formData.job_address ? {
              address: formData.job_address,
              latitude: formData.job_latitude || 0,
              longitude: formData.job_longitude || 0
            } : undefined}
            onChange={(location) => setFormData({
              ...formData,
              job_address: location.address,
              job_latitude: location.latitude,
              job_longitude: location.longitude
            })}
            placeholder="Enter the specific job location address"
            selectedCityCoordinates={getSelectedCityCoordinates()}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Add a specific address for this job (in addition to the city selection above). The map will center on your selected city.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-type">Job Type *</Label>
          <Select 
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as 'quick_job' | 'full_time' | 'part_time' | 'remote' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quick_job">Quick Job</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date (Optional)</Label>
          
          {/* Checkbox to control time inclusion */}
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="include-time"
              checked={includeStartTime}
              onCheckedChange={(checked: boolean) => setIncludeStartTime(checked)}
            />
            <Label 
              htmlFor="include-time" 
              className="text-sm font-normal cursor-pointer"
            >
              Include specific time
            </Label>
          </div>

          <DateTimePicker
            value={formData.start_date ? new Date(formData.start_date) : undefined}
            onChange={(date) => {
              // Validate that the date is not in the past
              if (date && date < new Date()) {
                toast.error('Start date cannot be in the past')
                return
              }
              
              // If time is not included, set to beginning of day
              if (date && !includeStartTime) {
                const dateOnly = new Date(date)
                dateOnly.setHours(0, 0, 0, 0)
                setFormData({ 
                  ...formData, 
                  start_date: dateOnly.toISOString() 
                })
              } else {
                setFormData({ 
                  ...formData, 
                  start_date: date ? date.toISOString() : undefined 
                })
              }
            }}
            placeholder={includeStartTime ? "When should this work start?" : "Pick a start date"}
            className="w-full"
            showTime={includeStartTime}
          />
          <p className="text-sm text-muted-foreground">
            {includeStartTime 
              ? "Specify when this job or project should begin with exact time (cannot be in the past)"
              : "Specify the date when this job or project should begin"
            }
          </p>
        </div>

        <div className="space-y-4">
          <Label>Salary Information (Optional)</Label>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="salary-type">Salary Type</Label>
              <Select 
                value={formData.salaryType || ''}
                onValueChange={(value) => setFormData({ ...formData, salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="daily">Daily Rate (Dnevnica)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.salaryType && (
              <div className="space-y-4">
                {formData.salaryType === 'fixed' ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="salary-fixed">Fixed Price (BAM)</Label>
                      <Input
                        id="salary-fixed"
                        type="number"
                        placeholder="e.g., 1500"
                        value={formData.salaryMin || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                          salaryMax: undefined // Clear max for fixed price
                        })}
                      />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">or</div>
                    <div className="space-y-2">
                      <Label>Price Range (BAM)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Min price"
                          value={formData.salaryMin || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            salaryMin: e.target.value ? parseInt(e.target.value) : undefined
                          })}
                        />
                        <Input
                          type="number"
                          placeholder="Max price"
                          value={formData.salaryMax || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            salaryMax: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary-min">
                        Minimum {formData.salaryType === 'hourly' ? 'Rate' : formData.salaryType === 'daily' ? 'Daily Rate' : 'Salary'} (BAM)
                      </Label>
                      <Input
                        id="salary-min"
                        type="number"
                        placeholder={
                          formData.salaryType === 'hourly' ? 'e.g., 15' : 
                          formData.salaryType === 'daily' ? 'e.g., 120' : 
                          'e.g., 2000'
                        }
                        value={formData.salaryMin || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          salaryMin: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary-max">
                        Maximum {formData.salaryType === 'hourly' ? 'Rate' : formData.salaryType === 'daily' ? 'Daily Rate' : 'Salary'} (BAM)
                      </Label>
                      <Input
                        id="salary-max"
                        type="number"
                        placeholder={
                          formData.salaryType === 'hourly' ? 'e.g., 25' : 
                          formData.salaryType === 'daily' ? 'e.g., 200' : 
                          'e.g., 3000'
                        }
                        value={formData.salaryMax || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          salaryMax: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="salary">Alternative Salary Description</Label>
              <Input
                id="salary"
                placeholder="e.g., Competitive salary, To be discussed, etc."
                value={formData.salary || ''}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use this field if you prefer text description instead of specific amounts
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements (Optional)</Label>
          <Textarea
            id="requirements"
            placeholder="List the skills, experience, and qualifications needed..."
            rows={3}
            value={formData.requirements || ''}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="benefits">Benefits (Optional)</Label>
          <Textarea
            id="benefits"
            placeholder="Describe benefits, perks, and what makes this opportunity special..."
            rows={3}
            value={formData.benefits || ''}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Company Website (Optional)</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email (Optional)</Label>
            <Input
              id="email"
              placeholder="jobs@company.com"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Alternative Contact Email (Optional)</Label>
            <Input
              id="contact-email"
              placeholder="hr@company.com"
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="application-url">Application Portal URL (Optional)</Label>
            <Input
              id="application-url"
              placeholder="https://company.com/apply"
              type="url"
              value={formData.application_url || ''}
              onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Posting Job..." : "Post Job"}
        </Button>
      </form>
    </div>
  )
}

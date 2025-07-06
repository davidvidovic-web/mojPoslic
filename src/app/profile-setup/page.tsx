'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const jobTypes = [
  { value: 'quick_job', label: 'Quick Job' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'remote', label: 'Remote' },
]

export default function ProfileSetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Initialize form data - will be updated when user is available
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    username: '',
    bio: '',
    skills: '',
    experience: '',
    preferredJobTypes: '',
    phone: '',
    website: '',
    location: '',
    companyName: '',
    position: '',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user && user.profileSetupCompleted) {
      router.push('/dashboard')
      return
    }

    // Update name field if user name is available and form name is empty
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name || '' }))
    }
  }, [user, loading, router, formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile setup completed!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              {user.role === 'tasker' && 'Build your professional profile to attract clients'}
              {user.role === 'client' && 'Set up your profile to start posting jobs and hiring'}
              {user.role === 'company' && 'Create your company profile to find talent'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Professional Information - Role-specific fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {user.role === 'tasker' && 'Professional Skills'}
                  {user.role === 'client' && 'Job Posting Preferences'}
                  {user.role === 'company' && 'Company Information'}
                </h3>
                
                {user.role === 'tasker' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Textarea
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => handleInputChange('skills', e.target.value)}
                        placeholder="List your skills (e.g., Web Development, Graphic Design, Writing...)"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Describe your work experience..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredJobTypes">Preferred Job Types</Label>
                      <Select
                        value={formData.preferredJobTypes}
                        onValueChange={(value) => handleInputChange('preferredJobTypes', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred job types" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {user.role === 'client' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="preferredJobTypes">Typical Budget Range for Jobs</Label>
                      <Select
                        value={formData.preferredJobTypes}
                        onValueChange={(value) => handleInputChange('preferredJobTypes', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your typical budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small jobs (under 100 BAM)</SelectItem>
                          <SelectItem value="medium">Medium jobs (100-500 BAM)</SelectItem>
                          <SelectItem value="large">Large jobs (500-1000 BAM)</SelectItem>
                          <SelectItem value="premium">Premium jobs (1000+ BAM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Preferred Job Categories (Optional)</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="What types of jobs do you typically post? (e.g., cleaning, delivery, handyman, tutoring, design...)"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {user.role === 'company' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Your company name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Your Position</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Your job title (e.g., HR Manager, CEO)"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience">Company Description</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Describe your company, industry, and typical hiring needs..."
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Portfolio</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Your website or portfolio"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Your location (city, country)"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

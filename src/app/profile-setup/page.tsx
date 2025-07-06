'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'
import { CitiesFilter } from '@/components/filters/cities-filter'
import { Badge } from '@/components/ui/badge'
import { X, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface SkillExperience {
  skill: string
  experienceLevel: 'not-specified' | 'beginner' | '1-2-years' | '3-5-years' | '5plus-years'
  experienceYears?: string
}

export default function ProfileSetupPage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    username: '',
    phone: '',
    location: '',
    skills: [] as string[],
    skillExperiences: [] as SkillExperience[],
    website: '',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const redirectAttempted = useRef(false)

  // Check if we've recently redirected (within last 5 seconds)
  const checkRecentRedirect = () => {
    const lastRedirect = localStorage.getItem('lastRedirectTime')
    if (lastRedirect) {
      const timeDiff = Date.now() - parseInt(lastRedirect)
      return timeDiff < 5000 // 5 seconds
    }
    return false
  }

  useEffect(() => {
    // Prevent multiple redirect attempts, during loading, or if recently redirected
    if (redirectAttempted.current || isRedirecting || loading || checkRecentRedirect()) return 
    
    if (!user) {
      redirectAttempted.current = true
      setIsRedirecting(true)
      localStorage.setItem('lastRedirectTime', Date.now().toString())
      router.replace('/auth/signin')
      return
    }

    if (user && user.profileSetupCompleted === true) {
      redirectAttempted.current = true
      setIsRedirecting(true)
      localStorage.setItem('lastRedirectTime', Date.now().toString())
      router.replace('/dashboard')
      return
    }

    // Don't auto-populate name from user data - let tasker enter their own name
  }, [user, loading, router, isRedirecting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Auto-generate username if not provided
    const finalUsername = formData.username || generateUsernameFromName(formData.name)

    setIsSubmitting(true)

    try {
      // Check if username already exists (only if user provided a custom username)
      if (formData.username) {
        const usernameCheckResponse = await fetch(`/api/user/check-username?username=${encodeURIComponent(formData.username)}`)
        if (usernameCheckResponse.ok) {
          const { exists } = await usernameCheckResponse.json()
          if (exists) {
            toast.error('Username already exists. Please choose a different one.')
            setIsSubmitting(false)
            return
          }
        }
      }

      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          username: finalUsername,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Refresh user context to get updated profileSetupCompleted status
      await refreshUser()
      
      toast.success('Profile setup completed!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateUsernameFromName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) + Math.floor(Math.random() * 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSkillsChange = (newSkills: string[]) => {
    setFormData(prev => {
      // Update skill experiences when skills change
      const currentSkillExperiences = prev.skillExperiences
      const newSkillExperiences = newSkills.map(skill => {
        const existing = currentSkillExperiences.find((exp: SkillExperience) => exp.skill === skill)
        return existing || { skill, experienceLevel: 'not-specified' as const }
      })
      
      return {
        ...prev,
        skills: newSkills,
        skillExperiences: newSkillExperiences
      }
    })
  }

  const updateSkillExperience = (skillIndex: number, field: keyof SkillExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      skillExperiences: prev.skillExperiences.map((exp, index) =>
        index === skillIndex ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeSkillExperience = (skillIndex: number) => {
    const skillToRemove = formData.skillExperiences[skillIndex].skill
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
      skillExperiences: prev.skillExperiences.filter((_, index) => index !== skillIndex)
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

  // Get role-specific content
  const getRoleContent = () => {
    switch (user.role) {
      case 'client':
        return {
          title: 'Complete Your Client Profile',
          description: 'Set up your profile to easily post jobs and connect with taskers'
        }
      case 'company':
        return {
          title: 'Complete Your Company Profile',
          description: 'Build your company profile to attract top talent and manage projects'
        }
      case 'tasker':
        return {
          title: 'Complete Your Tasker Profile',
          description: 'Build your professional profile to attract clients and showcase your skills'
        }
      case 'admin':
        return {
          title: 'Complete Your Admin Profile',
          description: 'Set up your administrator profile'
        }
      default:
        return {
          title: 'Complete Your Profile',
          description: 'Set up your profile to get started'
        }
    }
  }

  const roleContent = getRoleContent()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{roleContent.title}</CardTitle>
            <CardDescription>
              {roleContent.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information - Show for all roles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {user.role === 'company' ? 'Company Name' : 'Full Name'} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={user.role === 'company' ? 'Your company name' : 'Your full name'}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Choose a username (we'll create one if left empty)"
                  />
                  {!formData.username && (
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll automatically create: {generateUsernameFromName(formData.name || 'user')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Your phone number"
                    required
                  />
                </div>
              </div>

              {/* Location - Show for all roles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="space-y-2">
                  <Label>Your City *</Label>
                  <CitiesFilter
                    value={formData.location}
                    onChange={(value) => handleInputChange('location', value)}
                    placeholder="Select your city"
                    className="w-full"
                    includeAllOption={false}
                  />
                </div>
              </div>

              {/* Professional Skills - Only show for taskers */}
              {user.role === 'tasker' && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Professional Skills</h3>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <span>You can add this later in settings, but we highly recommend completing it now for a better success rate</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Your Skills</Label>
                      <SkillsBubbleInput
                        value={formData.skills}
                        onChange={handleSkillsChange}
                        placeholder="Add your skills (e.g., Plumbing, Web Design, Tutoring...)"
                      />
                      <p className="text-sm text-muted-foreground">
                        Choose from existing categories or add your own custom skills
                      </p>
                    </div>
                  </div>

                  {/* Experience Levels - Only show for taskers */}
                  {formData.skillExperiences.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Experience Levels</h3>
                      <p className="text-sm text-muted-foreground">
                        Set your experience level for each skill to help clients understand your expertise
                      </p>
                      
                      <div className="space-y-3">
                        {formData.skillExperiences.map((skillExp, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Badge variant="secondary" className="shrink-0">
                              {skillExp.skill}
                            </Badge>
                            
                            <Select
                              value={skillExp.experienceLevel}
                              onValueChange={(value) => updateSkillExperience(index, 'experienceLevel', value)}
                            >
                              <SelectTrigger className="flex-1 truncate">
                                <SelectValue className="truncate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-specified">Not Specified</SelectItem>
                                <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                                <SelectItem value="1-2-years">1-2 Years</SelectItem>
                                <SelectItem value="3-5-years">3-5 Years</SelectItem>
                                <SelectItem value="5plus-years">5+ Years</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkillExperience(index)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Website/Portfolio - Show for taskers and companies */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Portfolio</h3>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website or Portfolio URL</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com or https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Website/Company URL - Show for companies only */}
              {user.role === 'company' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !formData.name || !formData.phone || formData.location === 'all'}
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

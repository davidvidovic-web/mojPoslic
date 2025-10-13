'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'
import { CitiesFilter } from '@/components/filters/cities-filter'
import { PhoneInput } from '@/components/ui/phone-input'
import { Badge } from '@/components/ui/badge'
import { X, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface SkillExperience {
  skill: string
  experienceLevel: 'not-specified' | 'beginner' | '1-2-years' | '3-5-years' | '5plus-years'
  experienceYears?: string
}

export default function ProfileSetupPage() {
  const t = useTranslations('profile')
  const tErrors = useTranslations('errors')
  const tAuth = useTranslations('auth')
  const { user, loading, refreshUser } = useSupabaseAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState(() => ({
    name: '',
    username: '',
    phone: '',
    location: '',
    skills: [] as string[],
    skillExperiences: [] as SkillExperience[],
    bio: '',
    website: '',
  }))
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user just verified email
  const isVerified = searchParams.get('verified') === 'true'

  // Refresh user context if just verified
  useEffect(() => {
    if (isVerified && !loading) {
      console.log('User just verified, refreshing auth context...')
      refreshUser()
    }
  }, [isVerified, loading, refreshUser])

  // Populate form with existing user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        // Don't auto-populate other fields - let user enter them fresh
      }))
    }
  }, [user])

  // Handle redirects after hooks
  useEffect(() => {
    if (loading) return

    // If just verified, give more time for auth context to refresh
    if (isVerified && !user) {
      console.log('Just verified but no user yet, waiting...')
      return
    }

    // Redirect to signin if not authenticated (but not immediately after verification)
    if (!user && !isVerified) {
      router.push('/auth/signin')
      return
    }

    // Redirect if already completed profile setup
    if (user && user.profileSetupCompleted) {
      router.push('/dashboard')
      return
    }

    // Redirect if no role selected yet
    if (user && !user.role) {
      router.push('/role-selection')
      return
    }
  }, [user, loading, router, isVerified])

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('setup.loading')}</p>
        </div>
      </div>
    )
  }

  // Return null while redirecting (but not if just verified and waiting for auth refresh)
  if ((!user && !isVerified) || (user && user.profileSetupCompleted) || (user && !user.role)) {
    return null
  }

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
            toast.error(tErrors('validation.usernameExists'))
            setIsSubmitting(false)
            return
          }
        }
      }

      // Get session for auth header
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error(tAuth('pleaseSignInAgain'))
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          username: finalUsername,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Show success message immediately
      toast.success(t('setup.errors.profileSetupCompleted'))
      
      // Refresh user context to get updated profileSetupCompleted status
      await refreshUser()
      
      // Wait for state to sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(tErrors('failedToUpdate.profile'))
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
          <p className="text-muted-foreground">{t('setup.loading')}</p>
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
          title: t('setup.titles.client'),
          description: t('setup.descriptions.client')
        }
      case 'company':
        return {
          title: t('setup.titles.company'),
          description: t('setup.descriptions.company')
        }
      case 'tasker':
        return {
          title: t('setup.titles.tasker'),
          description: t('setup.descriptions.tasker')
        }
      case 'admin':
        return {
          title: t('setup.titles.admin'),
          description: t('setup.descriptions.admin')
        }
      case null:
      case undefined:
        return {
          title: t('setup.titles.default'),
          description: t('setup.descriptions.default')
        }
      default:
        return {
          title: t('setup.titles.default'),
          description: t('setup.descriptions.default')
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
                  <h3 className="text-lg font-semibold">{t('setup.sections.basicInformation')}</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {user.role === 'company' ? t('setup.fields.companyName') : t('setup.fields.fullName')} *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={user.role === 'company' ? t('setup.placeholders.companyName') : t('setup.placeholders.fullName')}
                      required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('setup.fields.phoneNumber')} *</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder={t('setup.placeholders.phoneNumber')}
                    required
                  />
                </div>
              </div>

              {/* Location - Show for all roles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('setup.sections.location')}</h3>
                <div className="space-y-2">
                  <Label>{t('setup.fields.yourCity')} *</Label>
                  <CitiesFilter
                    value={formData.location}
                    onChange={(value) => handleInputChange('location', value)}
                    placeholder={t('setup.placeholders.selectYourCity')}
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
                      <h3 className="text-lg font-semibold">{t('setup.sections.professionalSkills')}</h3>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <span>{t('setup.helpText.skillsRecommendation')}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('setup.fields.yourSkills')}</Label>
                      <SkillsBubbleInput
                        value={formData.skills}
                        onChange={handleSkillsChange}
                        placeholder={t('setup.placeholders.addSkills')}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('setup.helpText.skillsDescription')}
                      </p>
                    </div>
                  </div>

                  {/* Experience Levels - Only show for taskers */}
                  {formData.skillExperiences.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t('setup.sections.experienceLevels')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('setup.helpText.experienceDescription')}
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
                                <SelectItem value="not-specified">{t('setup.experienceLevels.notSpecified')}</SelectItem>
                                <SelectItem value="beginner">{t('setup.experienceLevels.beginner')}</SelectItem>
                                <SelectItem value="1-2-years">{t('setup.experienceLevels.oneToTwoYears')}</SelectItem>
                                <SelectItem value="3-5-years">{t('setup.experienceLevels.threeToFiveYears')}</SelectItem>
                                <SelectItem value="5plus-years">{t('setup.experienceLevels.fivePlusYears')}</SelectItem>
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

                </>
              )}

              {/* Username - Show for all roles at the end */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('setup.sections.additional')}</h3>
                
                {/* Website/Portfolio - Show for taskers and companies */}
                {(user.role === 'tasker' || user.role === 'company') && (
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      {user.role === 'company' ? t('setup.fields.companyWebsite') : t('setup.fields.websitePortfolio')}
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder={user.role === 'company' ? t('setup.placeholders.companyWebsite') : t('setup.placeholders.websitePortfolio')}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">{t('setup.fields.username')} ({t('setup.fields.optional')})</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder={t('setup.placeholders.chooseUsername')}
                  />
                  {!formData.username && (
                    <p className="text-sm text-muted-foreground">
                      {t('autoGenerateUsername')}: {generateUsernameFromName(formData.name || 'user')}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !formData.name || !formData.phone || formData.location === 'all'}
              >
                {isSubmitting ? t('setup.saving') : t('setup.completeSetup')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

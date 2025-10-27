'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { User } from 'lucide-react'
import { toast } from 'sonner'
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { parseSkillsArray, parseExperienceLevels } from '@/lib/profile-format'
import { formatLocation } from '@/lib/location-format'
import { useTranslations } from 'next-intl'

interface UserProfile {
  name: string
  email: string
  username?: string
  bio?: string
  role: string
  phone?: string
  location?: string
  website?: string
  skills?: string[]
  experience?: string
  experienceLevels?: { [skill: string]: string }
  preferredJobTypes?: string[]
  createdAt?: string
}

export function ProfileSettingsCard() {
  const { user: authProfile, loading: authLoading, refreshUser } = useSupabaseAuth()
  const t = useTranslations('settings.profileSettings')
  const tProfile = useTranslations('profile.setup.experienceLevels')
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: 'tasker'
  })
  const [isLoading, setIsLoading] = useState(false)

  // Update local profile state when auth profile changes
  useEffect(() => {
    if (authProfile) {
      // Parse skills properly using utility function
      const parsedSkills = parseSkillsArray(authProfile.skills)

      // Parse experience levels using utility function
      const parsedExperienceLevels = parseExperienceLevels(authProfile.experience)

      setProfile({
        name: authProfile.name || '',
        email: authProfile.email || '',
        username: authProfile.username || '',
        bio: authProfile.bio || '',
        role: authProfile.role || 'tasker',
        phone: authProfile.phone || '',
        location: authProfile.location || '',
        website: authProfile.website || '',
        skills: parsedSkills,
        experience: authProfile.experience || '',
        experienceLevels: parsedExperienceLevels,
        preferredJobTypes: authProfile.preferredJobTypes || [],
        createdAt: authProfile.created_at
      })
    }
  }, [authProfile])

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('loadingProfile')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  const skillsArrayToString = (skillsArray: string[]): string => {
    return skillsArray.join(', ')
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Base profile data that all roles can update
      const baseProfileData = {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
      }

      // Convert skills and experience levels back to the format expected by the API
      const skillExperiences = (profile.skills || []).map(skill => ({
        skill,
        experienceLevel: profile.experienceLevels?.[skill] || 'not-specified'
      }))

      // Only include professional fields for non-client roles
      const profileData = profile.role === 'client' 
        ? { 
            ...baseProfileData,
            website: profile.website, // Website is available for all roles but moved to bio section for taskers/companies
          }
        : {
            ...baseProfileData,
            bio: profile.bio,
            skills: skillsArrayToString(profile.skills || []),
            experience: JSON.stringify(skillExperiences),
            preferredJobTypes: profile.preferredJobTypes,
          }

      // Get session for auth header
      const { supabase } = await import("@/lib/supabase")
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error('Please sign in again to continue')
        return
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        toast.success(t('updated'))
        // Refresh the auth context to get updated user data
        await refreshUser()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || t('updateFailed'))
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t('updateFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // Check if profile setup is completed to determine if basic fields should be locked
  const isProfileSetupCompleted = authProfile?.profileSetupCompleted ?? false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
          {isProfileSetupCompleted && (
            <span className="block text-xs text-muted-foreground mt-1">
              {t('lockWarning')}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profilePicture')}</h3>
            <AvatarUpload 
              currentAvatarUrl={authProfile?.avatarUrl || undefined}
              onAvatarUploaded={async () => {
                // Avatar upload handles its own profile update, refresh to get updated data
                await refreshUser()
              }}
              size="lg"
            />
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('basicInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('displayName')}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={t('displayNamePlaceholder')}
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    {t('fieldLockedMessage')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder={t('phoneNumberPlaceholder')}
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    {t('fieldLockedMessage')}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">{t('location')}</Label>
                <Input
                  id="location"
                  value={profile.location ? formatLocation(profile.location) : ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder={t('locationPlaceholder')}
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    {t('fieldLockedMessage')}
                  </p>
                )}
              </div>
              {/* Website field for clients only in basic info */}
              {profile.role === 'client' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">{t('website')}</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder={t('websitePlaceholder')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Information - Only show for taskers and companies */}
          {profile.role !== 'client' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('professionalInformation')}</h3>
              <div className="space-y-4">
                {/* Skills first for taskers, bio first for companies */}
                {profile.role === 'tasker' ? (
                  <>
                    <div className="space-y-2">
                      <SkillsBubbleInput
                        value={profile.skills || []}
                        onChange={(skills) => setProfile({ ...profile, skills })}
                        placeholder={t('skillsPlaceholder')}
                        label={t('skills')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('bio')}</Label>
                      <SimpleRichTextEditor
                        value={profile.bio || ''}
                        onChange={(content) => setProfile({ ...profile, bio: content })}
                        placeholder={t('bioPlaceholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">{t('website')}</Label>
                      <Input
                        id="website"
                        value={profile.website || ''}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder={t('websitePlaceholder')}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bio">{t('bio')}</Label>
                      <SimpleRichTextEditor
                        value={profile.bio || ''}
                        onChange={(content) => setProfile({ ...profile, bio: content })}
                        placeholder={t('bioPlaceholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">{t('website')}</Label>
                      <Input
                        id="website"
                        value={profile.website || ''}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder={t('websitePlaceholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <SkillsBubbleInput
                        value={profile.skills || []}
                        onChange={(skills) => setProfile({ ...profile, skills })}
                        placeholder={t('skillsPlaceholder')}
                        label={t('skills')}
                      />
                    </div>
                  </>
                )}

                {/* Experience levels for each skill */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-3">
                    <Label>{t('experienceLevel')}</Label>
                    <div className="space-y-2">
                      {profile.skills.map((skill) => {
                        const currentLevel = profile.experienceLevels?.[skill] || 'not-specified'
                        
                        return (
                          <div key={skill} className="flex items-center gap-3 p-3 border rounded-lg">
                            <span className="text-sm font-medium flex-1">{skill}</span>
                            <div className="flex flex-col items-end gap-1">
                              <Select
                                value={currentLevel}
                                onValueChange={(value) => 
                                  setProfile(prev => ({
                                    ...prev,
                                    experienceLevels: {
                                      ...prev.experienceLevels,
                                      [skill]: value
                                    }
                                  }))
                                }
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-specified">{tProfile('notSpecified')}</SelectItem>
                                  <SelectItem value="beginner">{tProfile('beginner')}</SelectItem>
                                  <SelectItem value="1-2-years">{tProfile('oneToTwoYears')}</SelectItem>
                                  <SelectItem value="3-5-years">{tProfile('threeToFiveYears')}</SelectItem>
                                  <SelectItem value="5plus-years">{tProfile('fivePlusYears')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? t('updating') : t('updateProfile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

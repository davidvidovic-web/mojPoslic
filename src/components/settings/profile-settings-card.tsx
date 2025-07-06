'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'
import { User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { parseSkillsArray, parseExperienceLevels, formatExperienceLevel } from '@/lib/profile-format'
import { formatLocation } from '@/lib/location-format'

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
  const { user: authProfile, loading: authLoading, refreshUser } = useAuth()
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
        createdAt: authProfile.createdAt?.toISOString()
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
            Profile Settings
          </CardTitle>
          <CardDescription>
            Loading your profile information...
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

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        // Refresh the auth context to get updated user data
        await refreshUser()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred while updating your profile')
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
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and profile details
          {isProfileSetupCompleted && (
            <span className="block text-xs text-muted-foreground mt-1">
              Basic information is locked after profile setup. Contact support to modify.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your display name"
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    This field is locked. Contact support to change.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Your phone number"
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    This field is locked. Contact support to change.
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location ? formatLocation(profile.location) : ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                  disabled={isProfileSetupCompleted}
                  className={isProfileSetupCompleted ? "bg-muted" : ""}
                />
                {isProfileSetupCompleted && (
                  <p className="text-xs text-muted-foreground">
                    This field is locked. Contact support to change.
                  </p>
                )}
              </div>
              {/* Website field for clients only in basic info */}
              {profile.role === 'client' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Information - Only show for taskers and companies */}
          {profile.role !== 'client' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <SimpleRichTextEditor
                    value={profile.bio || ''}
                    onChange={(content) => setProfile({ ...profile, bio: content })}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <SkillsBubbleInput
                    value={profile.skills || []}
                    onChange={(skills) => setProfile({ ...profile, skills })}
                    placeholder="Add your skills (e.g., React, Node.js, Design)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add skills that showcase your expertise
                  </p>
                </div>

                {/* Experience levels for each skill */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-3">
                    <Label>Experience Levels</Label>
                    <p className="text-xs text-muted-foreground">
                      Set your experience level for each skill
                    </p>
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
                                  <SelectItem value="not-specified">Not Specified</SelectItem>
                                  <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                                  <SelectItem value="1-2-years">1-2 Years</SelectItem>
                                  <SelectItem value="3-5-years">3-5 Years</SelectItem>
                                  <SelectItem value="5plus-years">5+ Years</SelectItem>
                                </SelectContent>
                              </Select>
                              {currentLevel !== 'not-specified' && (
                                <span className="text-xs text-muted-foreground">
                                  Current: {formatExperienceLevel(currentLevel)}
                                </span>
                              )}
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
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

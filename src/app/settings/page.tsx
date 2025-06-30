'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { User, Moon, Sun, Monitor, Shield, UserCircle } from 'lucide-react'
import { ChangePasswordForm } from '@/components/change-password-form'

interface UserProfile {
  name: string
  email: string
  bio?: string
  role: string
  phone?: string
  location?: string
  website?: string
  skills?: string
  experience?: string
  preferredJobTypes?: string[]
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    bio: '',
    role: 'employee',
    phone: '',
    location: '',
    website: '',
    skills: '',
    experience: '',
    preferredJobTypes: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        bio: '', // Will be loaded from API
        role: user.role || 'employee',
        phone: '',
        location: '',
        website: '',
        skills: '',
        experience: '',
        preferredJobTypes: []
      })
      // Load additional profile data
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        // Handle the nested user object from API response
        const profileData = data.user || data
        setProfile(prev => ({
          ...prev,
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          location: profileData.location || '', 
          website: profileData.website || '',
          skills: profileData.skills || '',
          experience: profileData.experience || '',
          preferredJobTypes: profileData.preferredJobTypes || []
        }))
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          website: profile.website,
          skills: profile.skills,
          experience: profile.experience,
          preferredJobTypes: profile.preferredJobTypes,
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      toast.error('An error occurred while updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">👑 Admin</Badge>
      case 'employer':
        return <Badge variant="default">🏢 Employer</Badge>
      case 'employee':
        return <Badge variant="secondary">👤 Employee</Badge>
      default:
        return <Badge variant="outline">👤 User</Badge>
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access settings.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <UserCircle className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your profile information and account preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+387 XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website/Portfolio</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Professional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                    placeholder="List your skills (e.g., JavaScript, React, Node.js, Handyman, Plumbing, etc.)"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="Describe your work experience..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Job Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['quick_job', 'full_time', 'part_time', 'remote'].map((jobType) => (
                      <label key={jobType} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={profile.preferredJobTypes?.includes(jobType)}
                          onChange={(e) => {
                            const updatedTypes = e.target.checked
                              ? [...(profile.preferredJobTypes || []), jobType]
                              : (profile.preferredJobTypes || []).filter(type => type !== jobType)
                            setProfile({ ...profile, preferredJobTypes: updatedTypes })
                          }}
                        />
                        <span>{jobType.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2">
                  {getRoleBadge(profile.role)}
                  <span className="text-sm text-muted-foreground">
                    Contact support to change your account type
                  </span>
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              View your account details and membership information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    Unknown
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <Badge variant="default" className="ml-2">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the application looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <ChangePasswordForm />

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security settings and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">              
              <Separator />
              
              <div className="space-y-2">
                <Label>Privacy</Label>
                <div className="text-sm text-muted-foreground">
                  <p>• Your email is only visible to you</p>
                  <p>• Your profile information may be visible to employers when you apply for jobs</p>
                  <p>• We do not share your personal information with third parties</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
            <CardDescription>
              Get help or contact support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" disabled>
                  📚 Help Center (Coming Soon)
                </Button>
                <Button variant="outline" disabled>
                  📧 Contact Support (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

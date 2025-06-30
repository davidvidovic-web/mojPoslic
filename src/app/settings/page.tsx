'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { User, Moon, Sun, Monitor, Shield, UserCircle, Crown, Building2, Trash2, Lock, BookOpen, Mail } from 'lucide-react'
import { ChangePasswordForm } from '@/components/change-password-form'
import { SkillsBubbleInput } from '@/components/ui/skills-bubble-input'

interface UserProfile {
  name: string
  email: string
  username?: string
  bio?: string
  role: string
  phone?: string
  location?: string
  website?: string
  skills?: string[]  // Changed to array for UI
  experience?: string
  preferredJobTypes?: string[]
  createdAt?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  
  // Helper functions for skills conversion
  const stringToSkillsArray = (skillsString: string): string[] => {
    if (!skillsString) return []
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
  }
  
  const skillsArrayToString = (skillsArray: string[]): string => {
    return skillsArray.join(', ')
  }

  const formatMemberSince = (dateString?: string): string => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  const getAccountStatus = () => {
    // For now, all accounts are active. In the future, you could add logic for:
    // - Email verification status
    // - Account deletion pending status
    // - Suspended accounts, etc.
    
    // You can extend this to check actual user status from the database
    // For example:
    // if (!user.emailVerified) return { status: 'pending', label: 'Waiting on Verification', variant: 'secondary' }
    // if (user.deletionScheduled) return { status: 'deletion', label: 'Set for Deletion', variant: 'destructive' }
    // if (user.suspended) return { status: 'suspended', label: 'Suspended', variant: 'destructive' }
    
    return {
      status: 'active',
      label: 'Active',
      variant: 'default' as const
    }
  }
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    username: '',
    bio: '',
    role: 'employee',
    phone: '',
    location: '',
    website: '',
    skills: [],
    experience: '',
    preferredJobTypes: [],
    createdAt: undefined
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
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
            skills: stringToSkillsArray(profileData.skills || ''),
            experience: profileData.experience || '',
            preferredJobTypes: profileData.preferredJobTypes || [],
            createdAt: profileData.createdAt
          }))
        }
      } catch (error) {
        console.error('Failed to load profile data:', error)
      }
    }

    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        bio: '', // Will be loaded from API
        role: user.role || 'employee',
        phone: '',
        location: '',
        website: '',
        skills: [],
        experience: '',
        preferredJobTypes: [],
        createdAt: undefined
      })
      // Load additional profile data
      loadProfileData()
    }
  }, [user])

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
          username: profile.username,
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          website: profile.website,
          skills: skillsArrayToString(profile.skills || []),
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
        return (
          <Badge variant="destructive" className="flex items-center">
            <Crown className="h-3 w-3 mr-1" aria-hidden="true" />
            Admin
          </Badge>
        )
      case 'employer':
        return (
          <Badge variant="default" className="flex items-center">
            <Building2 className="h-3 w-3 mr-1" aria-hidden="true" />
            Employer
          </Badge>
        )
      case 'company':
        return (
          <Badge variant="default" className="flex items-center">
            <Building2 className="h-3 w-3 mr-1" aria-hidden="true" />
            Company
          </Badge>
        )
      case 'employee':
        return (
          <Badge variant="secondary" className="flex items-center">
            <User className="h-3 w-3 mr-1" aria-hidden="true" />
            Employee
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center">
            <User className="h-3 w-3 mr-1" aria-hidden="true" />
            User
          </Badge>
        )
    }
  }

  const handleDeleteAccount = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      'WARNING: Account Deletion\n\n' +
      'You are about to permanently delete your account.\n\n' +
      'This will immediately and permanently delete:\n' +
      '• Your profile and account data\n' +
      '• All your job postings\n' +
      '• All your job applications\n' +
      '• All associated data\n\n' +
      'THIS ACTION CANNOT BE UNDONE!\n\n' +
      'Are you sure you want to continue?'
    )

    if (!firstConfirm) {
      toast.info('Account deletion cancelled')
      return
    }

    // Second confirmation with typing requirement
    const confirmation = window.prompt(
      'Final Confirmation Required\n\n' +
      'To proceed with account deletion, please type exactly:\n\n' +
      'DELETE MY ACCOUNT\n\n' +
      '(case sensitive)'
    )

    if (confirmation !== 'DELETE MY ACCOUNT') {
      toast.error('Account deletion cancelled - confirmation text did not match exactly')
      return
    }

    // Show loading state
    toast.loading('Deleting your account...', { id: 'account-deletion' })

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Account deleted successfully. Redirecting...', { id: 'account-deletion' })
        // Sign out and redirect after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete account', { id: 'account-deletion' })
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('An error occurred while deleting your account', { id: 'account-deletion' })
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
                  <SimpleRichTextEditor
                    value={profile.bio || ''}
                    onChange={(value) => setProfile({ ...profile, bio: value })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Separator />

              {/* Professional Information - Only show for employees */}
              {/* Employers and companies don't need skills, experience, or job preferences */}
              {profile.role === 'employee' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Professional Information</h3>
                    
                    <SkillsBubbleInput
                      value={profile.skills || []}
                      onChange={(skills) => setProfile({ ...profile, skills })}
                      placeholder="Add your skills..."
                      maxSkills={15}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <SimpleRichTextEditor
                        value={profile.experience || ''}
                        onChange={(value) => setProfile({ ...profile, experience: value })}
                        placeholder="Describe your work experience..."
                        className="min-h-[100px]"
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
                </>
              )}

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
                    {formatMemberSince(profile.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Account Type</Label>
                  <div className="flex items-center mt-1">
                    {getRoleBadge(profile.role)}
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <div className="flex items-center mt-1">
                  <Badge variant={getAccountStatus().variant} className="flex items-center">
                    <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
                    {getAccountStatus().label}
                  </Badge>
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

              <Separator />

              {/* Account Deletion */}
              <div className="space-y-4">
                <Label className="text-destructive">Danger Zone</Label>
                <div className="border border-destructive/20 rounded-lg p-4 space-y-3 bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• All your profile information will be deleted</li>
                      <li>• All your job postings will be removed</li>
                      <li>• All your job applications will be deleted</li>
                      <li>• You will be logged out immediately</li>
                    </ul>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={profile.role === 'admin'}
                    className="w-full sm:w-auto flex items-center"
                  >
                    {profile.role === 'admin' ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                        Admin accounts cannot be deleted
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        Delete My Account
                      </>
                    )}
                  </Button>
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
                <Button variant="outline" disabled className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                  Help Center (Coming Soon)
                </Button>
                <Button variant="outline" disabled className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                  Contact Support (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

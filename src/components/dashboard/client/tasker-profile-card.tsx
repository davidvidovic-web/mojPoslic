'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, X, User } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatDate } from '@/lib/date-format'
import { ReviewScore } from '@/components/reviews/review-score'

interface TaskerProfileCardProps {
  user: {
    id: string
    name?: string
    email?: string
    avatarUrl?: string
    bio?: string
    location?: string
    skills?: string | string[]
    experience?: string
    averageRating?: number
    totalReviews?: number
  }
  application?: {
    id: string
    message?: string
    appliedAt?: Date
    job?: {
      title?: string
    }
  }
  onClose: () => void
  onMessage?: (userId: string) => void
}

export function TaskerProfileCard({ user, application, onClose, onMessage }: TaskerProfileCardProps) {
  const t = useTranslations('dashboard.applicationManagement')
  const locale = useLocale() as 'bs' | 'en'
  
  // Parse skills properly using the same logic as profile components
  const parseSkills = (skills: string | string[] | undefined | null): string[] => {
    if (!skills) return []
    
    // Handle array format (modern)
    if (Array.isArray(skills)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (skills.filter(skill => skill !== null && skill !== undefined) as any[]).map(skill => {
        // Handle object format: {skill: "name", experienceLevel: "..."}
        if (typeof skill === 'object' && 'skill' in skill) {
          return (skill as { skill: string; experienceLevel?: string }).skill
        }
        // Handle simple string format
        if (typeof skill === 'string') {
          return skill
        }
        return ''
      }).filter(skill => skill && skill.trim() !== '')
    }
    
    // Handle string format (legacy)
    if (typeof skills === 'string') {
      // Check if it's JSON array string
      if (skills.trim().startsWith('[') && skills.trim().endsWith(']')) {
        try {
          const parsed = JSON.parse(skills)
          if (Array.isArray(parsed)) {
            return parsed.map(skill => {
              // Handle object format in parsed JSON
              if (typeof skill === 'object' && skill !== null && 'skill' in skill) {
                return skill.skill
              }
              return skill
            }).filter(skill => skill && typeof skill === 'string' && skill.trim() !== '')
          }
        } catch (error) {
          console.warn('Failed to parse skills JSON:', error)
        }
      }
      
      // Handle comma-separated string
      return skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '')
    }
    
    return []
  }

  // Format location from slug to proper name (e.g., "banja-luka" -> "Banja Luka")
  const formatLocation = (location: string | undefined): string => {
    if (!location) return ''
    
    // Convert kebab-case to Title Case
    return location
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const skills = parseSkills(user.skills)
  const formattedLocation = formatLocation(user.location)

  // Filter out invalid experience (e.g., JSON strings that should be in skills)
  const isValidExperience = (exp: string | undefined): boolean => {
    if (!exp) return false
    // Check if it's a JSON array string (invalid for experience)
    if (exp.trim().startsWith('[') && exp.trim().endsWith(']')) {
      return false
    }
    return true
  }

  const validExperience = isValidExperience(user.experience) ? user.experience : undefined

  // Helper function to strip HTML (same as application manager)
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-card-foreground">
              {t('taskerProfile') || 'Tasker Profile'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center ring-2 ring-primary/10 flex-shrink-0">
              {user.avatarUrl ? (
                <Image 
                  src={user.avatarUrl} 
                  alt={user.name || 'User'} 
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground mb-1">
                {user.name || t('anonymousTasker')}
              </h3>
              
              {/* Rating */}
              <div className="mb-2">
                <ReviewScore userId={user.id} size="md" showCount={true} />
              </div>
              
              {/* Location */}
              {formattedLocation && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{formattedLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="font-medium text-card-foreground mb-3">
              {t('profileCard.contactInformation')}
            </h4>
            <div className="space-y-2">
              {/* Email */}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-6">
              <h4 className="font-medium text-card-foreground mb-3">
                {t('profileCard.about')}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-card-foreground mb-3">
                {t('profileCard.skills')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {validExperience && (
            <div className="mb-6">
              <h4 className="font-medium text-card-foreground mb-3">
                {t('profileCard.experience')}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{validExperience}</p>
            </div>
          )}

          {/* Application Details */}
          {application && (
            <div className="mb-6">
              <h4 className="font-medium text-card-foreground mb-3">
                {t('profileCard.applicationDetails')}
              </h4>
              <div className="space-y-3">
                {application.job?.title && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profileCard.appliedFor')}
                    </span>
                    <p className="text-sm text-foreground mt-1">{application.job.title}</p>
                  </div>
                )}
                
                {application.appliedAt && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profileCard.appliedOn')}
                    </span>
                    <p className="text-sm text-foreground mt-1">
                      {formatDate(application.appliedAt, locale, { format: 'long' })}
                    </p>
                  </div>
                )}
                
                {application.message && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('profileCard.message')}
                    </span>
                    <p className="text-sm text-foreground line-clamp-3 bg-muted/50 p-2 rounded mt-1">
                      {stripHtml(application.message)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {onMessage && (
            <div className="flex justify-center pt-4 border-t">
              <Button
                onClick={() => onMessage(user.id)}
                size="sm"
                className="px-6"
              >
                <Mail className="h-4 w-4 mr-1" />
                {t('message')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
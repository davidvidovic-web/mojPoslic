'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Star, X, User } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { formatDate } from '@/lib/date-format'

interface TaskerProfileCardProps {
  user: {
    id: string
    name?: string
    email?: string
    phone?: string
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
      return skills.filter(skill => skill && skill.trim() !== '')
    }
    
    // Handle string format (legacy)
    if (typeof skills === 'string') {
      // Check if it's JSON array string
      if (skills.trim().startsWith('[') && skills.trim().endsWith(']')) {
        try {
          const parsed = JSON.parse(skills)
          if (Array.isArray(parsed)) {
            return parsed.filter(skill => skill && skill.trim() !== '')
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

  const skills = parseSkills(user.skills)

  // Debug logging to see what we're getting
  console.log('🔍 TaskerProfileCard Debug:', {
    rawSkills: user.skills,
    parsedSkills: skills,
    skillsType: typeof user.skills,
    skillsLength: skills.length
  })

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
              {user.averageRating && (
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-foreground">
                    {user.averageRating.toFixed(1)}
                  </span>
                  {user.totalReviews && (
                    <span className="text-sm text-muted-foreground">
                      ({user.totalReviews} {user.totalReviews === 1 ? t('profileCard.review') : t('profileCard.reviews')})
                    </span>
                  )}
                </div>
              )}
              
              {/* Location */}
              {user.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
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
              
              {/* Phone */}
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
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

          {/* Skills Section - Always show for debugging */}
          <div className="mb-6">
            <h4 className="font-medium text-card-foreground mb-3">
              {t('profileCard.skills')} ({skills.length} skills found)
            </h4>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No skills data found. Raw skills: {JSON.stringify(user.skills)}
              </div>
            )}
          </div>

          {/* Experience */}
          {user.experience && (
            <div className="mb-6">
              <h4 className="font-medium text-card-foreground mb-3">
                {t('profileCard.experience')}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{user.experience}</p>
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
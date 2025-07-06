'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSkillsList, formatSkillsWithExperience } from '@/lib/profile-format'
import { Star } from 'lucide-react'

interface SkillsDisplayProps {
  skills?: string[] | string | null
  experience?: string | object | null
  className?: string
  showTitle?: boolean
  variant?: 'compact' | 'detailed' | 'badge-only'
}

export function SkillsDisplay({ 
  skills, 
  experience, 
  className = "",
  showTitle = true,
  variant = 'detailed'
}: SkillsDisplayProps) {
  const skillsWithExperience = formatSkillsWithExperience(skills, experience)
  
  if (!skillsWithExperience || skillsWithExperience.length === 0) {
    return null
  }

  if (variant === 'badge-only') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {skillsWithExperience.map(({ skill }, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        {showTitle && (
          <h4 className="text-sm font-medium mb-2">Skills</h4>
        )}
        <p className="text-sm text-muted-foreground">
          {formatSkillsList(skills)}
        </p>
      </div>
    )
  }

  // Detailed variant with experience levels
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Skills & Experience
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {skillsWithExperience.map(({ skill, level }, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
            <span className="text-sm font-medium">{skill}</span>
            <Badge 
              variant={level === 'Not Specified' ? 'outline' : 'secondary'} 
              className="text-xs"
            >
              {level}
            </Badge>
          </div>
        ))}
        
        {skillsWithExperience.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No skills specified yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Simplified component for just showing skills as a formatted list
export function SkillsList({ 
  skills, 
  className = "",
  maxDisplay = 5
}: { 
  skills?: string[] | string | null; 
  className?: string; 
  maxDisplay?: number 
}) {
  const skillsArray = Array.isArray(skills) ? skills : 
    typeof skills === 'string' ? 
      skills.split(',').map(s => s.trim()).filter(s => s !== '') : 
      []
  
  if (skillsArray.length === 0) return null

  const displaySkills = skillsArray.slice(0, maxDisplay)
  const remainingCount = skillsArray.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displaySkills.map((skill, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {skill}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

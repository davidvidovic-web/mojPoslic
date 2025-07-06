'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2, Star } from 'lucide-react'

interface JobCardActionsProps {
  applicationCount: number
  onEdit: () => void
  onDelete: () => void
  onFeature?: () => void
  isFeatured?: boolean
}

export function JobCardActions({ 
  applicationCount, 
  onEdit, 
  onDelete, 
  onFeature,
  isFeatured = false 
}: JobCardActionsProps) {
  return (
    <div className="flex items-center gap-2 ml-4">
      {/* Feature button */}
      {onFeature && (
        <Button 
          variant={isFeatured ? "default" : "outline"}
          size="sm"
          onClick={onFeature}
          title={isFeatured ? "Remove from featured" : "Feature this job"}
        >
          <Star className={`h-4 w-4 ${isFeatured ? 'fill-current' : ''}`} />
        </Button>
      )}
      
      {/* Edit button */}
      {applicationCount === 0 ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
          title="Edit job posting"
        >
          <Edit className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          disabled
          title={`Cannot edit - ${applicationCount} application(s) received`}
        >
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
      
      {/* Delete button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onDelete}
        title="Delete job posting"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

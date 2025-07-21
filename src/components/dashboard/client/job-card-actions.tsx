'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Star, Edit } from 'lucide-react'

interface JobCardActionsProps {
  onDelete: () => void
  onEdit?: () => void
  onFeature?: () => void
  isFeatured?: boolean
}

export function JobCardActions({ 
  onDelete,
  onEdit,
  onFeature,
  isFeatured = false
}: JobCardActionsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Edit button */}
      {onEdit && (
        <Button 
          variant="outline"
          size="sm"
          onClick={onEdit}
          title="Edit job posting"
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {/* Feature button */}
      {onFeature && (
        <Button 
          variant={isFeatured ? "default" : "outline"}
          size="sm"
          onClick={onFeature}
          title={isFeatured ? "Remove from featured" : "Feature this job"}
          className="h-8 w-8 p-0"
        >
          <Star className={`h-4 w-4 ${isFeatured ? 'fill-current' : ''}`} />
        </Button>
      )}
      
      {/* Delete button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onDelete}
        title="Delete job posting"
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

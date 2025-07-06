'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

interface JobCardActionsProps {
  applicationCount: number
  onEdit: () => void
  onDelete: () => void
}

export function JobCardActions({ applicationCount, onEdit, onDelete }: JobCardActionsProps) {
  return (
    <div className="flex items-center gap-2 ml-4">
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

'use client'

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateJobData } from "@/types/job"

interface DescriptionSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function DescriptionSection({ formData, onChange }: DescriptionSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          required
          rows={4}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements (Optional)</Label>
        <Textarea
          id="requirements"
          placeholder="List the skills, experience, and qualifications needed..."
          rows={3}
          value={formData.requirements || ''}
          onChange={(e) => onChange({ requirements: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Benefits (Optional)</Label>
        <Textarea
          id="benefits"
          placeholder="Describe benefits, perks, and what makes this opportunity special..."
          rows={3}
          value={formData.benefits || ''}
          onChange={(e) => onChange({ benefits: e.target.value })}
        />
      </div>
    </>
  )
}

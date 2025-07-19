'use client'

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateJobData } from "@/types/job"
import { useTranslations } from "next-intl"

interface DescriptionSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function DescriptionSection({ formData, onChange }: DescriptionSectionProps) {
  const t = useTranslations('jobs.postForm.jobDetails')
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')} *</Label>
        <Textarea
          id="description"
          placeholder={t('descriptionPlaceholder')}
          required
          rows={4}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">{t('requirements')} ({t('optional', { ns: 'common' })})</Label>
        <Textarea
          id="requirements"
          placeholder={t('requirementsPlaceholder')}
          rows={3}
          value={formData.requirements || ''}
          onChange={(e) => onChange({ requirements: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">{t('benefits')} ({t('optional', { ns: 'common' })})</Label>
        <Textarea
          id="benefits"
          placeholder={t('benefitsPlaceholder')}
          rows={3}
          value={formData.benefits || ''}
          onChange={(e) => onChange({ benefits: e.target.value })}
        />
      </div>
    </>
  )
}

'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreateJobData } from "@/types/job"
import { useTranslations } from "next-intl"

interface ContactSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ContactSection({ formData, onChange }: ContactSectionProps) {
  const t = useTranslations('jobs.postForm.contact')
  const tCommon = useTranslations('common')
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">{t('website')} ({tCommon('optional')})</Label>
          <Input
            id="website"
            placeholder={t('websitePlaceholder')}
            type="url"
            value={formData.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('contactEmail')} ({tCommon('optional')})</Label>
          <Input
            id="email"
            placeholder={t('contactEmailPlaceholder')}
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-email">Alternative Contact Email (Optional)</Label>
          <Input
            id="contact-email"
            placeholder="hr@company.com"
            type="email"
            value={formData.contact_email || ''}
            onChange={(e) => onChange({ contact_email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="application-url">{t('applicationUrl')} ({tCommon('optional')})</Label>
          <Input
            id="application-url"
            placeholder={t('applicationUrlPlaceholder')}
            type="url"
            value={formData.application_url || ''}
            onChange={(e) => onChange({ application_url: e.target.value })}
          />
        </div>
      </div>
    </>
  )
}

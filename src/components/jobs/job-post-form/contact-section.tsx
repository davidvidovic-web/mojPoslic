'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CreateJobData } from "@/types/job"

interface ContactSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ContactSection({ formData, onChange }: ContactSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Company Website (Optional)</Label>
          <Input
            id="website"
            placeholder="https://example.com"
            type="url"
            value={formData.website || ''}
            onChange={(e) => onChange({ website: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email (Optional)</Label>
          <Input
            id="email"
            placeholder="jobs@company.com"
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
          <Label htmlFor="application-url">Application Portal URL (Optional)</Label>
          <Input
            id="application-url"
            placeholder="https://company.com/apply"
            type="url"
            value={formData.application_url || ''}
            onChange={(e) => onChange({ application_url: e.target.value })}
          />
        </div>
      </div>
    </>
  )
}

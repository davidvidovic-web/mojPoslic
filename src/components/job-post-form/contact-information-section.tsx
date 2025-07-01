'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreateJobData } from '@/types/job'
import { useAuth } from '@/contexts/prisma-auth-context'
import { Lightbulb, Mail } from 'lucide-react'

interface ContactInformationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ContactInformationSection({ formData, onChange }: ContactInformationSectionProps) {
  const { user } = useAuth()

  // Initialize contact email with user's email if not set
  useEffect(() => {
    if (!formData.email && user?.email) {
      onChange({ 
        email: user.email,
        contact_email: user.email 
      })
    }
  }, [user?.email, formData.email, onChange])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      
      <div className="space-y-2">
        <Label htmlFor="contact-email">Contact Email *</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="email@company.com"
          value={formData.email || ''}
          onChange={(e) => onChange({ 
            email: e.target.value,
            contact_email: e.target.value 
          })}
        />
        <p className="text-xs text-muted-foreground">
          This email will be shown to candidates for job applications and inquiries.
        </p>
        {user?.email && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            We&apos;ve pre-filled this with your account email ({user.email}).
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">
          Company Website or Application URL <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://company.com/careers"
          value={formData.website || ''}
          onChange={(e) => onChange({ website: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          If provided, candidates will see an &quot;Apply&quot; button linking to this URL.
        </p>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Mail className="h-4 w-4" />
          Application Process
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Candidates will contact you at the email address above</li>
          <li>• If you provide a website, it will be shown as an &quot;Apply&quot; button</li>
          <li>• You can change these details anytime after posting</li>
          <li>• Make sure to check your email regularly for applications</li>
        </ul>
      </div>
    </div>
  )
}

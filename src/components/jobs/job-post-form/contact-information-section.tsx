'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreateJobData } from '@/types/job'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { Lightbulb, Mail } from 'lucide-react'

interface ContactInformationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ContactInformationSection({ formData, onChange }: ContactInformationSectionProps) {
  const { user } = useSupabaseAuth()

  // Initialize contact email with user's email if not set
  useEffect(() => {
    if (!formData.email && user?.email) {
      onChange({ 
        email: user.email,
        contact_email: user.email 
      })
    }
  }, [user?.email, formData.email, onChange])

  const isCompany = user?.role === 'company'

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>
      
      {isCompany && (
        <>
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
              Company Website <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://company.com"
              value={formData.website || ''}
              onChange={(e) => onChange({ website: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Your company website for additional information.
            </p>
          </div>
        </>
      )}

      <div className="p-4 bg-secondary/50 rounded-[var(--radius)]">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Mail className="h-4 w-4" />
          Application Process
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          {isCompany ? (
            <>
              <li>• Candidates will contact you at the email address above</li>
              <li>• If you provide a website, it will be shown for reference</li>
              <li>• You can change these details anytime after posting</li>
              <li>• Make sure to check your email regularly for applications</li>
            </>
          ) : (
            <>
              <li>• Candidates will contact you through the platform</li>
              <li>• You&apos;ll be notified of applications via email</li>
              <li>• You can manage applications from your dashboard</li>
              <li>• Your contact details remain private until you choose to share</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

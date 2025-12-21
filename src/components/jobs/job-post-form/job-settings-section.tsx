'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { CreateJobData } from '@/types/job'
import { Settings, AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

interface JobSettingsSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function JobSettingsSection({ formData, onChange }: JobSettingsSectionProps) {
  const [showTips, setShowTips] = useState(false)
  const t = useTranslations('jobPost.types.settings')
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        {t('title')}
      </h3>
      
      <div 
        className="p-4 bg-secondary/50 rounded-[var(--radius)] cursor-pointer hover:bg-secondary/70 transition-colors"
        onClick={() => setShowTips(!showTips)}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-base md:text-sm font-medium flex items-center gap-1">
            <Settings className="h-4 w-4" />
            {t('tips.title')}
          </h4>
          {showTips ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        {showTips && (
          <ul className="text-sm md:text-xs text-muted-foreground space-y-1 mt-2">
            <li>• {t('tips.urgentJobs')}</li>
            <li>• {t('tips.applicationDeadline')}</li>
            <li>• {t('tips.urgentVisibility')}</li>
            <li>• {t('tips.deadlineHelp')}</li>
          </ul>
        )}
      </div>
      
      {/* Urgent Job Checkbox */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-urgent"
            checked={formData.is_urgent || false}
            onCheckedChange={(checked) => onChange({ is_urgent: checked as boolean })}
          />
          <Label htmlFor="is-urgent" className="text-base md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            {t('urgentJob')}
          </Label>
        </div>
        {formData.is_urgent && (
          <p className="text-xs text-muted-foreground ml-6 bg-orange-50 dark:bg-orange-950/30 p-2 rounded border-l-2 border-orange-300">
            {t('urgentJobHelp')}
          </p>
        )}
      </div>

      {/* Application Deadline */}
      <div className="space-y-2">
        <Label htmlFor="application-deadline" className="text-base md:text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('applicationDeadline')}
        </Label>
        <DatePicker
          value={formData.application_deadline ? new Date(formData.application_deadline) : undefined}
          onChange={(date) => {
            // Validate that the date is not in the past
            if (date && date < new Date()) {
              toast.error(t('deadlineError'))
              return
            }
            onChange({ 
              application_deadline: date ? date.toISOString() : undefined 
            })
          }}
          placeholder={t('selectDeadline')}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          {t('applicationDeadlineHelp')}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DurationPicker } from '@/components/ui/duration-picker'
import { CreateJobData } from '@/types/job'
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ScheduleSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ScheduleSection({ formData, onChange }: ScheduleSectionProps) {
  const [dontKnowExactDate, setDontKnowExactDate] = useState(formData.start_date === 'negotiable')
  const [dontKnowExactTime, setDontKnowExactTime] = useState(formData.start_time === 'negotiable')
  const [showTips, setShowTips] = useState(false)
  const t = useTranslations('jobPost.types.schedule')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        {t('title')}
      </h3>
      
      <div 
        className="p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
        onClick={() => setShowTips(!showTips)}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {t('tips.title')}
          </h4>
          {showTips ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        {showTips && (
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li>• {t('tips.clear')}</li>
            <li>• {t('tips.flexible')}</li>
            <li>• {t('tips.ongoing')}</li>
            <li>• {t('tips.buffer')}</li>
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Section */}
        <div className="space-y-2">
          <Label>{t('startDate')} *</Label>
          {!dontKnowExactDate ? (
            <DatePicker
              value={formData.start_date ? new Date(formData.start_date) : undefined}
              onChange={(date) => {
                if (date) {
                  // Fix date picker bug by using local date string
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  onChange({ start_date: `${year}-${month}-${day}` })
                } else {
                  onChange({ start_date: undefined })
                }
              }}
              placeholder={t('selectStartDate')}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md">
              <span className="text-sm">{t('byAgreement')}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-start-date"
              checked={dontKnowExactDate}
              onCheckedChange={(checked) => {
                setDontKnowExactDate(!!checked)
                if (checked) {
                  onChange({ start_date: 'negotiable' }) // Use constant instead of translation
                } else {
                  onChange({ start_date: undefined })
                }
              }}
            />
            <Label htmlFor="no-start-date" className="text-sm">{t('dontKnowExactDate')}</Label>
          </div>
        </div>

        {/* Time Section */}
        <div className="space-y-2">
          <Label>{t('startTime')} *</Label>
          {!dontKnowExactTime ? (
            <TimePicker
              value={formData.start_time}
              onChange={(time) => onChange({ start_time: time })}
              placeholder={t('selectStartTime')}
              startHour={7}
              endHour={21}
              selectedDate={formData.start_date}
              disableTimesWithin3Hours={true}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md">
              <span className="text-sm">{t('byAgreement')}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="no-start-time"
              checked={dontKnowExactTime}
              onCheckedChange={(checked) => {
                setDontKnowExactTime(!!checked)
                if (checked) {
                  onChange({ start_time: 'negotiable' }) // Use constant instead of translation
                } else {
                  onChange({ start_time: undefined })
                }
              }}
            />
            <Label htmlFor="no-start-time" className="text-sm">{t('dontKnowExactTime')}</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">
          {t('duration')} <span className="text-muted-foreground">{t('optional')}</span>
        </Label>
        <DurationPicker
          value={formData.duration}
          onChange={(duration) => onChange({ duration })}
          placeholder={t('durationPlaceholder')}
        />
        <p className="text-xs text-muted-foreground">
          {t('durationHelp')}
        </p>
      </div>
    </div>
  )
}

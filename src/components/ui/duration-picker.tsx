'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'

interface DurationPickerProps {
  value?: string
  onChange?: (duration: string) => void
  placeholder?: string
  className?: string
}

const DURATION_OPTIONS = [
  { value: '1_hour', key: 'durationOptions.1_hour' },
  { value: '2_hours', key: 'durationOptions.2_hours' },
  { value: '3_hours', key: 'durationOptions.3_hours' },
  { value: '4_hours', key: 'durationOptions.4_hours' },
  { value: '6_hours', key: 'durationOptions.6_hours' },
  { value: '8_hours', key: 'durationOptions.8_hours' },
  { value: '1_day', key: 'durationOptions.1_day' },
  { value: '2_days', key: 'durationOptions.2_days' },
  { value: '3_days', key: 'durationOptions.3_days' },
  { value: '1_week', key: 'durationOptions.1_week' },
  { value: '2_weeks', key: 'durationOptions.2_weeks' },
  { value: '1_month', key: 'durationOptions.1_month' },
  { value: '2_months', key: 'durationOptions.2_months' },
  { value: '3_months', key: 'durationOptions.3_months' },
  { value: 'negotiable', key: 'durationOptions.negotiable' }
]

export function DurationPicker({
  value,
  onChange,
  placeholder = "Select duration",
  className
}: DurationPickerProps) {
  const t = useTranslations('jobPost.types.schedule')
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || t('durationPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {DURATION_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.key)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

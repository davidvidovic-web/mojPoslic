'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DurationPickerProps {
  value?: string
  onChange?: (duration: string) => void
  placeholder?: string
  className?: string
}

const DURATION_OPTIONS = [
  { value: '1_hour', label: '1 hour' },
  { value: '2_hours', label: '2 hours' },
  { value: '3_hours', label: '3 hours' },
  { value: '4_hours', label: '4 hours' },
  { value: '6_hours', label: '6 hours' },
  { value: '8_hours', label: '8 hours' },
  { value: '1_day', label: '1 day' },
  { value: '2_days', label: '2 days' },
  { value: '3_days', label: '3 days' },
  { value: '1_week', label: '1 week' },
  { value: '2_weeks', label: '2 weeks' },
  { value: '1_month', label: '1 month' },
  { value: '2_months', label: '2 months' },
  { value: '3_months', label: '3 months' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'negotiable', label: 'Negotiable' }
]

export function DurationPicker({
  value,
  onChange,
  placeholder = "Select duration",
  className
}: DurationPickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {DURATION_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

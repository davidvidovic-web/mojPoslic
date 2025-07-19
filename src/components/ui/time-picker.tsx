'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  startHour?: number
  endHour?: number
  selectedDate?: Date | string
  disableTimesWithin3Hours?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  startHour = 0,
  endHour = 23,
  selectedDate,
  disableTimesWithin3Hours = false
}: TimePickerProps) {
  const locale = useLocale()
  const t = useTranslations('jobPost.types.schedule')
  
  // Get current time for comparison
  const now = new Date()
  
  // Check if the selected date is today
  const isToday = selectedDate ? 
    (selectedDate instanceof Date ? selectedDate : new Date(selectedDate)).toDateString() === now.toDateString() 
    : false
  
  // Calculate minimum time (current time + 3 hours) if today is selected
  const getMinimumTimeInMinutes = () => {
    if (!isToday || !disableTimesWithin3Hours) return -1
    
    const threeHoursFromNow = new Date(now)
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3)
    
    return threeHoursFromNow.getHours() * 60 + threeHoursFromNow.getMinutes()
  }
  
  const minimumTimeInMinutes = getMinimumTimeInMinutes()
  
  // Generate time options in 30-minute intervals with hour restrictions
  const timeOptions = []
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const timeInMinutes = hour * 60 + minute
      
      // Check if this time should be disabled and if it's within 3 hours
      const isDisabled = minimumTimeInMinutes > 0 && timeInMinutes < minimumTimeInMinutes
      const isWithin3Hours = isDisabled // For now, all disabled times are within 3 hours
      
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString(locale === 'bs' ? 'bs-BA' : 'en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: locale !== 'bs'
      })
      
      timeOptions.push({ 
        value: timeString, 
        label: displayTime,
        disabled: isDisabled,
        showNotEnoughTimeText: isWithin3Hours
      })
    }
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
            className={option.disabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            {option.label}
            {option.disabled && option.showNotEnoughTimeText && ` (${t('notEnoughTime')})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

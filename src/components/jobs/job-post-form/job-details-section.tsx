'use client'

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { LocationPicker } from "@/components/ui/location-picker"
import { CreateJobData } from "@/types/job"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'

interface JobDetailsSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
  includeStartTime: boolean
  onIncludeStartTimeChange: (include: boolean) => void
  getSelectedCityCoordinates: () => { lat: number; lng: number; name: string } | null
}

export function JobDetailsSection({
  formData,
  onChange,
  includeStartTime,
  onIncludeStartTimeChange,
  getSelectedCityCoordinates
}: JobDetailsSectionProps) {
  const t = useTranslations('jobPost');

  return (
    <>
      <div className="space-y-2">
        <Label>{t('locationAddressLabel')}</Label>
        <LocationPicker
          key={formData.city_id} // Force re-render when city changes
          value={formData.job_address ? {
            address: formData.job_address,
            latitude: formData.job_latitude || 0,
            longitude: formData.job_longitude || 0
          } : undefined}
          onChange={(location) => onChange({
            job_address: location.address,
            job_latitude: location.latitude,
            job_longitude: location.longitude
          })}
          placeholder={t('locationAddressPlaceholder')}
          selectedCityCoordinates={getSelectedCityCoordinates()}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          {t('locationAddressHelper')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-type">{t('jobTypeLabel')}</Label>
        <Select 
          value={formData.type}
          onValueChange={(value) => onChange({ type: value as 'quick_job' | 'full_time' | 'part_time' | 'remote' })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('placeholders.selectJobType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quick_job">{t('types.quickJob')}</SelectItem>
            <SelectItem value="full_time">{t('types.fullTime')}</SelectItem>
            <SelectItem value="part_time">{t('types.partTime')}</SelectItem>
            <SelectItem value="remote">{t('types.remote')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start-date">{t('startDateLabel')}</Label>
        
        {/* Checkbox to control time inclusion */}
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="include-time"
            checked={includeStartTime}
            onCheckedChange={(checked: boolean) => onIncludeStartTimeChange(checked)}
          />
          <Label 
            htmlFor="include-time" 
            className="text-sm font-normal cursor-pointer"
          >
            {t('includeTimeLabel')}
          </Label>
        </div>

        <DateTimePicker
          value={formData.start_date ? new Date(formData.start_date) : undefined}
          onChange={(date) => {
            // Validate that the date is not in the past
            if (date && date < new Date()) {
              toast.error(t('startDateError'))
              return
            }
            
            // If time is not included, set to beginning of day
            if (date && !includeStartTime) {
              const dateOnly = new Date(date)
              dateOnly.setHours(0, 0, 0, 0)
              onChange({ start_date: dateOnly.toISOString() })
            } else {
              onChange({ start_date: date ? date.toISOString() : undefined })
            }
          }}
          placeholder={includeStartTime ? t('startDateTimePlaceholder') : t('startDatePlaceholder')}
          className="w-full"
          showTime={includeStartTime}
        />
        <p className="text-sm text-muted-foreground">
          {includeStartTime 
            ? t('startDateTimeHelper')
            : t('startDateHelper')
          }
        </p>
      </div>
    </>
  )
}

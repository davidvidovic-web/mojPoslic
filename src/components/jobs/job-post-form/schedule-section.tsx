'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { DurationPicker } from '@/components/ui/duration-picker'
import { CreateJobData } from '@/types/job'
import { Calendar, Clock } from 'lucide-react'

interface ScheduleSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function ScheduleSection({ formData, onChange }: ScheduleSectionProps) {
  const [hasSpecificStartDate, setHasSpecificStartDate] = useState(!!formData.start_date)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Schedule
      </h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="has-start-date"
          checked={hasSpecificStartDate}
          onCheckedChange={(checked) => {
            setHasSpecificStartDate(!!checked)
            if (!checked) {
              onChange({ 
                start_date: undefined,
                start_time: undefined
              })
            }
          }}
        />
        <Label htmlFor="has-start-date">This job has a specific start date and time</Label>
      </div>

      {hasSpecificStartDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              value={formData.start_date ? new Date(formData.start_date) : undefined}
              onChange={(date) => onChange({ 
                start_date: date ? date.toISOString().split('T')[0] : undefined 
              })}
              placeholder="Select start date"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time (7 AM - 9 PM)</Label>
            <TimePicker
              value={formData.start_time}
              onChange={(time) => onChange({ start_time: time })}
              placeholder="Select start time"
              startHour={7}
              endHour={21}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="duration" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Expected Duration <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <DurationPicker
          value={formData.duration}
          onChange={(duration) => onChange({ duration })}
          placeholder="How long will this job take?"
        />
        <p className="text-xs text-muted-foreground">
          Helps candidates understand the time commitment and plan accordingly.
        </p>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Scheduling Tips
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Clear scheduling helps candidates plan and increases application rates</li>
          <li>• If flexible, mention &quot;Negotiable&quot; in the duration field</li>
          <li>• For ongoing work, select &quot;Ongoing&quot; duration option</li>
          <li>• Include buffer time for setup and cleanup</li>
        </ul>
      </div>
    </div>
  )
}

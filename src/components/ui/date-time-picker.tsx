"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ClockIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showTime?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
  showTime = true
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(
    value ? format(value, "HH:mm") : "09:00"
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined)
      return
    }

    // If we have time, merge it with the selected date
    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      
      // If the selected date is today and the time would be in the past, set it to next hour
      const now = new Date()
      if (newDate <= now) {
        const nextHour = new Date(now)
        nextHour.setHours(now.getHours() + 1, 0, 0, 0)
        setTimeValue(nextHour.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
        onChange?.(nextHour)
      } else {
        onChange?.(newDate)
      }
    } else {
      onChange?.(selectedDate)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    
    if (value && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours, minutes, 0, 0)
      
      // Check if the new date/time would be in the past
      const now = new Date()
      if (newDate <= now) {
        // Don't update if it would be in the past
        return
      }
      
      onChange?.(newDate)
    }
  }

  const handleApply = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            showTime ? (
              format(value, "PPP 'at' HH:mm")
            ) : (
              format(value, "PPP")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-4 p-4">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
          />
          
          {showTime && (
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">
                <ClockIcon className="mr-2 h-4 w-4 inline" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          <Button onClick={handleApply} className="w-full">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

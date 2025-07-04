'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobData } from '@/types/job'
import { Car } from 'lucide-react'

interface TransportationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function TransportationSection({ formData, onChange }: TransportationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Car className="h-5 w-5" />
        Transportation
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="transportation">Who handles transportation to the job location?</Label>
        <Select 
          value={formData.transportation || ''} 
          onValueChange={(value) => {
            onChange({ 
              transportation: value as 'provided' | 'not_provided' | 'tasker_responsible' | 'compensated',
              // Clear compensation amount if not compensated
              ...(value !== 'compensated' && { transportation_amount: undefined })
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transportation arrangement (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="provided">Client provides transportation</SelectItem>
            <SelectItem value="not_provided">Transportation not provided</SelectItem>
            <SelectItem value="tasker_responsible">Tasker handles own transportation</SelectItem>
            <SelectItem value="compensated">Client will compensate for transportation</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Clarify who is responsible for getting to and from the job location.
        </p>
      </div>

      {/* Transportation compensation amount field */}
      {formData.transportation === 'compensated' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
          <Label htmlFor="transportation_amount">Transportation compensation amount (BAM)</Label>
          <Input
            id="transportation_amount"
            type="number"
            min="0"
            step="10"
            placeholder="e.g., 50"
            value={formData.transportation_amount || ''}
            onChange={(e) => onChange({
              transportation_amount: e.target.value ? parseInt(e.target.value) : undefined
            })}
          />
          <p className="text-xs text-muted-foreground">
            Amount in BAM that you will compensate for transportation costs.
          </p>
        </div>
      )}

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Car className="h-4 w-4" />
          Transportation Tips
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Clear transportation arrangements increase application rates</li>
          <li>• Consider offering transportation or compensation for remote job locations</li>
          <li>• Transportation compensation can help attract more candidates</li>
          <li>• Mention if parking is available for taskers who drive</li>
          <li>• Include public transport accessibility information if relevant</li>
        </ul>
      </div>
    </div>
  )
}

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreateJobData } from '@/types/job'
import { Car } from 'lucide-react'

interface TransportationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function TransportationSection({ formData, onChange }: TransportationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Car className="h-5 w-5" />
          Transportation & Access
        </h3>
        
        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Car className="h-4 w-4" />
            Transportation Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Clear transportation arrangements increase application rates</li>
            <li>• Consider offering transportation or compensation for remote job locations</li>
            <li>• Transportation compensation can help attract more candidates</li>
            <li>• Specify parking availability for taskers who drive</li>
            <li>• Include public transport information to help with planning</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transportation">Who handles transportation to the job location?</Label>
        <Select 
          value={formData.transportation || ''} 
          onValueChange={(value) => {
            onChange({ 
              transportation: value as 'provided' | 'not_provided' | 'compensated',
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

      {/* Parking availability */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="has-parking"
            checked={formData.has_parking || false}
            onCheckedChange={(checked) => onChange({ has_parking: !!checked })}
          />
          <Label htmlFor="has-parking">Parking is available</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Check if there is parking available for taskers who drive to the location.
        </p>
      </div>

      {/* Public transport accessibility */}
      <div className="space-y-2">
        <Label htmlFor="public_transport_info">Public transport accessibility (Optional)</Label>
        <Textarea
          id="public_transport_info"
          placeholder="e.g., 5 minutes walk from bus stop, Near tram line 3, Accessible by metro..."
          value={formData.public_transport_info || ''}
          onChange={(e) => onChange({ public_transport_info: e.target.value })}
          rows={2}
          className="text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Provide information about nearby public transportation options to help taskers plan their commute.
        </p>
      </div>
    </div>
  )
}

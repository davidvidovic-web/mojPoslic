'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobData } from '@/types/job'
import { getPaymentSuggestion, calculateTotalPayment } from './payment-utils'
import { Lightbulb, Target, DollarSign } from 'lucide-react'

interface CompensationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function CompensationSection({ formData, onChange }: CompensationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Options</h3>
      
      <div className="space-y-2">
        <Label htmlFor="salary-type">Payment Structure</Label>
        <Select 
          value={formData.salaryType || ''} 
          onValueChange={(value) => {
            onChange({ salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' })
            // Clear min/max when switching to fixed
            if (value === 'fixed') {
              onChange({ salaryMax: undefined })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment structure (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Price</SelectItem>
            <SelectItem value="hourly">Per Hour</SelectItem>
            <SelectItem value="daily">Per Day</SelectItem>
            <SelectItem value="weekly">Per Week</SelectItem>
            <SelectItem value="monthly">Per Month</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Smart payment calculator hint */}
        {formData.duration && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Smart Payment Suggestion</p>
                <p className="text-blue-700">
                  {getPaymentSuggestion(formData.duration)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {formData.salaryType && (
        <div className={formData.salaryType === 'fixed' ? "space-y-2" : "grid grid-cols-2 gap-4"}>
          {formData.salaryType === 'fixed' ? (
          <div className="space-y-2">
            <Label htmlFor="salary-fixed">
              Total Project Price <span className="text-muted-foreground">(BAM)</span>
            </Label>
            <Input
              id="salary-fixed"
              type="number"
              placeholder="e.g. 500"
              value={formData.salaryMin || ''}
              onChange={(e) => onChange({ 
                salaryMin: e.target.value ? Number(e.target.value) : undefined,
                salaryMax: undefined // Clear max for fixed price
              })}
            />
            <p className="text-xs text-muted-foreground">
              Enter the total amount you&apos;re willing to pay for the complete project.
            </p>
          </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="salary-min">
                  Minimum Rate <span className="text-muted-foreground">(BAM)</span>
                </Label>
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="e.g. 20"
                  value={formData.salaryMin || ''}
                  onChange={(e) => onChange({ 
                    salaryMin: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-max">
                  Maximum Rate <span className="text-muted-foreground">(BAM, Optional)</span>
                </Label>
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.salaryMax || ''}
                  onChange={(e) => onChange({ 
                    salaryMax: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Payment calculation display */}
      {formData.salaryType && formData.salaryMin && formData.duration && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
            <DollarSign className="h-5 w-5" />
            Smart Payment Calculation
          </h4>
          <div className="space-y-2">
            <div className="text-sm text-green-700 whitespace-pre-line font-mono bg-card/60 p-3 rounded border">
              {calculateTotalPayment(formData.salaryType, formData.salaryMin, formData.salaryMax, formData.duration)}
            </div>
            {formData.salaryType !== 'fixed' && (
              <p className="text-xs text-blue-600">
                💡 This calculation automatically adjusts based on your selected duration and payment type
              </p>
            )}
          </div>
        </div>
      )}

      {formData.salaryType && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          Tip: Including salary information can increase application rates by up to 30%.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="legacy-salary">
          Compensation Notes <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="legacy-salary"
          placeholder="e.g. Negotiable based on experience, Performance bonuses available..."
          value={formData.salary || ''}
          onChange={(e) => onChange({ salary: e.target.value })}
          className="min-h-[60px] resize-none text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Add any additional context about compensation, benefits, or negotiability.
        </p>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Target className="h-4 w-4" />
          Salary Best Practices
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Be transparent about compensation to attract serious candidates</li>
          <li>• Use ranges for flexibility in negotiations</li>
          <li>• Include information about benefits or perks</li>
          <li>• Consider local market rates for the position</li>
        </ul>
      </div>
    </div>
  )
}

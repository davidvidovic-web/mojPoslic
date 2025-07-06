'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateJobData } from "@/types/job"

interface SalarySectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function SalarySection({ formData, onChange }: SalarySectionProps) {
  return (
    <div className="space-y-4">
      <Label>Salary Information (Optional)</Label>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="salary-type">Salary Type</Label>
          <Select 
            value={formData.salaryType || ''}
            onValueChange={(value) => onChange({ salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select salary type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="hourly">Hourly Rate</SelectItem>
              <SelectItem value="daily">Daily Rate (Dnevnica)</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.salaryType && (
          <div className="space-y-4">
            {formData.salaryType === 'fixed' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="salary-fixed">Fixed Price (BAM)</Label>
                  <Input
                    id="salary-fixed"
                    type="number"
                    placeholder="e.g., 1500"
                    value={formData.salaryMin || ''}
                    onChange={(e) => onChange({ 
                      salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                      salaryMax: undefined // Clear max for fixed price
                    })}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">or</div>
                <div className="space-y-2">
                  <Label>Price Range (BAM)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={formData.salaryMin || ''}
                      onChange={(e) => onChange({ 
                        salaryMin: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={formData.salaryMax || ''}
                      onChange={(e) => onChange({ 
                        salaryMax: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary-min">
                    Minimum {formData.salaryType === 'hourly' ? 'Rate' : formData.salaryType === 'daily' ? 'Daily Rate' : 'Salary'} (BAM)
                  </Label>
                  <Input
                    id="salary-min"
                    type="number"
                    placeholder={
                      formData.salaryType === 'hourly' ? 'e.g., 15' : 
                      formData.salaryType === 'daily' ? 'e.g., 120' : 
                      'e.g., 2000'
                    }
                    value={formData.salaryMin || ''}
                    onChange={(e) => onChange({ 
                      salaryMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">
                    Maximum {formData.salaryType === 'hourly' ? 'Rate' : formData.salaryType === 'daily' ? 'Daily Rate' : 'Salary'} (BAM)
                  </Label>
                  <Input
                    id="salary-max"
                    type="number"
                    placeholder={
                      formData.salaryType === 'hourly' ? 'e.g., 25' : 
                      formData.salaryType === 'daily' ? 'e.g., 200' : 
                      'e.g., 3000'
                    }
                    value={formData.salaryMax || ''}
                    onChange={(e) => onChange({ 
                      salaryMax: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="salary">Alternative Salary Description</Label>
          <Input
            id="salary"
            placeholder="e.g., Competitive salary, To be discussed, etc."
            value={formData.salary || ''}
            onChange={(e) => onChange({ salary: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Use this field if you prefer text description instead of specific amounts
          </p>
        </div>
      </div>
    </div>
  )
}

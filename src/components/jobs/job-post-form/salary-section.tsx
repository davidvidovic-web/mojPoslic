'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateJobData } from "@/types/job"
import { useTranslations } from 'next-intl'

interface SalarySectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function SalarySection({ formData, onChange }: SalarySectionProps) {
  const t = useTranslations('jobs.postForm.salary')
  
  return (
    <div className="space-y-4">
      <Label>{t('title')}</Label>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="salary-type">{t('type')}</Label>
          <Select 
            value={formData.salaryType || ''}
            onValueChange={(value) => onChange({ salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectSalaryType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">{t('types.fixed')}</SelectItem>
              <SelectItem value="hourly">{t('types.hourly')}</SelectItem>
              <SelectItem value="daily">{t('types.daily')}</SelectItem>
              <SelectItem value="weekly">{t('types.weekly')}</SelectItem>
              <SelectItem value="monthly">{t('types.monthly')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.salaryType && (
          <div className="space-y-4">
            {formData.salaryType === 'daily' ? (
              <div className="space-y-2">
                <Label htmlFor="salary-daily">Daily Rate (BAM)</Label>
                <Input
                  id="salary-daily"
                  type="number"
                  placeholder={t('dailyPlaceholder')}
                  value={formData.salaryMin || ''}
                  onChange={(e) => onChange({ 
                    salaryMin: e.target.value ? parseInt(e.target.value) : undefined,
                    salaryMax: undefined // Clear max for daily rate
                  })}
                />
              </div>
            ) : formData.salaryType === 'fixed' ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="salary-fixed">Fixed Price (BAM)</Label>
                  <Input
                    id="salary-fixed"
                    type="number"
                    placeholder={t('enterAmount')}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder={t('minPlaceholder')}
                      value={formData.salaryMin || ''}
                      onChange={(e) => onChange({ 
                        salaryMin: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                    <Input
                      type="number"
                      placeholder={t('maxPlaceholder')}
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
                    Minimum {formData.salaryType === 'hourly' ? 'Rate' : 'Salary'} (BAM)
                  </Label>
                  <Input
                    id="salary-min"
                    type="number"
                    placeholder={
                      formData.salaryType === 'hourly' ? t('hourlyPlaceholder') : 
                      t('monthlyPlaceholder')
                    }
                    value={formData.salaryMin || ''}
                    onChange={(e) => onChange({ 
                      salaryMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary-max">
                    Maximum {formData.salaryType === 'hourly' ? 'Rate' : 'Salary'} (BAM)
                  </Label>
                  <Input
                    id="salary-max"
                    type="number"
                    placeholder={
                      formData.salaryType === 'hourly' ? t('enterMaxAmount') : 
                      '3000'
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
            placeholder={t('salaryTextExample')}
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

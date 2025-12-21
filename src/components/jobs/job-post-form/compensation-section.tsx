'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateJobData } from '@/types/job'
import { getPaymentSuggestion, calculateTotalPayment } from './payment-utils'
import { Lightbulb, Target, Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CompensationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function CompensationSection({ formData, onChange }: CompensationSectionProps) {
  const [showTips, setShowTips] = useState(false)
  const t = useTranslations('jobPost.types.compensation')
  
  // Validation: Check if max is less than min for hourly rates
  const hasInvalidRange = formData.salaryType === 'hourly' && 
    formData.salaryMin && 
    formData.salaryMax && 
    formData.salaryMax < formData.salaryMin

  // Validation: Check if payment is below minimum 5 BAM
  const hasBelowMinimumPayment = formData.salaryMin && formData.salaryMin < 5
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-semibold">{t('title')}</h3>
      
      <div 
        className="p-4 bg-secondary/50 rounded-[var(--radius)] cursor-pointer hover:bg-secondary/70 transition-colors"
        onClick={() => setShowTips(!showTips)}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-base md:text-sm font-medium flex items-center gap-1">
            <Target className="h-4 w-4" />
            {t('bestPractices.title')}
          </h4>
          {showTips ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
        {showTips && (
          <ul className="text-sm md:text-xs text-muted-foreground space-y-1 mt-2">
            <li>• {t('bestPractices.transparency')}</li>
            <li>• {t('bestPractices.ranges')}</li>
            <li>• {t('bestPractices.benefits')}</li>
            <li>• {t('bestPractices.marketRates')}</li>
            <li>• {t('bestPractices.salaryTip')}</li>
          </ul>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="salary-type" className="text-base md:text-sm">{t('salaryType')}</Label>
        <Select 
          value={formData.salaryType || ''} 
          onValueChange={(value) => {
            onChange({ salaryType: value as 'fixed' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'negotiable' })
            // Clear min/max when switching to fixed or negotiable
            if (value === 'fixed' || value === 'negotiable') {
              onChange({ salaryMax: undefined })
            }
          }}
        >
          <SelectTrigger className="text-base md:text-sm">
            <SelectValue placeholder="Select payment structure (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">{t('salaryTypes.fixed')}</SelectItem>
            <SelectItem value="hourly">{t('salaryTypes.hourly')}</SelectItem>
            <SelectItem value="daily">{t('salaryTypes.daily')}</SelectItem>
            <SelectItem value="negotiable">{t('salaryTypes.negotiable')}</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Smart payment calculator hint */}
        {formData.duration && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-[var(--radius)] border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">{t('smartPaymentSuggestion')}</p>
                <p className="text-blue-700">
                  {getPaymentSuggestion(formData.duration, t)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {formData.salaryType && formData.salaryType !== 'negotiable' && (
        <div className="space-y-4">
          {formData.salaryType === 'fixed' ? (
            <div className="space-y-2">
              <Label htmlFor="salary-fixed">
                {t('fixedAmount')}
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
                className={hasBelowMinimumPayment ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {/* Minimum payment validation */}
              {hasBelowMinimumPayment && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {t('validation.minimumPayment')}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('fixedAmountHelp')}
              </p>
            </div>
          ) : formData.salaryType === 'daily' ? (
            <div className="space-y-2">
              <Label htmlFor="salary-daily">
                {t('dailyRate')}
              </Label>
              <Input
                id="salary-daily"
                type="number"
                placeholder="e.g. 100"
                value={formData.salaryMin || ''}
                onChange={(e) => onChange({ 
                  salaryMin: e.target.value ? Number(e.target.value) : undefined,
                  salaryMax: undefined // Clear max for daily rate
                })}
                className={hasBelowMinimumPayment ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              {/* Minimum payment validation */}
              {hasBelowMinimumPayment && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {t('validation.minimumPayment')}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('dailyRateHelp')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary-min">
                  {t('minimumRate')}
                </Label>
                <Input
                  id="salary-min"
                  type="number"
                  placeholder="e.g. 20"
                  value={formData.salaryMin || ''}
                  onChange={(e) => onChange({ 
                    salaryMin: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className={(hasInvalidRange || hasBelowMinimumPayment) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {/* Minimum payment validation */}
                {hasBelowMinimumPayment && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {t('validation.minimumPayment')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary-max">
                  {t('maximumRate')}
                </Label>
                <Input
                  id="salary-max"
                  type="number"
                  placeholder="e.g. 25"
                  value={formData.salaryMax || ''}
                  onChange={(e) => onChange({ 
                    salaryMax: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className={hasInvalidRange ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {/* Validation error message */}
                {hasInvalidRange && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {t('validation.maxLessThanMin')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment calculation display */}
      {formData.salaryType && formData.salaryType !== 'negotiable' && (formData.salaryType === 'hourly' || formData.salaryType === 'daily') && formData.salaryMin && formData.duration && !hasInvalidRange && !hasBelowMinimumPayment && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-[var(--radius)]">
          <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
            <Wallet className="h-5 w-5" />
            {t('smartPaymentCalculation')}
          </h4>
          <div className="space-y-2">
            <div className="text-sm text-green-700 leading-relaxed bg-card/60 p-3 rounded border whitespace-pre-line">
              <div className="flex-1">
                {calculateTotalPayment(formData.salaryType, formData.salaryMin, formData.salaryMax, formData.duration, t)
                  .split('\n')
                  .map((line, index) => {
                    // Check if line is a separator
                    if (line.startsWith('─')) {
                      return (
                        <div key={index} className="border-t border-green-300 my-2"></div>
                      )
                    }
                    
                    // Parse line for selective bold formatting
                    const renderLineWithBold = (text: string) => {
                      // Split by spaces to process each word
                      const words = text.split(' ')
                      return words.map((word, wordIndex) => {
                        // Bold price amounts (numbers followed by BAM or containing BAM)
                        if (word.includes('BAM') || (word.match(/^\d+/) && words[wordIndex + 1] === 'BAM')) {
                          return <span key={wordIndex} className="font-bold">{word} </span>
                        }
                        // Bold payment method keywords
                        if (word === formData.salaryType || word.includes('hourly') || word.includes('daily')) {
                          return <span key={wordIndex} className="font-bold">{word} </span>
                        }
                        return <span key={wordIndex}>{word} </span>
                      })
                    }
                    
                    return (
                      <div key={index}>
                        {renderLineWithBold(line)}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="performance-bonus"
          checked={formData.performance_bonus || false}
          onCheckedChange={(checked) => onChange({ performance_bonus: checked as boolean })}
        />
        <Label htmlFor="performance-bonus" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t('performanceBonus')}
        </Label>
      </div>
      {formData.performance_bonus && (
        <p className="text-xs text-muted-foreground ml-6">
          {t('performanceBonusHelp')}
        </p>
      )}
    </div>
  )
}

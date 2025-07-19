'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CreateJobData } from '@/types/job'
import { Car, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TransportationSectionProps {
  formData: CreateJobData
  onChange: (data: Partial<CreateJobData>) => void
}

export function TransportationSection({ formData, onChange }: TransportationSectionProps) {
  const [showTips, setShowTips] = useState(false)
  const t = useTranslations('jobPost')
  const transportationT = useTranslations('jobPost.types.transportation')
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Car className="h-5 w-5" />
          {t('sections.transportation')}
        </h3>
        
        <div 
          className="p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors"
          onClick={() => setShowTips(!showTips)}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{transportationT('title')}</h4>
            {showTips ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          
          {showTips && (
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li>• {transportationT('tips.clearArrangements')}</li>
              <li>• {transportationT('tips.considerOffering')}</li>
              <li>• {transportationT('tips.compensationAttracts')}</li>
              <li>• {transportationT('tips.specifyParking')}</li>
              <li>• {transportationT('tips.includePublicTransport')}</li>
            </ul>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transportation">{transportationT('whoHandles')}</Label>
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
            <SelectValue placeholder={t('types.placeholders.selectTransportation')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="provided">{transportationT('options.provided')}</SelectItem>
            <SelectItem value="not_provided">{transportationT('options.notProvided')}</SelectItem>
            <SelectItem value="compensated">{transportationT('options.compensated')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {transportationT('selectDescription')}
        </p>
      </div>

      {/* Transportation compensation amount field */}
      {formData.transportation === 'compensated' && (
        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
          <Label htmlFor="transportation_amount">{transportationT('compensationAmount')}</Label>
          <Input
            id="transportation_amount"
            type="number"
            min="0"
            step="10"
            placeholder={transportationT('compensationAmountPlaceholder')}
            value={formData.transportation_amount || ''}
            onChange={(e) => onChange({
              transportation_amount: e.target.value ? parseInt(e.target.value) : undefined
            })}
          />
          <p className="text-xs text-muted-foreground">
            {transportationT('compensationHelp')}
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
          <Label htmlFor="has-parking">{transportationT('parkingAvailable')}</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          {transportationT('parkingHelp')}
        </p>
      </div>

      {/* Public transport accessibility */}
      <div className="space-y-2">
        <Label htmlFor="public_transport_info">{transportationT('publicTransportInfo')}</Label>
        <Textarea
          id="public_transport_info"
          placeholder={transportationT('publicTransportPlaceholder')}
          value={formData.public_transport_info || ''}
          onChange={(e) => onChange({ public_transport_info: e.target.value })}
          rows={2}
          className="text-xs"
        />
        <p className="text-xs text-muted-foreground">
          {transportationT('publicTransportHelp')}
        </p>
      </div>
    </div>
  )
}

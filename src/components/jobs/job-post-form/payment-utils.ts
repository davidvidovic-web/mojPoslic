// Helper functions for payment calculations and suggestions

// Helper function to translate salary types
function getSalaryTypeName(salaryType: string, t?: (key: string) => string): string {
  if (!t) return salaryType
  
  const salaryTypeMap: Record<string, string> = {
    'hourly': t('salaryTypes.hourly'),
    'daily': t('salaryTypes.daily'),
    'fixed': t('salaryTypes.fixed'),
    'negotiable': t('salaryTypes.negotiable')
  }
  
  return salaryTypeMap[salaryType] || salaryType
}

// Helper function to get payment suggestions based on duration
export function getPaymentSuggestion(duration: string, t?: (key: string) => string): string {
  // If no translation function provided, return the duration key for translation
  if (!t) {
    return `paymentSuggestions.${duration}`
  }

  const suggestions: Record<string, string> = {
    '1_hour': t('paymentSuggestions.1_hour'),
    '2_hours': t('paymentSuggestions.2_hours'),
    '3_hours': t('paymentSuggestions.3_hours'),
    '4_hours': t('paymentSuggestions.4_hours'),
    '6_hours': t('paymentSuggestions.6_hours'),
    '8_hours': t('paymentSuggestions.8_hours'),
    '1_day': t('paymentSuggestions.1_day'),
    '2_days': t('paymentSuggestions.2_days'),
    '3_days': t('paymentSuggestions.3_days'),
    '1_week': t('paymentSuggestions.1_week'),
    '2_weeks': t('paymentSuggestions.2_weeks'),
    '1_month': t('paymentSuggestions.1_month'),
    '2_months': t('paymentSuggestions.2_months'),
    '3_months': t('paymentSuggestions.3_months'),
    'ongoing': t('paymentSuggestions.ongoing'),
    'negotiable': t('paymentSuggestions.negotiable')
  }
  
  return suggestions[duration] || t('paymentSuggestions.default')
}

// Helper function to calculate total payment based on duration
export function calculateTotalPayment(
  salaryType: string, 
  salaryMin: number, 
  salaryMax?: number, 
  duration?: string,
  t?: (key: string) => string
): string {
  if (!duration || salaryType === 'fixed') {
    const amount = salaryMax && salaryMax !== salaryMin ? 
      `${salaryMin} - ${salaryMax} BAM` : 
      `${salaryMin} BAM`
    return salaryType === 'fixed' ? 
      (t ? `${t('paymentCalculation.total')}: ${amount}` : `Total: ${amount}`) : 
      amount
  }

  if (!t) {
    return 'Total payment depends on final agreement'
  }

  // Duration mappings with smart payment type suggestions
  const durationMap: Record<string, { 
    hours?: number; 
    days?: number; 
    suggestedType: string;
    description: string;
  }> = {
    '1_hour': { hours: 1, suggestedType: 'hourly', description: '1 hour' },
    '2_hours': { hours: 2, suggestedType: 'hourly', description: '2 hours' },
    '3_hours': { hours: 3, suggestedType: 'hourly', description: '3 hours' },
    '4_hours': { hours: 4, suggestedType: 'hourly', description: '4 hours' },
    '6_hours': { hours: 6, suggestedType: 'hourly', description: '6 hours' },
    '8_hours': { hours: 8, days: 1, suggestedType: 'daily', description: '8 hours (1 day)' },
    '1_day': { days: 1, suggestedType: 'daily', description: '1 day' },
    '2_days': { days: 2, suggestedType: 'daily', description: '2 days' },
    '3_days': { days: 3, suggestedType: 'daily', description: '3 days' },
    '1_week': { days: 5, suggestedType: 'fixed', description: '1 week (5 days)' },
    '2_weeks': { days: 10, suggestedType: 'fixed', description: '2 weeks (10 days)' },
    '1_month': { days: 22, suggestedType: 'fixed', description: '1 month (22 days)' },
    '2_months': { days: 44, suggestedType: 'fixed', description: '2 months (44 days)' },
    '3_months': { days: 66, suggestedType: 'fixed', description: '3 months (66 days)' },
    'negotiable': { suggestedType: 'negotiable', description: 'Negotiable' }
  }

  const durationInfo = durationMap[duration]
  if (!durationInfo) {
    return t('paymentCalculation.dependsOnAgreement')
  }

  let totalMin = salaryMin
  let totalMax = salaryMax || salaryMin

  let durationLine = ''
  let calculationLine = ''

  // Calculate based on the selected payment type
  if (salaryType === 'hourly' && durationInfo.hours) {
    // Direct hourly calculation
    totalMin = salaryMin * durationInfo.hours
    totalMax = (salaryMax || salaryMin) * durationInfo.hours
    durationLine = `${durationInfo.hours} ${t('paymentCalculation.units.hours')}`
    calculationLine = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM / ${t('paymentCalculation.units.hour')} × ${durationInfo.hours} ${t('paymentCalculation.units.hours')}`
  } else if (salaryType === 'daily' && durationInfo.days) {
    // Direct daily calculation
    totalMin = salaryMin * durationInfo.days
    totalMax = (salaryMax || salaryMin) * durationInfo.days
    durationLine = `${durationInfo.days} ${t('paymentCalculation.units.days')}`
    calculationLine = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM / ${t('paymentCalculation.units.day')} × ${durationInfo.days} ${t('paymentCalculation.units.days')}`
  } else if (salaryType === 'fixed' || salaryType === 'negotiable') {
    // Fixed price or negotiable - no multiplication needed
    return salaryType === 'fixed' ? 
      `${t('paymentCalculation.fixedProjectPrice')}: ${totalMin.toFixed(0)} BAM` : 
      `${t('paymentCalculation.negotiablePrice')}`
  } else {
    // Conversion needed - show detailed breakdown
    let conversionFactor = 1
    
    if (salaryType === 'hourly' && durationInfo.days) {
      // Converting hourly to days
      conversionFactor = durationInfo.days * 8 // 8 hours per day
      durationLine = `${conversionFactor} ${t('paymentCalculation.units.hours')} (${t('paymentCalculation.convertedFor')} ${durationInfo.days} ${t('paymentCalculation.units.days')} x 8 ${t('paymentCalculation.units.hrsPerDay')})`
      calculationLine = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM / ${t('paymentCalculation.units.hour')} × ${conversionFactor} ${t('paymentCalculation.units.hours')}`
      totalMin = salaryMin * conversionFactor
      totalMax = (salaryMax || salaryMin) * conversionFactor
    } else if (salaryType === 'daily' && durationInfo.hours) {
      // Converting daily to hours
      conversionFactor = Math.ceil(durationInfo.hours / 8)
      durationLine = `${durationInfo.hours} ${t('paymentCalculation.units.hours')} (≈${conversionFactor} ${t('paymentCalculation.units.days')})`
      calculationLine = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM / ${t('paymentCalculation.units.day')} × ${conversionFactor} ${t('paymentCalculation.units.days')}`
      totalMin = salaryMin * conversionFactor
      totalMax = (salaryMax || salaryMin) * conversionFactor
    }
  }

  const totalRange = totalMax !== totalMin ? 
    `${totalMin.toFixed(0)} - ${totalMax.toFixed(0)} BAM` : 
    `${totalMin.toFixed(0)} BAM`

  // Build the structured output
  let result = durationLine + '\n'
  result += calculationLine + '\n'
  result += '─'.repeat(40) + '\n'
  result += `${t('paymentCalculation.estimatedTotal')}: ${totalRange}`

  // Check if payment type is optimal for duration
  const isOptimalPayment = salaryType === durationInfo.suggestedType
  
  if (!isOptimalPayment) {
    const translatedSuggestedType = getSalaryTypeName(durationInfo.suggestedType, t)
    result += `\n\n${t('paymentCalculation.considerSwitching')} "${translatedSuggestedType}"`
  }

  return result
}

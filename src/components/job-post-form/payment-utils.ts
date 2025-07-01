// Helper functions for payment calculations and suggestions

// Helper function to get payment suggestions based on duration
export function getPaymentSuggestion(duration: string): string {
  const suggestions: Record<string, string> = {
    '1_hour': '💡 Perfect for "Per Hour" payment - ideal for short tasks',
    '2_hours': '💡 Perfect for "Per Hour" payment - great for quick jobs',
    '3_hours': '💡 Perfect for "Per Hour" payment - best for hourly work',
    '4_hours': '💡 Perfect for "Per Hour" payment - standard hourly rate',
    '6_hours': '💡 Consider "Per Hour" payment for precise time tracking',
    '8_hours': '💡 Perfect for "Per Day" payment - matches a full work day',
    '1_day': '💡 Perfect for "Per Day" payment - ideal for day-based work',
    '2_days': '💡 Perfect for "Per Day" payment - great for multi-day projects',
    '3_days': '💡 Perfect for "Per Day" payment - excellent for short-term work',
    '1_week': '💡 Perfect for "Per Week" payment - ideal for weekly projects',
    '2_weeks': '💡 Perfect for "Per Week" payment - great for bi-weekly work',
    '1_month': '💡 Perfect for "Per Month" payment - ideal for monthly projects',
    '2_months': '💡 Perfect for "Per Month" payment - great for extended projects',
    '3_months': '💡 Perfect for "Per Month" payment - excellent for long-term work',
    'ongoing': '💡 Consider "Per Month" payment for ongoing relationships',
    'negotiable': '💡 Consider "Fixed Price" for flexible project scope'
  }
  
  return suggestions[duration] || '💡 Choose the payment structure that works best for your specific job requirements'
}

// Helper function to calculate total payment based on duration
export function calculateTotalPayment(
  salaryType: string, 
  salaryMin: number, 
  salaryMax?: number, 
  duration?: string
): string {
  if (!duration || salaryType === 'fixed') {
    const amount = salaryMax && salaryMax !== salaryMin ? 
      `${salaryMin} - ${salaryMax} BAM` : 
      `${salaryMin} BAM`
    return salaryType === 'fixed' ? `Total: ${amount}` : amount
  }

  // Duration mappings with smart payment type suggestions
  const durationMap: Record<string, { 
    hours?: number; 
    days?: number; 
    weeks?: number; 
    months?: number;
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
    '1_week': { weeks: 1, suggestedType: 'weekly', description: '1 week' },
    '2_weeks': { weeks: 2, suggestedType: 'weekly', description: '2 weeks' },
    '1_month': { months: 1, suggestedType: 'monthly', description: '1 month' },
    '2_months': { months: 2, suggestedType: 'monthly', description: '2 months' },
    '3_months': { months: 3, suggestedType: 'monthly', description: '3 months' }
  }

  const durationInfo = durationMap[duration]
  if (!durationInfo) {
    return 'Total payment depends on final agreement'
  }

  let totalMin = salaryMin
  let totalMax = salaryMax || salaryMin
  let calculationDetails = ''

  // Calculate based on the selected payment type
  if (salaryType === 'hourly' && durationInfo.hours) {
    totalMin = salaryMin * durationInfo.hours
    totalMax = (salaryMax || salaryMin) * durationInfo.hours
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/hour × ${durationInfo.hours} hours`
  } else if (salaryType === 'daily' && durationInfo.days) {
    totalMin = salaryMin * durationInfo.days
    totalMax = (salaryMax || salaryMin) * durationInfo.days
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/day × ${durationInfo.days} days`
  } else if (salaryType === 'weekly' && durationInfo.weeks) {
    totalMin = salaryMin * durationInfo.weeks
    totalMax = (salaryMax || salaryMin) * durationInfo.weeks
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/week × ${durationInfo.weeks} weeks`
  } else if (salaryType === 'monthly' && durationInfo.months) {
    totalMin = salaryMin * durationInfo.months
    totalMax = (salaryMax || salaryMin) * durationInfo.months
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/month × ${durationInfo.months} months`
  } else {
    // Conversion needed - show warning and estimate
    let conversionFactor = 1
    let fromUnit = ''
    let toUnit = ''
    
    if (salaryType === 'hourly') {
      fromUnit = 'hour'
      if (durationInfo.days) {
        conversionFactor = durationInfo.days * 8 // 8 hours per day
        toUnit = `${durationInfo.days} days (estimated 8 hrs/day)`
      } else if (durationInfo.weeks) {
        conversionFactor = durationInfo.weeks * 40 // 40 hours per week
        toUnit = `${durationInfo.weeks} weeks (estimated 40 hrs/week)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 160 // 160 hours per month
        toUnit = `${durationInfo.months} months (estimated 160 hrs/month)`
      }
    } else if (salaryType === 'daily') {
      fromUnit = 'day'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 8)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} days)`
      } else if (durationInfo.weeks) {
        conversionFactor = durationInfo.weeks * 5 // 5 days per week
        toUnit = `${durationInfo.weeks} weeks (estimated 5 days/week)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 22 // 22 working days per month
        toUnit = `${durationInfo.months} months (estimated 22 days/month)`
      }
    } else if (salaryType === 'weekly') {
      fromUnit = 'week'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 40)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} weeks)`
      } else if (durationInfo.days) {
        conversionFactor = Math.ceil(durationInfo.days / 5)
        toUnit = `${durationInfo.days} days (≈${conversionFactor} weeks)`
      } else if (durationInfo.months) {
        conversionFactor = durationInfo.months * 4.33 // ~4.33 weeks per month
        toUnit = `${durationInfo.months} months (≈${conversionFactor.toFixed(1)} weeks)`
      }
    } else if (salaryType === 'monthly') {
      fromUnit = 'month'
      if (durationInfo.hours) {
        conversionFactor = Math.ceil(durationInfo.hours / 160)
        toUnit = `${durationInfo.hours} hours (≈${conversionFactor} months)`
      } else if (durationInfo.days) {
        conversionFactor = Math.ceil(durationInfo.days / 22)
        toUnit = `${durationInfo.days} days (≈${conversionFactor} months)`
      } else if (durationInfo.weeks) {
        conversionFactor = Math.ceil(durationInfo.weeks / 4.33)
        toUnit = `${durationInfo.weeks} weeks (≈${conversionFactor} months)`
      }
    }
    
    totalMin = salaryMin * conversionFactor
    totalMax = (salaryMax || salaryMin) * conversionFactor
    calculationDetails = `${salaryMin}${salaryMax ? `-${salaryMax}` : ''} BAM/${fromUnit} × ${conversionFactor} (converted for ${toUnit})`
  }

  const totalRange = totalMax !== totalMin ? 
    `${totalMin.toFixed(0)} - ${totalMax.toFixed(0)} BAM` : 
    `${totalMin.toFixed(0)} BAM`

  // Check if payment type is optimal for duration
  const isOptimalPayment = salaryType === durationInfo.suggestedType
  
  if (isOptimalPayment) {
    return `💰 Estimated total: ${totalRange} (${calculationDetails})`
  } else {
    return `⚠️ Estimated total: ${totalRange} (${calculationDetails})\n💡 Consider switching to "${durationInfo.suggestedType}" payment for better accuracy`
  }
}

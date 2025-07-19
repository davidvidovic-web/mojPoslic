export interface PasswordRequirement {
  id: string
  label: string
  met: boolean
  severity: 'error' | 'warning' | 'success'
}

export interface PasswordStrength {
  score: number // 0-100
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong'
  requirements: PasswordRequirement[]
  isValid: boolean
}

export function validatePassword(
  password: string, 
  userInfo?: {
    name?: string
    email?: string
  },
  t?: (key: string) => string
): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: t ? t('passwordRequirementLabels.length') : 'At least 8 characters long',
      met: password.length >= 8,
      severity: 'error'
    },
    {
      id: 'uppercase',
      label: t ? t('passwordRequirementLabels.uppercase') : 'Contains uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
      severity: 'error'
    },
    {
      id: 'lowercase',
      label: t ? t('passwordRequirementLabels.lowercase') : 'Contains lowercase letter (a-z)',
      met: /[a-z]/.test(password),
      severity: 'error'
    }
  ]

  // Add personal information checks if userInfo is provided
  if (userInfo) {
    const personalInfoChecks = checkPersonalInfo(password, userInfo, t)
    requirements.push(...personalInfoChecks)
  }

  // Calculate score based on met requirements
  const errorRequirements = requirements.filter(r => r.severity === 'error')
  const errorsMet = errorRequirements.filter(r => r.met).length
  
  // Score based on critical requirements (100% weight since no warnings)
  const score = Math.round((errorsMet / errorRequirements.length) * 100)
  
  // Determine strength level
  let level: PasswordStrength['level']
  if (score < 25) level = 'very-weak'
  else if (score < 50) level = 'weak'
  else if (score < 75) level = 'fair'
  else if (score < 100) level = 'good'
  else level = 'strong'
  
  // Password is valid if all critical requirements are met
  const isValid = errorRequirements.every(r => r.met)

  return {
    score,
    level,
    requirements,
    isValid
  }
}

function checkPersonalInfo(password: string, userInfo: {
  name?: string
  email?: string
}, t?: (key: string) => string): PasswordRequirement[] {
  const checks: PasswordRequirement[] = []
  
  if (userInfo.name) {
    const nameParts = userInfo.name.toLowerCase().split(/\s+/)
    const containsName = nameParts.some(part => 
      part.length > 2 && password.toLowerCase().includes(part)
    )
    
    checks.push({
      id: 'no-name',
      label: t ? t('passwordRequirementLabels.noName') : 'Does not contain your name',
      met: !containsName,
      severity: 'error'
    })
  }
  
  if (userInfo.email) {
    const emailPart = userInfo.email.split('@')[0].toLowerCase()
    const containsEmail = emailPart.length > 2 && password.toLowerCase().includes(emailPart)
    
    checks.push({
      id: 'no-email',
      label: t ? t('passwordRequirementLabels.noEmail') : 'Does not contain your email',
      met: !containsEmail,
      severity: 'error'
    })
  }
  
  return checks
}

export function getPasswordStrengthColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak': return 'text-red-500'
    case 'weak': return 'text-orange-500'
    case 'fair': return 'text-yellow-500'
    case 'good': return 'text-blue-500'
    case 'strong': return 'text-blue-500'
    default: return 'text-muted-foreground'
  }
}

export function getPasswordStrengthBgColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak': return 'bg-red-500'
    case 'weak': return 'bg-orange-500'
    case 'fair': return 'bg-yellow-500'
    case 'good': return 'bg-blue-500'
    case 'strong': return 'bg-blue-500'
    default: return 'bg-muted'
  }
}

export function getPasswordStrengthText(level: PasswordStrength['level'], t?: (key: string) => string): string {
  if (t) {
    switch (level) {
      case 'very-weak': return t('passwordStrengthLevels.veryWeak')
      case 'weak': return t('passwordStrengthLevels.weak')
      case 'fair': return t('passwordStrengthLevels.fair')
      case 'good': return t('passwordStrengthLevels.good')
      case 'strong': return t('passwordStrengthLevels.strong')
      default: return 'Unknown'
    }
  }
  
  switch (level) {
    case 'very-weak': return 'Very Weak'
    case 'weak': return 'Weak'
    case 'fair': return 'Fair'
    case 'good': return 'Good'
    case 'strong': return 'Strong'
    default: return 'Unknown'
  }
}

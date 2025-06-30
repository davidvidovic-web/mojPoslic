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

// Common passwords to check against
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou',
  'password1', 'qwerty123', '123123', 'dragon', 'sunshine', 'princess',
  'football', 'charlie', 'aa123456', 'donald', 'bailey', 'passw0rd'
]

export function validatePassword(password: string, userInfo?: {
  name?: string
  email?: string
  company?: string
}): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters long',
      met: password.length >= 8,
      severity: 'error'
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
      severity: 'error'
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter (a-z)',
      met: /[a-z]/.test(password),
      severity: 'error'
    },
    {
      id: 'number',
      label: 'Contains number (0-9)',
      met: /\d/.test(password),
      severity: 'error'
    },
    {
      id: 'special',
      label: 'Contains special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      severity: 'warning'
    },
    {
      id: 'length-strong',
      label: 'At least 12 characters (recommended)',
      met: password.length >= 12,
      severity: 'warning'
    },
    {
      id: 'no-common',
      label: 'Not a common password',
      met: !COMMON_PASSWORDS.includes(password.toLowerCase()),
      severity: 'error'
    },
    {
      id: 'no-sequential',
      label: 'No sequential characters (123, abc)',
      met: !hasSequentialChars(password),
      severity: 'warning'
    },
    {
      id: 'no-repeated',
      label: 'No repeated characters (aaa, 111)',
      met: !hasRepeatedChars(password),
      severity: 'warning'
    }
  ]

  // Add personal information checks if userInfo is provided
  if (userInfo) {
    const personalInfoChecks = checkPersonalInfo(password, userInfo)
    requirements.push(...personalInfoChecks)
  }

  // Calculate score based on met requirements
  const errorRequirements = requirements.filter(r => r.severity === 'error')
  const warningRequirements = requirements.filter(r => r.severity === 'warning')
  
  const errorsMet = errorRequirements.filter(r => r.met).length
  const warningsMet = warningRequirements.filter(r => r.met).length
  
  // Base score from critical requirements (60% weight)
  const errorScore = (errorsMet / errorRequirements.length) * 60
  
  // Bonus score from warnings (40% weight)
  const warningScore = (warningsMet / warningRequirements.length) * 40
  
  const score = Math.round(errorScore + warningScore)
  
  // Determine strength level
  let level: PasswordStrength['level']
  if (score < 20) level = 'very-weak'
  else if (score < 40) level = 'weak'
  else if (score < 60) level = 'fair'
  else if (score < 80) level = 'good'
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

function hasSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
  ]
  
  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const subseq = sequence.substring(i, i + 3)
      if (password.toLowerCase().includes(subseq) || 
          password.toLowerCase().includes(subseq.split('').reverse().join(''))) {
        return true
      }
    }
  }
  
  return false
}

function hasRepeatedChars(password: string): boolean {
  // Check for 3 or more repeated characters
  return /(.)\1{2,}/.test(password)
}

function checkPersonalInfo(password: string, userInfo: {
  name?: string
  email?: string
  company?: string
}): PasswordRequirement[] {
  const checks: PasswordRequirement[] = []
  
  if (userInfo.name) {
    const nameParts = userInfo.name.toLowerCase().split(/\s+/)
    const containsName = nameParts.some(part => 
      part.length > 2 && password.toLowerCase().includes(part)
    )
    
    checks.push({
      id: 'no-name',
      label: 'Does not contain your name',
      met: !containsName,
      severity: 'error'
    })
  }
  
  if (userInfo.email) {
    const emailPart = userInfo.email.split('@')[0].toLowerCase()
    const containsEmail = emailPart.length > 2 && password.toLowerCase().includes(emailPart)
    
    checks.push({
      id: 'no-email',
      label: 'Does not contain your email',
      met: !containsEmail,
      severity: 'error'
    })
  }
  
  if (userInfo.company) {
    const companyClean = userInfo.company.toLowerCase().replace(/[^\w]/g, '')
    const containsCompany = companyClean.length > 2 && 
      password.toLowerCase().includes(companyClean)
    
    checks.push({
      id: 'no-company',
      label: 'Does not contain company name',
      met: !containsCompany,
      severity: 'warning'
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
    case 'strong': return 'text-green-500'
    default: return 'text-gray-500'
  }
}

export function getPasswordStrengthBgColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak': return 'bg-red-500'
    case 'weak': return 'bg-orange-500'
    case 'fair': return 'bg-yellow-500'
    case 'good': return 'bg-blue-500'
    case 'strong': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

export function getPasswordStrengthText(level: PasswordStrength['level']): string {
  switch (level) {
    case 'very-weak': return 'Very Weak'
    case 'weak': return 'Weak'
    case 'fair': return 'Fair'
    case 'good': return 'Good'
    case 'strong': return 'Strong'
    default: return 'Unknown'
  }
}

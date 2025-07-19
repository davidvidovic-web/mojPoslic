'use client'

import { useMemo } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthBgColor,
  getPasswordStrengthText,
  type PasswordRequirement
} from '@/lib/password-validation'

interface PasswordStrengthIndicatorProps {
  password: string
  userInfo?: {
    name?: string
    email?: string
  }
  showRequirements?: boolean
  showStrengthBar?: boolean
  className?: string
}

export function PasswordStrengthIndicator({
  password,
  userInfo,
  showRequirements = true,
  showStrengthBar = true,
  className
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations('auth')
  const strength = useMemo(() => {
    if (!password) return null
    return validatePassword(password, userInfo, t)
  }, [password, userInfo, t])

  if (!password || !strength) {
    return null
  }

  const getRequirementIcon = (requirement: PasswordRequirement) => {
    if (requirement.met) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    switch (requirement.severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRequirementTextColor = (requirement: PasswordRequirement) => {
    if (requirement.met) {
      return 'text-green-600 dark:text-green-400'
    }
    
    switch (requirement.severity) {
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      {showStrengthBar && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{t('passwordStrength')}</span>
            <span className={cn('font-medium', getPasswordStrengthColor(strength.level))}>
              {getPasswordStrengthText(strength.level, t)} ({strength.score}%)
            </span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                getPasswordStrengthBgColor(strength.level)
              )}
              style={{ width: `${strength.score}%` }}
            />
          </div>
          
          {!strength.isValid && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t('meetAllCriteria')}
            </p>
          )}
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            {t('passwordRequirements')}
          </h4>
          
          <div className="space-y-1">
            {strength.requirements.map((requirement) => (
              <div key={requirement.id} className="flex items-center gap-2 text-sm">
                {getRequirementIcon(requirement)}
                <span className={getRequirementTextColor(requirement)}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for easy password validation
export function usePasswordValidation(
  password: string, 
  userInfo?: {
    name?: string
    email?: string
  },
  t?: (key: string) => string
) {
  return useMemo(() => {
    if (!password) return null
    return validatePassword(password, userInfo, t)
  }, [password, userInfo, t])
}

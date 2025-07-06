'use client'

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordRequirement {
  label: string
  met: boolean
}

interface PasswordRequirementsProps {
  password: string
  email?: string
  className?: string
}

export function PasswordRequirements({ password, email, className }: PasswordRequirementsProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: "At least 8 characters long",
      met: password.length >= 8
    },
    {
      label: "Contains at least one capital letter",
      met: /[A-Z]/.test(password)
    },
    {
      label: "Contains at least one number",
      met: /\d/.test(password)
    },
    {
      label: "Does not contain your email address",
      met: !email || email.length === 0 || !password.toLowerCase().includes(email.split('@')[0].toLowerCase()) || email.split('@')[0].length <= 2
    }
  ]

  return (
    <div className={cn("space-y-2", className)}>
      {requirements.map((requirement, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors duration-200",
            requirement.met ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-200",
            requirement.met 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-red-100 dark:bg-red-900/30"
          )}>
            {requirement.met ? (
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-3 h-3 text-red-500 dark:text-red-400" />
            )}
          </div>
          <span className={cn(
            "transition-colors duration-200",
            requirement.met ? "font-medium" : "font-normal"
          )}>
            {requirement.label}
          </span>
        </div>
      ))}
    </div>
  )
}

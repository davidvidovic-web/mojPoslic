'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { validateUsernameFormat, generateUsernameSuggestions, checkUsernameAvailability } from '@/lib/username-validation'
import { Check, X, RefreshCw, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  name?: string
  email?: string
  className?: string
  label?: string
  placeholder?: string
  required?: boolean
}

export function UsernameInput({
  value,
  onChange,
  name = '',
  email = '',
  className,
  label = 'Username',
  placeholder = 'Enter your username',
  required = false
}: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Check availability with debounce
  useEffect(() => {
    if (!value) {
      setIsAvailable(null)
      setError(null)
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      // First validate format
      const formatValidation = validateUsernameFormat(value)
      if (!formatValidation.isValid) {
        setError(formatValidation.error || '')
        setIsAvailable(false)
        setIsChecking(false)
        return
      }

      setError(null)
      setIsChecking(true)

      try {
        const available = await checkUsernameAvailability(value)
        setIsAvailable(available)
        
        if (!available) {
          setError('Username is already taken')
          // Generate suggestions if username is taken
          const newSuggestions = generateUsernameSuggestions(name, email)
          setSuggestions(newSuggestions)
          setShowSuggestions(true)
        } else {
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('Error checking username:', error)
        setError('Unable to check username availability')
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [value, name, email])

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const generateNewSuggestions = () => {
    const newSuggestions = generateUsernameSuggestions(name, email)
    setSuggestions(newSuggestions)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="username">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="username"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            placeholder={placeholder}
            className={cn(
              'pl-10 pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
              isAvailable === true && 'border-green-500 focus-visible:ring-green-500'
            )}
            required={required}
          />
          
          {/* Status indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isAvailable === true ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : isAvailable === false ? (
              <X className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}

        {/* Success message */}
        {isAvailable === true && (
          <p className="text-sm text-green-600 mt-1">Username is available!</p>
        )}
      </div>

      {/* Username suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Try these instead:</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateNewSuggestions}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              More
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="h-7 px-3 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CodeInput({ 
  length = 6, 
  value, 
  onChange, 
  onComplete, 
  disabled = false,
  className 
}: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // Split value into array of characters, pad with empty strings
  const values = Array.from({ length }, (_, i) => value[i] || '')

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  useEffect(() => {
    // Call onComplete when all digits are filled
    if (value.length === length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    
    // Create new value array
    const newValues = [...values]
    newValues[index] = digit
    
    // Join and update
    const newValue = newValues.join('')
    onChange(newValue)
    
    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (values[index]) {
        // Clear current input
        const newValues = [...values]
        newValues[index] = ''
        const newValue = newValues.join('')
        onChange(newValue)
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValues = [...values]
        newValues[index - 1] = ''
        const newValue = newValues.join('')
        onChange(newValue)
        setFocusedIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    
    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, length - 1)
    setFocusedIndex(nextIndex)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleClick = (index: number) => {
    setFocusedIndex(index)
    inputRefs.current[index]?.focus()
  }

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onClick={() => handleClick(index)}
          onFocus={() => setFocusedIndex(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-mono font-semibold",
            "border-2 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "transition-colors duration-200",
            values[index] 
              ? "border-primary bg-primary/5" 
              : focusedIndex === index
                ? "border-primary" 
                : "border-border bg-background",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}

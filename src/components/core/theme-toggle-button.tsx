'use client'

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeToggleButtonProps {
  className?: string
  iconClassName?: string
  showLabel?: boolean
  onToggle?: () => void
}

export function ThemeToggleButton({ 
  className = "", 
  iconClassName = "h-6 w-6", 
  showLabel = true,
  onToggle
}: ThemeToggleButtonProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
    onToggle?.()
  }

  if (!mounted) {
    return (
      <div className={`flex items-center ${className}`}>
        <Sun className={`mr-2 ${iconClassName}`} />
        {showLabel && "Theme"}
      </div>
    )
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className={`mr-2 ${iconClassName}`} />
      case 'dark':
        return <Moon className={`mr-2 ${iconClassName}`} />
      default:
        return <Monitor className={`mr-2 ${iconClassName}`} />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Theme'
      case 'dark':
        return 'Dark Theme'
      default:
        return 'System Theme'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center w-full text-left transition-colors ${className}`}
    >
      {getIcon()}
      {showLabel && getLabel()}
    </button>
  )
}

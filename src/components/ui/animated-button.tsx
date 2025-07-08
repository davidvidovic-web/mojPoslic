"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    variant = "default", 
    size = "default", 
    className, 
    ...props 
  }, ref) => {
    const brandClass = variant === "gradient" 
      ? "bg-foreground hover:bg-foreground/90 text-background font-bold border-0 transition-all duration-200" 
      : ""

    return (
      <Button
        ref={ref}
        variant={variant === "gradient" ? "default" : variant}
        size={size}
        className={cn(brandClass, className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

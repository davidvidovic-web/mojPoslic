"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-brand bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}

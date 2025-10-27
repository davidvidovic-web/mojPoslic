'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function BackButton({ 
  variant = 'ghost', 
  size = 'lg', 
  className = 'w-full sm:w-auto',
  children 
}: BackButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => window.history.back()}
      className={className}
    >
      {children || (
        <>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Vrati se nazad
        </>
      )}
    </Button>
  )
}
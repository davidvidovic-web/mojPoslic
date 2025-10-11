'use client'

import { Badge } from '@/components/ui/badge'
import { ApplicationStatus } from '@/types/application'
import { 
  Clock, 
  Eye, 
  Star, 
  CheckCircle, 
  XCircle, 
  X 
} from 'lucide-react'

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  showIcon?: boolean
}

export function ApplicationStatusBadge({ 
  status, 
  showIcon = true 
}: ApplicationStatusBadgeProps) {
  const config = {
    [ApplicationStatus.PENDING]: {
      className: 'bg-yellow-100 text-yellow-800 border-0 rounded-full px-2 py-1 text-xs font-medium',
      icon: Clock,
      label: 'Pending'
    },
    [ApplicationStatus.REVIEWED]: {
      className: 'bg-blue-100 text-blue-800 border-0 rounded-full px-2 py-1 text-xs font-medium',
      icon: Eye,
      label: 'Reviewed'
    },
    [ApplicationStatus.SHORTLISTED]: {
      className: 'bg-purple-100 text-purple-800 border-0 rounded-full px-2 py-1 text-xs font-medium',
      icon: Star,
      label: 'Shortlisted'
    },
    [ApplicationStatus.SELECTED]: {
      className: 'bg-green-100 text-green-800 border-0 rounded-full px-2 py-1 text-xs font-medium',
      icon: CheckCircle,
      label: 'Selected'
    },
    [ApplicationStatus.REJECTED]: {
      className: 'bg-red-100 text-red-800 border-0 rounded-full px-2 py-1 text-xs font-medium',
      icon: XCircle,
      label: 'Rejected'
    },
    [ApplicationStatus.WITHDRAWN]: {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: X,
      label: 'Withdrawn'
    }
  }

  const { className, icon: Icon, label } = config[status]

  return (
    <Badge className={className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  )
}

'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { useTranslations, useLocale } from 'next-intl'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Tag,
  Car,
  User
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import { Job } from "@/types/job"
import { formatJobType, getJobTypeBadgeVariant, formatTransportation, formatClientName } from "@/lib/job-utils"

interface JobHeaderProps {
  job: Job
  formatDate: (dateString: string) => string
  formatSalary: (job: Job) => string | null
}

export function JobHeader({ job, formatDate, formatSalary }: JobHeaderProps) {
  const t = useTranslations('common')
  const locale = useLocale()
  const getTypeVariant = getJobTypeBadgeVariant

  return (
    <Card>
      <CardHeader>
        {/* Responsive header: stack on small screens, row on larger screens */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-16 w-16 sm:h-16 sm:w-16 border">
            {job.postedBy?.avatar_url ? (
              <AvatarImage 
                src={job.postedBy.avatar_url}
                alt={job.postedBy?.name || formatClientName(job.company) || 'User avatar'}
                asChild
              >
                <Image
                  src={job.postedBy.avatar_url}
                  alt={job.postedBy?.name || formatClientName(job.company) || 'User avatar'}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </AvatarImage>
            ) : (
              <AvatarFallback className="text-xl bg-muted">
                {formatClientName(job.company) 
                  ? formatClientName(job.company).charAt(0).toUpperCase()
                  : job.postedBy?.name 
                    ? job.postedBy.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : job.poster_name
                      ? job.poster_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : <User className="h-8 w-8" />
                }
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 w-full">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{formatClientName(job.company)}</p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                <Badge variant={getTypeVariant(job.type)}>
                  {formatJobType(job.type, locale)}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.city?.name || t('jobTypes.remote')}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {job.posted_at ? formatDate(job.posted_at) : ''}
              </div>
              {job.category && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
                </div>
              )}
              {formatSalary(job) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job)}
                </div>
              )}
              {job.transportation && (
                <div className="flex items-center gap-1">
                  <Car className="h-4 w-4" />
                  {formatTransportation(job.transportation, job.transportation_amount)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

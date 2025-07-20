"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  Car,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { Job } from "@/types/job";
import {
  getJobTypeBadgeVariant,
  formatTimeAgo,
} from "@/lib/job-utils";
import { useAuth } from "@/hooks/useAuth";

interface UnifiedJobCardProps {
  job: Job;
}

export function UnifiedJobCard({ job }: UnifiedJobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('jobCard');
  const locale = useLocale();
  const [applicationCount, setApplicationCount] = useState<number | null>(null);

  // Check if the current user owns this job
  const isOwner = user && job.posted_by === user.id;

  // Translation functions for job types, transportation, and duration
  const getTranslatedJobType = (type: string): string => {
    const typeKey = type.replace(/[-_]/g, '').toLowerCase();
    switch (typeKey) {
      case 'fulltime': return t('jobTypes.fullTime');
      case 'parttime': return t('jobTypes.partTime');
      case 'remote': return t('jobTypes.remote');
      case 'quickjob': return t('jobTypes.quickJob');
      case 'contract': return t('jobTypes.contract');
      case 'internship': return t('jobTypes.internship');
      case 'freelance': return t('jobTypes.freelance');
      default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' ');
    }
  };

  const getTranslatedTransportation = (transportation?: string, amount?: number): string | null => {
    if (!transportation) return null;
    
    switch (transportation) {
      case 'provided': return t('transportation.provided');
      case 'not_provided': return t('transportation.notProvided');
      case 'employee_responsible':
      case 'tasker_responsible': return t('transportation.taskerResponsible');
      case 'compensated': 
        return amount ? t('transportation.compensated', { amount }) : t('transportation.compensatedGeneral');
      default: return transportation.charAt(0).toUpperCase() + transportation.slice(1).replace(/_/g, ' ');
    }
  };

  const getTranslatedDuration = (duration?: string): string => {
    if (!duration) return '';
    
    // Check if we have a translation for this duration
    try {
      return t(`duration.${duration}`);
    } catch {
      // Fallback to replacing underscores with spaces
      return duration.replace('_', ' ');
    }
  };

  // Check application count for owner's jobs
  const checkApplicationCount = useCallback(async () => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplicationCount(data.applicationCount || 0);
      }
    } catch (error) {
      console.error("Error checking application count:", error);
    }
  }, [isOwner, job.id]);

  // Load application count when component mounts
  useEffect(() => {
    if (isOwner) {
      checkApplicationCount();
    }
  }, [isOwner, checkApplicationCount]);

  const formatSalary = (job: Job) => {
    // If we have structured salary data
    if (job.salaryMin && job.salaryMax && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const max = job.salaryMax.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? "/hr"
          : job.salaryType === "daily"
            ? "/day"
            : job.salaryType === "weekly"
              ? "/week"
              : job.salaryType === "monthly"
                ? "/month"
                : "";
      return `${min}-${max} BAM${type}`;
    }

    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? "/hr"
          : job.salaryType === "daily"
            ? "/day"
            : job.salaryType === "weekly"
              ? "/week"
              : job.salaryType === "monthly"
                ? "/month"
                : "";
      
      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`;
      }
      
      return `From ${min} BAM${type}`;
    }

    // Fallback to legacy salary field
    return job.salary || null;
  };

  const handleViewDetails = () => {
    router.push(`/jobs/${job.id}`);
  };

  return (
    <Card
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-border/40"
      onClick={handleViewDetails}
    >
      <CardContent className="p-4 space-y-3">
        {/* 1. Posted time - small font */}
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-foreground">
            {job.posted_at ? formatTimeAgo(job.posted_at) : ''}
          </span>
          {/* 7. Amount of people applied - top right for owners */}
          {isOwner && applicationCount !== null && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {applicationCount} applied
            </Badge>
          )}
        </div>

        {/* 2. Title of the post - big font */}
        <h3 className="text-xl font-bold leading-tight line-clamp-2">
          {job.title}
        </h3>

        {/* 3. Location, Payment and Duration - inline on same row */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {/* Location */}
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.city?.name || t('jobTypes.remote')}</span>
          </div>
          
          {/* Payment */}
          {formatSalary(job) && (
            <div className="flex items-center font-medium text-blue-600">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatSalary(job)}
            </div>
          )}

          {/* Duration */}
          {job.duration && (
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {getTranslatedDuration(job.duration)}
            </div>
          )}
        </div>

        {/* 5. Description - normal font with read more button */}
        <div>
          <div
            className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* 6. Bubble tags */}
        <div className="flex flex-wrap gap-2">
          {job.is_featured && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-xs flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </Badge>
          )}
          
          <Badge variant={getJobTypeBadgeVariant(job.type)} className="text-xs">
            {getTranslatedJobType(job.type)}
          </Badge>

          {job.category && (
            <Badge variant="secondary" className="text-xs">
              {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
            </Badge>
          )}

          {job.transportation && job.transportation !== "not_provided" && (
            <Badge variant="outline" className="text-xs">
              <Car className="h-3 w-3 mr-1" />
              {getTranslatedTransportation(job.transportation)}
            </Badge>
          )}
        </div>

        {/* 7. Amount of people applied - for non-owners */}
        {!isOwner && applicationCount !== null && (
          <div className="text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1 inline" />
            {applicationCount} {applicationCount === 1 ? "person" : "people"}{" "}
            applied
          </div>
        )}
      </CardContent>
    </Card>
  );
}

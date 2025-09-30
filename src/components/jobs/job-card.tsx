"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Star,
  Users,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Job } from "@/types/job";
import {
  formatTimeAgo,
} from "@/lib/job-utils";
import { useSupabaseAuth } from '@/contexts/supabase-auth-context';
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import { useJobDetailsDrawer } from "@/hooks/use-job-details-drawer";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveToggle?: (jobId: string, isSaved: boolean) => void;
  hideFeaturedBadge?: boolean;
}

export function JobCard({ job, isSaved = false, onSaveToggle, hideFeaturedBadge = false }: JobCardProps) {
  const { user } = useSupabaseAuth();
  const t = useTranslations('jobCard');
  const locale = useLocale();
  const { openDrawer } = useJobDetailsDrawer();
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isJobSaved, setIsJobSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

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



  // Update saved state when prop changes
  useEffect(() => {
    setIsJobSaved(isSaved);
  }, [isSaved]);

  // Handle save/unsave job
  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      toast.error(t('signInToSave'));
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      if (isJobSaved) {
        // Unsave the job
        const response = await fetch(`/api/user/saved-jobs?jobId=${job.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsJobSaved(false);
          onSaveToggle?.(job.id, false);
          toast.success(t('jobRemovedFromSaved'));
        } else {
          throw new Error(t('failedToUnsaveJob'));
        }
      } else {
        // Save the job
        const response = await fetch('/api/user/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId: job.id }),
        });

        if (response.ok) {
          setIsJobSaved(true);
          onSaveToggle?.(job.id, true);
          toast.success(t('jobSavedSuccessfully'));
        } else {
          throw new Error(t('failedToSaveJob'));
        }
      }
    } catch (error) {
      console.error('Error toggling job save:', error);
      toast.error(t('jobPost.errors.somethingWentWrong'));
    } finally {
      setIsSaving(false);
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
          ? t('hourly')
          : job.salaryType === "daily"
            ? t('daily')
            : job.salaryType === "weekly"
              ? t('weekly')
              : job.salaryType === "monthly"
                ? t('monthly')
                : "";
      return `${min}-${max} BAM${type}`;
    }

    // If we only have minimum salary
    if (job.salaryMin && job.salaryType) {
      const min = job.salaryMin.toLocaleString();
      const type =
        job.salaryType === "hourly"
          ? t('hourly')
          : job.salaryType === "daily"
            ? t('daily')
            : job.salaryType === "weekly"
              ? t('weekly')
              : job.salaryType === "monthly"
                ? t('monthly')
                : "";

      // Don't show "From" for fixed prices
      if (job.salaryType === 'fixed') {
        return `${min} BAM`;
      }
      
      return `${t('from')} ${min} BAM${type}`;
    }

    // Fallback to legacy salary field
    return job.salary || null;
  };

  const handleViewDetails = () => {
    openDrawer(job.id);
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFullDescription(!showFullDescription);
  };

  // Strip HTML tags and get plain text for description
  const getPlainTextDescription = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const plainDescription = getPlainTextDescription(job.description);
  const shouldTruncate = plainDescription.length > 150;

  return (
    <Card
      className="group cursor-pointer border-0 bg-white dark:bg-gray-950 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
      onClick={handleViewDetails}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="relative p-6 space-y-4">
        {/* Time Posted (12px font) */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground" style={{ fontSize: '12px' }}>
            {t('timePosted')} {job.posted_at ? formatTimeAgo(job.posted_at) : ''}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Save button for non-owners and taskers only */}
            {!isOwner && user && user.role === 'tasker' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="h-8 w-8 p-0 rounded-[var(--radius)] hover:bg-primary/10 transition-colors opacity-60 group-hover:opacity-100"
              >
                {isJobSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </Button>
            )}
            {/* Application count for owners */}
            {isOwner && applicationCount !== null && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-[var(--radius)]">
                <Users className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">{applicationCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {job.title}
        </h3>

        {/* Payment Type - Payment Amount */}
        {formatSalary(job) && (
          <div className="text-sm font-medium text-green-600">
            {getTranslatedJobType(job.type || 'quick_job')} - {formatSalary(job)} KM
          </div>
        )}

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {plainDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={toggleDescription}
              className="text-xs text-primary hover:text-primary/80 mt-2 font-medium transition-colors"
            >
              {showFullDescription ? t('readLess') : t('readMore')}
            </button>
          )}
        </div>

        {/* Category and Subcategory Bubbles */}
        <div className="flex flex-wrap gap-2">
          {job.is_featured && !hideFeaturedBadge && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-50 text-xs px-2.5 py-1 rounded-[var(--radius)] border-0">
              <Star className="h-3 w-3 fill-current mr-1" />
              {t('featured')}
            </Badge>
          )}

          {job.category && (
            <Badge variant="secondary" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border-0 bg-black dark:bg-white text-white dark:text-black">
              {locale === 'bs' ? job.category.name_bs || job.category.name : job.category.name_en || job.category.name}
            </Badge>
          )}

          {job.subcategory && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
              {locale === 'bs' ? job.subcategory.name_bs || job.subcategory.name : job.subcategory.name_en || job.subcategory.name}
            </Badge>
          )}

          {job.transportation && (
            <Badge variant="outline" className="text-xs px-2.5 py-1 rounded-[var(--radius)] border border-gray-200 dark:border-gray-700">
              <Car className="h-3 w-3 mr-1.5" />
              {getTranslatedTransportation(
                job.transportation,
                job.transportation_amount
              )}
            </Badge>
          )}
        </div>

        {/* Views and Applications */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{job.view_count || 0} {(job.view_count || 0) === 1 ? (t('view') || 'view') : (t('views') || 'views')}</span>
          <span>{job.application_count || 0} {(job.application_count || 0) === 1 ? (t('application') || 'application') : (t('applications') || 'applications')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

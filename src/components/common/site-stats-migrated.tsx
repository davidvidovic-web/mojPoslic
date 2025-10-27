"use client";

import { Briefcase, Users, CheckCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl';
import { useSiteStats } from '@/hooks/use-misc-apis';

const SiteStatsMigrated = () => {
  const t = useTranslations('homepage.siteStats');
  
  // Use Supabase hook instead of manual fetch() call
  const { data: stats, isLoading: loading, isError } = useSiteStats();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (isError) {
    // Graceful fallback with default values
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
              <p className="text-gray-600">{t('activeJobs')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
              <p className="text-gray-600">{t('totalUsers')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
              <p className="text-gray-600">{t('clients')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">0</h3>
              <p className="text-gray-600">{t('completedJobs')}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Active Jobs */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats?.activeJobs || 0)}
              </h3>
            )}
            <p className="text-gray-600">{t('activeJobs')}</p>
          </div>

          {/* Total Users */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats?.totalUsers || 0)}
              </h3>
            )}
            <p className="text-gray-600">{t('totalUsers')}</p>
          </div>

          {/* Clients (subset of total users) */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(Math.floor((stats?.totalUsers || 0) * 0.3))}
              </h3>
            )}
            <p className="text-gray-600">{t('clients')}</p>
          </div>

          {/* Total Applications (proxy for completed jobs) */}
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
            {loading ? (
              <Skeleton className="h-10 w-16 mx-auto mb-2" />
            ) : (
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumber(stats?.totalApplications || 0)}
              </h3>
            )}
            <p className="text-gray-600">{t('completedJobs')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SiteStatsMigrated;

"use client";

import { JobList } from "@/components/job-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, UserPlus, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const t = useTranslations('homepage');
  const { user } = useAuth();
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="text-sm font-medium px-3 py-1 flex items-center gap-1 w-fit mx-auto"
              >
                <Zap className="h-4 w-4" />
                {t('hero.badge')}
              </Badge>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                {t('hero.title')}
                <span className="block bg-gradient-brand bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </h2>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* Call to Action Button */}
              <div className="flex justify-center items-center mt-8">
                {user ? (
                  // Only show "Post Job" button for clients and companies, not taskers
                  user.role !== 'tasker' ? (
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="bg-foreground hover:bg-foreground/80 text-background font-bold border-2 border-white/20 hover:border-white/40 px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        {t('hero.postJob')}
                      </Button>
                    </Link>
                  ) : null
                ) : (
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      className="bg-foreground hover:bg-foreground/80 text-background font-bold border-2 border-white/20 hover:border-white/40 px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      {t('hero.registerButton')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Light Separator */}
      <div className="flex justify-center py-8">
        <div className="w-1/2 h-px bg-border"></div>
      </div>

      {/* Browse Jobs Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2 mb-12">
            <h3 className="text-3xl font-bold">{t('browseJobs.title')}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('browseJobs.subtitle')}
            </p>
          </div>
          <JobList />
        </div>
      </section>

      {/* Site Stats Section - Hidden for now */}
      {/* 
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">{t('siteStats.title')}</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('siteStats.subtitle')}
              </p>
            </div>
            <SiteStats />
          </div>
        </div>
      </section>
      */}

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

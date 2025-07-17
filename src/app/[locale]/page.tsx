"use client";

import { JobList } from "@/components/job-list";
import SiteStats from "@/components/common/site-stats";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Zap, UserPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('homepage');
  
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
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-foreground hover:bg-foreground/80 text-background font-bold border-2 border-white/20 hover:border-white/40 px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {t('hero.registerButton')}
                  </Button>
                </Link>
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

      {/* Site Stats Section */}
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

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className="font-bold">mojPoslić</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('footer.description')}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('footer.forWorkers.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forWorkers.findJobs')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forWorkers.dailyWork')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forWorkers.hourlyJobs')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('footer.forClients.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forClients.postJobs')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forClients.findWorkers')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.forClients.free')}
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t('footer.company.title')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.company.about')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.company.contact')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('footer.company.privacy')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-default-600">
            <p>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

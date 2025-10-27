"use client";

import { JobList } from "@/components/job-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, UserPlus, Plus, MapPin, Users, Briefcase } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { useSupabaseAuth } from '@/contexts/supabase-auth-context';
import { useDialogStore } from '@/stores/dialog-store';

export default function Home() {
  const t = useTranslations('homepage');
  const { user } = useSupabaseAuth();
  const { openJobPostDialog } = useDialogStore();
  
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
                    <Button
                      size="lg"
                      onClick={() => openJobPostDialog()}
                      className="bg-foreground hover:bg-foreground/80 text-background font-bold border-2 border-white/20 hover:border-white/40 px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t('hero.postJob')}
                    </Button>
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

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">{t('features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Digitalna platforma koja olakšava povezivanje poslodavaca i radnika u BiH
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Objavljuj oglase</h3>
              <p className="text-muted-foreground">Jednostavno kreiraj i objavi oglase za posao kroz našu platformu</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Aplikacije u realnom vremenu</h3>
              <p className="text-muted-foreground">Apliciraj na poslove i prati status aplikacija u realnom vremenu</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Direktno komuniciranje</h3>
              <p className="text-muted-foreground">Porukuj direktno sa poslodavcima ili radnicima kroz platformu</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Sistem konekcija</h3>
              <p className="text-muted-foreground">Upravljaj aplikacijama i kontaktima kroz naš jedinstveni sistem konekcija</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">{t('browseJobs.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('browseJobs.subtitle')}
            </p>
          </div>
          <JobList />
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Kako funkcioniše platforma</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jednostavan proces za povezivanje poslodavaca i radnika kroz našu digitalnu platformu
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">�</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      1. Registracija
                    </h3>
                    <p className="text-sm text-muted-foreground">Kreiraj profil i odaberi da li tražiš ili nudiš posao</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link href="/jobs" className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">�</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      2. Pretraži
                    </h3>
                    <p className="text-sm text-muted-foreground">Pregledaj dostupne oglase ili objavi svoj posao</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      3. Komuniciraj
                    </h3>
                    <p className="text-sm text-muted-foreground">Direktno kontaktiraj putem integriranog sistema poruka</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      4. Aplikacija
                    </h3>
                    <p className="text-sm text-muted-foreground">Apliciraj na oglase koristeći konekcije iz računa</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">🤝</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      5. Upravljanje
                    </h3>
                    <p className="text-sm text-muted-foreground">Upravljaj aplikacijama, porukama i profilom kroz dashboard</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link href="/dashboard" className="group">
              <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      6. Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">Praćenje svih aktivnosti i statistika na jednom mjestu</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Platforma dostupna u glavnim gradovima</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pregledaj poslove iz različitih gradova BiH ili objavi oglase za svoju lokaciju
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/jobs?city=sarajevo" className="group">
              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold group-hover:text-primary transition-colors">Sarajevo</h3>
                <p className="text-sm text-muted-foreground">Aktivna platforma</p>
              </div>
            </Link>
            
            <Link href="/jobs?city=banja-luka" className="group">
              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold group-hover:text-primary transition-colors">Banja Luka</h3>
                <p className="text-sm text-muted-foreground">Dostupno za oglase</p>
              </div>
            </Link>
            
            <Link href="/jobs?city=tuzla" className="group">
              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold group-hover:text-primary transition-colors">Tuzla</h3>
                <p className="text-sm text-muted-foreground">Tuzlanski kanton</p>
              </div>
            </Link>
            
            <Link href="/jobs?city=mostar" className="group">
              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold group-hover:text-primary transition-colors">Mostar</h3>
                <p className="text-sm text-muted-foreground">Hercegovačko-neretvanski kanton</p>
              </div>
            </Link>
          </div>
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
    </>
  );
}

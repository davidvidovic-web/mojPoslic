import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common/back-button';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Stranica nije pronađena - 404 | mojPoslić',
  description: 'Stranica koju tražite nije pronađena. Vratite se na početnu stranicu i pregledajte dostupne oglase za posao na našoj platformi.',
  robots: 'noindex,nofollow'
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* 404 Number */}
          <div className="text-8xl font-bold text-muted-foreground">404</div>
          
          {/* Headings */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Stranica nije pronađena</h1>
            <p className="text-xl text-muted-foreground">
              Izgleda da je stranica koju tražite uklonjena, preimenovana ili možda nikad nije ni postojala.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="h-5 w-5 mr-2" />
                Početna stranica
              </Button>
            </Link>
            
            <Link href="/jobs">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="h-5 w-5 mr-2" />
                Pretraži poslove
              </Button>
            </Link>
            
            <BackButton />
            
          </div>

          {/* Popular Links */}
          <div className="pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Popularne sekcije platforme</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/jobs?category=majstorski-radovi" className="text-primary hover:underline">
                Majstorski radovi
              </Link>
              <Link href="/jobs?category=selidbe-transport" className="text-primary hover:underline">
                Selidbe i transport
              </Link>
              <Link href="/jobs?category=ciscenje-odrzavanje" className="text-primary hover:underline">
                Čišćenje i održavanje
              </Link>
              <Link href="/jobs?category=dostava-kupovina" className="text-primary hover:underline">
                Dostava i kupovina
              </Link>
              <Link href="/jobs?city=sarajevo" className="text-primary hover:underline">
                Oglasi Sarajevo
              </Link>
              <Link href="/jobs?city=banja-luka" className="text-primary hover:underline">
                Oglasi Banja Luka
              </Link>
              <Link href="/jobs?city=tuzla" className="text-primary hover:underline">
                Oglasi Tuzla
              </Link>
              <Link href="/jobs?city=mostar" className="text-primary hover:underline">
                Pomoć Mostar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
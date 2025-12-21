import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

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
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg">
                <Home className="h-5 w-5 mr-2" />
                Početna stranica
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
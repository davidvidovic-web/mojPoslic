import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import Script from "next/script";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "mojPoslić - Platforma za povezivanje poslodavaca i radnika u BiH",
    template: "%s | mojPoslić"
  },
  description: "Digitalna platforma koja povezuje poslodavce sa radnicima u BiH. Objavite oglase za posao, aplicirajte na pozicije, direktno komunicirajte i upravljajte aplikacijama kroz naš sistem konekcija.",
  keywords: [
    "platforma za poslove BiH",
    "oglasi za posao",
    "aplikacije za posao", 
    "direktno porukovanje",
    "sistem konekcija",
    "upravljanje aplikacijama",
    "profil radnika",
    "objavljuj oglase",
    "fleksibilna platforma",
    "posao Sarajevo",
    "posao Banja Luka",
    "posao Tuzla",
    "posao Mostar",
    "digitalna platforma BiH",
    "freelance BiH",
    "online posao",
    "radne prilike",
    "job board BiH"
  ],
  authors: [{ name: "mojPoslić Tim" }],
  creator: "mojPoslić",
  publisher: "mojPoslić",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mojposlic.com'),
  alternates: {
    canonical: '/',
    languages: {
      'bs-BA': '/',
      'en': 'https://en.mojposlic.com'
    }
  },
  openGraph: {
    title: "mojPoslić - Platforma za povezivanje poslodavaca i radnika u BiH",
    description: "Digitalna platforma koja povezuje poslodavce sa radnicima u BiH. Objavite oglase, aplicirajte na pozicije i komunicirajte direktno kroz naš sistem konekcija.",
    url: 'https://mojposlic.com',
    siteName: 'mojPoslić',
    locale: 'bs_BA',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'mojPoslić - Platforma za povezivanje poslodavaca i radnika u BiH'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "mojPoslić - Platforma za povezivanje poslodavaca i radnika u BiH",
    description: "Digitalna platforma koja povezuje poslodavce sa radnicima u BiH. Objavite oglase, aplicirajte na pozicije i komunicirajte direktno kroz naš sistem konekcija.",
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get messages for the default locale (Bosnian)
  const messages = await getMessages({ locale: 'bs' });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'mojPoslić',
    description: 'Digitalna platforma koja povezuje poslodavce i radnike u Bosni i Hercegovini kroz sistem oglasa i aplikacija.',
    url: 'https://mojposlic.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mojposlic.com/jobs?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'bs-BA',
    about: {
      '@type': 'Organization',
      name: 'mojPoslić',
      url: 'https://mojposlic.com',
      logo: 'https://mojposlic.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Bosnian', 'Croatian', 'Serbian']
      },
      areaServed: {
        '@type': 'Country',
        name: 'Bosnia and Herzegovina'
      }
    }
  }

  return (
    <html lang="bs-BA" className={manrope.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="geo.region" content="BA" />
        <meta name="geo.country" content="Bosnia and Herzegovina" />
        <meta name="geo.placename" content="Sarajevo" />
        <link rel="canonical" href="https://mojposlic.com" />
        <link rel="alternate" hrefLang="bs-BA" href="https://mojposlic.com" />
        <link rel="alternate" hrefLang="en" href="https://en.mojposlic.com" />
        <link rel="alternate" hrefLang="x-default" href="https://mojposlic.com" />
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  content_group1: 'Jobs Platform'
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages} locale="bs">
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

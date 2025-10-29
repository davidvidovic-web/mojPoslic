import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mojposlic.com'),
  title: "mojPoslić - Platforma za male poslove | Prijava, Registracija, Dokumentacija",
  description: "Brza platforma za male poslove u BiH. Pronađite radnike ili poslove za kratak rad, dnevne zadatke i privremene usluge. Direktna komunikacija, brza aplikacija i sigurno plaćanje.",
  keywords: [
    "mali poslovi BiH",
    "kratki poslovi Bosna",
    "dnevni poslovi",
    "privremeni rad",
    "brzi poslovi",
    "male usluge",
    "pomoć kod kuće",
    "majstorski radovi",
    "dostava BiH",
    "čišćenje kuće",
    "baštenske usluge",
    "selidbe transport",
    "student poslovi",
    "honorarni posao",
    "vikend posao",
    "posao po satu BiH",
    "freelance usluge",
    "kratkoročni rad",
    "zadaci po potrebi",
    "brza zarada BiH",
    "posao Sarajevo",
    "posao Mostar", 
    "posao Banja Luka",
    "posao Tuzla",
    "platforma za poslove"
  ],
  authors: [{ name: "mojPoslić Team" }],
  creator: "mojPoslić",
  publisher: "mojPoslić",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    alternateLocale: ['en_US'],
    url: 'https://mojposlic.com',
    siteName: 'mojPoslić',
    title: 'mojPoslić - Platforma za male poslove',
    description: 'Brza platforma za male poslove u BiH. Pronađite radnike za kratke zadatke ili posao po satu. Majstorski radovi, dostava, čišćenje i više.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'mojPoslić - Platforma za male poslove u BiH',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mojPoslić - Platforma za male poslove',
    description: 'Brza platforma za male poslove u BiH. Majstorski radovi, dostava, čišćenje - sve na jednom mjestu.',
    images: ['/og-image.jpg'],
    creator: '@mojposlic',
  },
  alternates: {
    canonical: 'https://mojposlic.com',
    languages: {
      'bs-BA': 'https://mojposlic.com',
      'en-US': 'https://en.mojposlic.com',
    },
  },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    'yandex-verification': process.env.YANDEX_VERIFICATION || '',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get messages for the default locale (Bosnian)
  const messages = await getMessages({ locale: 'bs' });

  return (
    <html lang="bs" className={manrope.variable} suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        
        {/* Preconnect for critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Viewport and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="mojPoslić" />
        
        {/* Language and geographic targeting */}
        <meta name="language" content="Bosnian" />
        <meta name="geo.region" content="BA" />
        <meta name="geo.country" content="Bosnia and Herzegovina" />
        <meta name="geo.placename" content="Bosnia and Herzegovina" />
        <meta name="ICBM" content="43.9159,17.6791" />
        
        {/* Theme colors for different browsers */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        
        {/* Business and contact information */}
        <meta name="contact" content="info@mojposlic.com" />
        <meta name="category" content="Small Jobs,Gig Economy,Freelance,Tasks,Services" />
        <meta name="coverage" content="Bosnia and Herzegovina" />
        <meta name="distribution" content="Local" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="1 days" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="subject" content="Mali poslovi, kratki zadaci, usluge po potrebi" />
        <meta name="classification" content="Gig Economy Platform" />
        
        {/* Performance and security hints */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <link rel="canonical" href="https://mojposlic.com" />
        
        {/* Resource hints for critical resources */}
        <link rel="prefetch" href="/api/jobs" />
        <link rel="prefetch" href="/api/static/cities" />
        <link rel="prefetch" href="/api/static/categories" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "mojPoslić",
              "alternateName": "mojPoslic",
              "url": "https://mojposlic.com",
              "logo": "https://mojposlic.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "info@mojposlic.com",
                "contactType": "customer service",
                "areaServed": "BA",
                "availableLanguage": ["bs", "en"]
              },
              "knowsAbout": [
                "Mali poslovi",
                "Kratki zadaci",
                "Majstorski radovi",
                "Dostava usluge",
                "Čišćenje kuće",
                "Baštenske usluge",
                "Gig economy"
              ],
              "serviceType": "Gig Economy Platform",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BA",
                "addressRegion": "Bosnia and Herzegovina"
              },
              "sameAs": [
                "https://en.mojposlic.com"
              ]
            })
          }}
        />
        
        {/* JobPosting Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "mojPoslić",
              "alternateName": "mojPoslic",
              "url": "https://mojposlic.com",
              "description": "Platforma za male poslove u Bosni i Hercegovini. Brzi poslovi, kratki zadaci, majstorski radovi i usluge po potrebi.",
              "inLanguage": "bs-BA",
              "isAccessibleForFree": true,
              "potentialAction": [
                {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://mojposlic.com/jobs?search={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              ],
              "mainEntity": {
                "@type": "JobBoard",
                "name": "mojPoslić",
                "description": "Platforma za male poslove i kratke zadatke u BiH",
                "url": "https://mojposlic.com"
              }
            })
          }}
        />

        {/* Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "mojPoslić",
              "image": "https://mojposlic.com/logo.png",
              "url": "https://mojposlic.com",
              "description": "Platforma za male poslove u Bosni i Hercegovini",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BA",
                "addressRegion": "Bosnia and Herzegovina"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 43.9159,
                "longitude": 17.6791
              },
              "areaServed": {
                "@type": "Country",
                "name": "Bosnia and Herzegovina"
              },
              "availableLanguage": ["bs", "en"],
              "serviceType": "Employment Services",
              "priceRange": "Free"
            })
          }}
        />

        {/* Sitelinks Search Box Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "mojPoslić",
              "url": "https://mojposlic.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://mojposlic.com/jobs?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Sitelinks Structured Data for Navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": [
                {
                  "@type": "SiteNavigationElement",
                  "position": 1,
                  "name": "Prijava",
                  "description": "Prijavite se na svoj mojPoslić račun",
                  "url": "https://mojposlic.com/auth/signin"
                },
                {
                  "@type": "SiteNavigationElement", 
                  "position": 2,
                  "name": "Registracija",
                  "description": "Kreirajte novi račun na mojPoslić platformi",
                  "url": "https://mojposlic.com/auth/register"
                },
                {
                  "@type": "SiteNavigationElement",
                  "position": 3,
                  "name": "Dokumentacija",
                  "description": "Kompletna dokumentacija za korišćenje platforme",
                  "url": "https://mojposlic.com/dokumentacija"
                },
                {
                  "@type": "SiteNavigationElement",
                  "position": 4,
                  "name": "Podrška",
                  "description": "Kontaktirajte naš tim podrške za pomoć",
                  "url": "https://mojposlic.com/podrska"
                }
              ]
            })
          }}
        />

        {/* FAQ Structured Data for Small Jobs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Što su mali poslovi?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mali poslovi su kratki zadaci i usluge koje možete završiti brzo - od nekoliko sati do nekoliko dana. Uključuju majstorske radove, dostavu, čišćenje, baštenske usluge i slično."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "Kako funkcioniše platforma za male poslove?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Klijenti objavljuju male poslove, radnici aplicitaju, direktno komunicirate i dogovarate detalje. Jednostavno, brzo i sigurno."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Kakve vrste malih poslova mogu pronaći?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Majstorski radovi, čišćenje kuće, dostava, baštenske usluge, selidbe, IT pomoć, kreativne usluge i mnoge druge kratke zadatke."
                  }
                }
              ]
            })
          }}
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
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
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

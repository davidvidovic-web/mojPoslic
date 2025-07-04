import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "mojPoslić - Find Your Dream Job",
  description: "mojPoslić - A modern job board for Bosnia and Herzegovina built with Next.js, shadcn/ui, and Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z17WLM3N7R"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z17WLM3N7R');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <Providers>
            <div className="min-h-screen bg-background">
            <Toaster 
              position="top-right" 
              richColors
              closeButton
              duration={4000}
              theme="system"
              toastOptions={{
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                className: 'toast-custom',
              }}
            />
            <Header />
            {children}
          </div>
        </Providers>
      </SessionProvider>
    </body>
  </html>
  );
}

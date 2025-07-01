import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Poslić - Find Your Dream Job",
  description: "Poslić - A modern job board for Bosnia and Herzegovina built with Next.js, shadcn/ui, and Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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
      </body>
    </html>
  );
}

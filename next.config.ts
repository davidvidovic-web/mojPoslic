import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecaukelsfokqzgvhonrk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Output file tracing for Vercel deployment
  outputFileTracingRoot: __dirname,
  
  // Generate static pages for better SEO
  trailingSlash: false,
};

export default withNextIntl(nextConfig);

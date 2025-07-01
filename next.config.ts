import type { NextConfig } from "next";

// Load environment variables during build
// This ensures Stripe and other services have access to environment variables
import dotenv from 'dotenv';

// Try to load .env.local first, then fall back to .env
try {
  console.log('Loading environment variables for Next.js...');
  const result = dotenv.config({ path: '.env.local' });
  if (result.error) {
    console.log('No .env.local file found, trying .env');
    dotenv.config();
  }
  
  // Check if Stripe secret key is loaded
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('✓ Stripe configuration loaded successfully');
  } else {
    console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
}

const nextConfig: NextConfig = {
  env: {
    // Expose these server-side variables to the client
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  /* other config options here */
};

export default nextConfig;

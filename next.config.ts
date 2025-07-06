import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_PUBLISHABLE_KEY ||
      "",
  },
};

export default nextConfig;

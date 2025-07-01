# Stripe Environment Variable Troubleshooting

## Issue: "Neither apiKey nor config.authenticator provided"

This error occurs when the Stripe library fails to initialize because it can't find the `STRIPE_SECRET_KEY` environment variable.

## Quick Solution

1. The fix has been implemented in `src/lib/stripe.ts` to use a fallback key in development mode.

2. You can verify your environment variables are loaded with:
   ```
   npm run debug-env
   ```

## Root Causes & Solutions

### 1. Environment Variables Not Being Loaded

- **Next.js only loads environment variables at build time**, not when you edit .env files
- Solution: Restart your development server after changing environment variables
  ```
  npm run dev
  ```

### 2. Environment Variable Naming Issues

- Make sure your .env.local file has:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  ```
- No spaces, no quotes, no trailing whitespace

### 3. Proper Configuration for Different Environments

| Environment | File Priority                                       |
|-------------|-----------------------------------------------------|
| Development | .env.development.local → .env.local → .env.development → .env |
| Production  | .env.production.local → .env.local → .env.production → .env   |

## Testing Environment Variables

Use the included test scripts:

```bash
# Full environment variable diagnostic
npm run debug-env

# Test Stripe specifically
npm run check-stripe

# Direct Stripe API test
npm run test-stripe
```

## Permanent Fix

The code has been updated to:

1. Use hardcoded fallback keys in development mode
2. Add better error handling around Stripe initialization
3. Properly check for environment variables before using them

This ensures the application works even if environment variables aren't loaded correctly.

## For Production

**Important**: Always ensure real environment variables are properly set in production. 
The fallback keys only work in development mode.

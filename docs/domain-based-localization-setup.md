# Domain-Based Localization Setup

## Configuration Overview

The application is now configured for domain-based localization:

- **Main domain** (e.g., `yourdomain.com`): Bosnian (bs) - Default language
- **English subdomain** (e.g., `en.yourdomain.com`): English (en)

## Development Setup

### 1. Local Development with Subdomains

For local development, you'll need to set up local subdomains:

1. **Edit your hosts file** (`/etc/hosts` on macOS/Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows):
   ```
   127.0.0.1 localhost
   127.0.0.1 en.localhost
   ```

2. **The routing is already configured** in `src/i18n/routing.ts` for development:
   ```typescript
   domains: [
     {
       domain: 'en.localhost:3000', // For development
       defaultLocale: 'en',
       locales: ['en']
     }
   ]
   ```

3. **Start your development server**:
   ```bash
   npm run dev
   ```

4. **Access your application**:
   - **Bosnian (default)**: `http://localhost:3000` → Clean URLs like `localhost:3000/dashboard`
   - **English**: `http://en.localhost:3000` → Clean URLs like `en.localhost:3000/dashboard`

**✅ No more `/bs/` or `/en/` in URLs!**

### 2. Production Setup

For production, update `src/i18n/routing.ts`:

```typescript
domains: [
  {
    domain: 'en.yourdomain.com', // Replace with your actual English subdomain
    defaultLocale: 'en',
    locales: ['en']
  }
]
```

## DNS Configuration

Set up your DNS records:

1. **A Record**: `yourdomain.com` → Your server IP
2. **CNAME Record**: `en.yourdomain.com` → `yourdomain.com`

Or if using a CDN like Cloudflare:

1. **A Record**: `yourdomain.com` → Your server IP
2. **A Record**: `en.yourdomain.com` → Your server IP

## Environment Variables

No additional environment variables are required for domain-based routing.

## Deployment Considerations

### Vercel
- Add both domains in your Vercel project settings
- Vercel will automatically handle the subdomain routing

### Other Platforms
- Ensure your hosting platform supports wildcard domains or add both domains explicitly
- Configure SSL certificates for both domains

## Testing

Test both domains:
- `yourdomain.com/dashboard` → Should display in Bosnian
- `en.yourdomain.com/dashboard` → Should display in English

## Language Switcher

The language switcher component will need to redirect between domains:
- From Bosnian site → Redirect to `en.yourdomain.com`
- From English site → Redirect to `yourdomain.com`

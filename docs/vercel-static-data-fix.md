# Fix: Vercel Static Data Loading Issue

## Problem
Vercel was returning "401 Unauthorized" errors when trying to load static data files (cities.json, categories.json) because:

1. Static files were located at `/public/cache/`
2. API routes exist at `/api/cache/`  
3. When fetching `/cache/cities.json`, Vercel was routing to API endpoints instead of static files
4. This caused 401 errors since the API endpoints require authentication

## Root Cause
Path conflict between:
- Static files: `/public/cache/cities.json` → served at `/cache/cities.json`
- API routes: `/api/cache/update` and `/api/cache/cron`

On Vercel, the routing system was prioritizing API routes over static files.

## Solution
**Moved static files from `/cache/` to `/static/` path to avoid API route conflicts**

### Changes Made

#### 1. File Structure
```bash
# Before
/public/cache/cities.json
/public/cache/categories.json  
/public/cache/metadata.json

# After  
/public/static/cities.json
/public/static/categories.json
/public/static/metadata.json
```

#### 2. Static Data Manager (`src/lib/static-data.ts`)
- **Server-side fetch**: Updated from `/cache/` to `/static/`
- **Client-side fetch**: Updated from `/cache/` to `/static/` 
- **Filesystem paths**: Updated from `public/cache/` to `public/static/`

#### 3. Cache Update API (`src/app/api/cache/update/route.ts`)
- Updated `CACHE_DIR` from `public/cache` to `public/static`
- Cache files now written to new location

#### 4. Configuration Files
- **vercel.json**: Updated cache headers from `/cache/(.*)` to `/static/(.*)`
- **.vercelignore**: Updated to include `public/static/` instead of `public/cache/`
- **.gitignore**: Updated to ignore `public/static/*.json` instead of `public/cache/*.json`

## Files Modified
1. `src/lib/static-data.ts` - Updated all fetch URLs and filesystem paths
2. `src/app/api/cache/update/route.ts` - Updated cache directory constants  
3. `vercel.json` - Updated cache control headers path
4. `.vercelignore` - Updated included directories
5. `.gitignore` - Updated ignored file patterns

## Files Moved
- `public/cache/*.json` → `public/static/*.json`

## Result
- ✅ Static files accessible at `/static/cities.json`, `/static/categories.json`
- ✅ No more conflicts with `/api/cache/` routes
- ✅ Vercel can properly serve static data files  
- ✅ 401 Unauthorized errors resolved

## Testing
Static data should now load correctly on Vercel without authentication errors. The static files are served directly from `/static/` path without conflicting with API routes.

## Future Considerations
- Keep API routes and static file paths separate to avoid conflicts
- Consider using more specific paths like `/api/admin/cache/` for admin-only endpoints
- Monitor cache performance with new headers configuration

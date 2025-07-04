# Connections System - Automatic Monthly Refresh

## Overview

The connections system has been updated to use automatic monthly refresh instead of manual refresh. Users now receive 10 connections automatically on the 1st of each month.

## Changes Made

### 1. Removed Manual Refresh
- ❌ **Removed**: Manual refresh button from header connections display
- ❌ **Deprecated**: `/api/user/connections/refresh` endpoint (now returns deprecation notice)
- ✅ **Added**: Automatic monthly refresh system

### 2. Updated UI
- **Header**: Removed connections badge from header for cleaner UI
- **Dashboard**: Added dedicated connections section in user dashboards
- **Location**: Connections now appear in right sidebar of dashboards

### 3. Automatic Refresh System

#### How It Works
- Users receive 10 connections on the 1st of each month automatically
- No user action required
- Process runs via cron job or scheduled function
- Failed refreshes are logged and can be retried

#### Implementation Options

##### Option 1: Cron Job (Traditional Server)
```bash
# Add to crontab - runs at 00:01 on the 1st of every month
1 0 1 * * cd /path/to/mojposlic && npm run monthly-refresh
```

##### Option 2: Serverless Cron (Vercel, Netlify, etc.)
```bash
# Call the API endpoint on schedule
curl -X POST https://your-domain.com/api/admin/monthly-refresh \
  -H "Authorization: Bearer YOUR_CRON_API_KEY"
```

##### Option 3: Manual Trigger
```bash
# Manual execution for testing or emergency refresh
npm run monthly-refresh
```

### 4. API Endpoints

#### `/api/admin/monthly-refresh`
- **Method**: `POST` - Trigger automatic refresh for all eligible users
- **Method**: `GET` - Check if refresh should run today
- **Auth**: Optional API key via `CRON_API_KEY` environment variable
- **Returns**: Summary of refresh results

#### `/api/user/connections/refresh` (Deprecated)
- **Status**: `410 Gone` - Returns deprecation notice
- **Purpose**: Backward compatibility for existing clients

### 5. Environment Variables

Add to your `.env.local`:
```bash
# Optional: API key for cron job authentication
CRON_API_KEY=your-secure-random-key-here
```

### 6. Database Schema

No changes required - uses existing:
- `users.connections` - Current connection count
- `users.connections_last_refresh` - Last refresh timestamp
- `connection_history` - Transaction history

## User Experience

### Before (Manual)
1. User sees low connections warning
2. User clicks "Refresh" button (if available)
3. System checks if month passed
4. Adds 10 connections if eligible
5. Shows success/error message

### After (Automatic)
1. System automatically runs on 1st of month
2. All eligible users get 10 connections
3. Users see updated balance in dashboard
4. No action required from users
5. Clean, simple UI without manual controls

## Benefits

1. **Better UX**: No confusing refresh buttons or manual steps
2. **Reliable**: Automatic refresh prevents users from forgetting
3. **Scalable**: Handles all users at once efficiently
4. **Clean UI**: Simpler interface without manual controls
5. **Predictable**: Users know exactly when refresh happens

## Migration Notes

- Existing users keep their current connections
- No data migration required
- Old refresh endpoint gracefully deprecated
- Automatic refresh respects existing `connections_last_refresh` field

## Monitoring

The automatic refresh system provides detailed logging:
- Number of users refreshed
- Any errors encountered
- Timestamp of operation
- Individual user refresh status

## Testing

```bash
# Test the monthly refresh manually
npm run monthly-refresh

# Check if refresh should run today
curl https://your-domain.com/api/admin/monthly-refresh

# Trigger refresh via API
curl -X POST https://your-domain.com/api/admin/monthly-refresh
```

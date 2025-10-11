# OTP Authentication Setup Guide

## Overview
Your application now supports 6-digit OTP (One-Time Password) authentication instead of magic links. Users receive a 6-digit code via email that expires in 10 minutes.

## Configuration Changes Made

### 1. Supabase Configuration (`supabase/config.toml`)
```toml
# OTP Settings
otp_length = 6                    # 6-digit codes
otp_expiry = 600                  # 10 minutes (600 seconds)

# Email Template
[auth.email.template.magic_link]
subject = "Vaš kod za prijavu - mojPoslic"
content_path = "./supabase/templates/magic_link.html"
```

### 2. Email Templates
Created custom HTML email templates:
- **Bosnian**: `supabase/templates/magic_link.html`
- **English**: `supabase/templates/magic_link_en.html`

Templates include:
- Clear 6-digit code display
- 10-minute expiry warning  
- Fallback magic link button
- Professional mojPoslic branding

## How It Works

### Frontend Flow
1. **Login Options**: Users can choose between:
   - Password authentication
   - OTP code authentication

2. **OTP Process**:
   - User enters email and selects OTP option
   - System calls `signInWithOtp(email)`
   - User receives email with 6-digit code
   - User enters code in the form
   - System calls `verifyOtp(email, code)`

### Backend Implementation
The authentication context (`supabase-auth-context.tsx`) provides:

```typescript
// Send OTP code
signInWithOtp: (email: string, options?: { shouldCreateUser?: boolean }) => Promise<{ error?: Error | null }>

// Verify OTP code  
verifyOtp: (email: string, token: string) => Promise<{ error?: Error | null }>
```

### Email Template Variables
Templates use these Supabase variables:
- `{{ .Token }}` - The 6-digit OTP code
- `{{ .ConfirmationURL }}` - Fallback magic link
- `{{ .Code }}` - Alternative variable for token

## User Experience

### Email Content
Users receive an email with:
- Clear subject: "Vaš kod za prijavu - mojPoslic"
- Prominent 6-digit code in large, monospace font
- 10-minute expiry warning
- Fallback "Sign In Directly" button
- Professional design matching your brand

### Frontend Interface
- Radio buttons to choose login method
- Clear OTP code input (6 digits, numeric only)
- Automatic validation (requires exactly 6 digits)
- Resend code functionality
- Back to sign-in option

## Testing

### Test API Endpoint
Created `/api/test/otp/route.ts` for testing:

```bash
# Send OTP
curl -X POST http://localhost:3000/api/test/otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "action": "send_otp"}'

# Verify OTP
curl -X POST http://localhost:3000/api/test/otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "action": "verify_otp", "token": "123456"}'
```

### Local Development
1. Restart Supabase: `supabase stop && supabase start`
2. Check email in Inbucket: http://localhost:54324
3. Test OTP flow in your app

## Security Features

- **Expiry**: Codes expire in 10 minutes
- **Single Use**: Each code can only be used once
- **Rate Limiting**: Configured in `config.toml`
- **Fallback**: Magic link still available as backup

## Customization Options

### Change Expiry Time
```toml
# In supabase/config.toml
otp_expiry = 300  # 5 minutes
otp_expiry = 900  # 15 minutes
```

### Customize Email Subject
```toml
[auth.email.template.magic_link]
subject = "Your Login Code - mojPoslic"  # English version
```

### Code Length
```toml
otp_length = 4  # 4-digit codes
otp_length = 8  # 8-digit codes
```

## Production Deployment

### SMTP Configuration
For production, configure SMTP in `config.toml`:
```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
```

### Environment Variables
Set these in your production environment:
- `SENDGRID_API_KEY` or equivalent for your email provider
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## Translations

All OTP-related text is translated in:
- `translations/bs/auth.json` (Bosnian)
- `translations/en/auth.json` (English)

Key translation keys:
- `signInWithEmailCode`
- `sendCode`
- `otpSent`
- `enterSixDigitCode`
- `otpExpired`
- `invalidOtp`

## Next Steps

1. **Test the flow**: Try the OTP authentication with a real email
2. **Customize templates**: Adjust colors, branding, or content as needed
3. **Configure SMTP**: Set up production email delivery
4. **Monitor usage**: Check authentication logs and user feedback

The system is now ready to provide secure, user-friendly 6-digit code authentication!
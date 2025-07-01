# New Magic Link Registration Flow

This document explains the new user registration flow which uses magic links for a better user experience.

## Overview

The new registration flow has been completely redesigned to make onboarding simpler:

1. User enters their name and email
2. They receive a magic link via email
3. Clicking the link logs them in and prompts them to set a password
4. They select their account type (client, tasker, or company)
5. They are redirected to the dashboard

## Implementation Details

### Step 1: Initial Registration
- User enters their name and email
- The `register-magic` API creates a user record in the database without a password
- The NextAuth EmailProvider sends a magic link to their email

### Step 2: Email Verification & Login
- User clicks the magic link in their email
- NextAuth verifies the token and automatically logs them in
- The user is redirected to the password setup page

### Step 3: Password Setup
- User sets a secure password for their account
- Password requirements are enforced through the password strength indicator
- The `set-password` API updates the user record with the hashed password

### Step 4: Account Type Selection
- User selects their account type (client, tasker, or company)
- The `setup-profile` API updates the user's role and marks profile setup as complete
- User is redirected to the dashboard

## How to Test

1. Go to `/test-registration` to see the test page
2. Click "Test Magic Link Registration" to start the flow
3. Enter your name and email 
4. Check your email for the magic link
5. Click the link to verify your email and proceed with account setup
6. Set a password
7. Select your account type
8. You will be redirected to the dashboard

## Benefits of This Approach

- Higher conversion rates: Users don't need to create a password initially
- Better security: Email verification is guaranteed
- Improved UX: Fewer fields in the initial registration form
- Reduced friction: Users are automatically logged in after clicking the link
- Better role selection: Users choose their account type after understanding the platform better
- Password safety: Users set a secure password with visual feedback

## Configuration

The email service is configured through the following environment variables:

```
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name
```

For testing, you can use Mailtrap, Mailhog, or a similar service.

## Troubleshooting

- If you don't receive the magic link, check your spam folder
- Ensure that your email service is properly configured in the .env file
- Check the server logs for any errors related to email sending
- If the verification link is expired, you can request a new one from the check-email page

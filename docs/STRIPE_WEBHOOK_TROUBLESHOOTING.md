# Stripe Webhook Troubleshooting Guide

## Issue: Transaction Succeeded but Connections Not Added

If a Stripe transaction was successful but the user's connections were not added to their account, this document will help you diagnose and fix the issue.

## Quick Fix

Run the recovery script to manually add connections based on successful Stripe transactions:

```bash
# Get usage instructions
npm run stripe-recovery

# To check (dry run) what would happen for a specific user ID
npm run stripe-recovery -- USER_ID --dry-run

# To actually fix the connections for a user
npm run stripe-recovery -- USER_ID

# To fix a specific transaction by session ID
npm run stripe-recovery -- '' SESSION_ID
```

## Diagnosis Steps

1. **Verify Webhook Delivery**
   - Check Stripe Dashboard > Developers > Webhooks 
   - Look for recent events and check if they were delivered successfully
   - Verify the endpoint URL is correct: `https://your-domain.com/api/stripe/webhook`

2. **Check Server Logs**
   - Look for logs containing "Webhook received" or "PAYMENT_SUCCESS"
   - Check for any error messages related to Stripe or database operations

3. **Verify Environment Variables**
   - Make sure `STRIPE_WEBHOOK_SECRET` is correctly set:
   ```bash
   npm run check-stripe
   ```

4. **Test Webhook Locally**
   - Use our webhook test script:
   ```bash
   npm run stripe-webhook-test -- USER_ID
   ```

## Common Issues and Fixes

### 1. Webhook Not Being Received

- **Symptoms**: No log entries for webhook events
- **Possible Causes**:
  - Incorrect webhook URL in Stripe Dashboard
  - Firewall or network issues
  - Local development without proper forwarding
- **Solutions**:
  - Verify webhook URL in Stripe Dashboard
  - For local development, use ngrok or Stripe CLI to forward webhooks

### 2. Webhook Signature Verification Failing

- **Symptoms**: Logs show "Invalid signature" or "Webhook signature verification failed"
- **Possible Causes**:
  - Incorrect `STRIPE_WEBHOOK_SECRET` in environment
  - Webhook being tampered with or replayed
- **Solutions**:
  - Double-check the webhook signing secret in Stripe Dashboard
  - Regenerate the signing secret if needed

### 3. Database Transaction Failing

- **Symptoms**: Logs show webhook is received but database errors occur
- **Possible Causes**:
  - Prisma model naming issues
  - User not found
  - Database permission issues
- **Solutions**:
  - Use the recovery script to manually add connections
  - Check database schema matches Prisma schema
  - Ensure user exists in database

### 4. Data Type Mismatch

- **Symptoms**: TypeScript errors or database errors about types
- **Possible Causes**:
  - Invalid connections value in metadata
  - Enum values not matching
- **Solutions**:
  - Check the data types being passed in metadata
  - Ensure `ConnectionAction` enum includes 'PURCHASE'

## Long-Term Fixes

1. **Update ConnectionHistory Model**
   - Run `npx prisma generate` to ensure the model is up to date
   - Verify the model is correctly mapped in Prisma schema

2. **Improve Webhook Error Handling**
   - The webhook handler now logs detailed information about payment events
   - Use these logs to manually recover if needed

3. **Monitor Webhook Deliveries**
   - Regularly check the Stripe Dashboard for webhook events
   - Set up alerts for failed webhook deliveries

4. **Test Stripe Checkout End-to-End**
   - Use test cards in development to verify the full flow
   - Check both the payment and the webhook handling

## Need Help?

If you've followed these steps and still have issues, try:

1. Running `npm run db:generate` to update the Prisma client
2. Running `npm run db:push` to ensure the database schema is updated
3. Using the recovery script to manually add connections

For complex issues, check the Stripe event logs in the dashboard and compare with your application logs.

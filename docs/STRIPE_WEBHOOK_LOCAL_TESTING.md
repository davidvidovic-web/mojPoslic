# Stripe Webhook Testing - Local Development

## Problem Found
The webhook endpoint in your Stripe dashboard is currently pointing to:
`http://vagon-gallery.local/?wc-api=wc_stripe`

This is not your current application. For local development, you need to use Stripe CLI to forward events.

## Solution: Use Stripe CLI

### Step 1: Install Stripe CLI (if not already installed)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Step 2: Login to Stripe
```bash
stripe login
```

### Step 3: Forward webhook events to your local server
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will:
1. Show you the webhook signing secret (starts with `whsec_`)
2. Forward all Stripe events to your local webhook endpoint
3. Allow you to test payments end-to-end

### Step 4: Update your .env.local
Add the webhook signing secret from step 3:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Test a payment
1. Make sure your dev server is running: `npm run dev`
2. Make sure Stripe CLI is listening: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Go to your dashboard and try purchasing connections
4. Watch the Stripe CLI output and your server logs

## Alternative: Simulate webhook for testing

If you can't use Stripe CLI right now, you can temporarily bypass webhook signature verification for testing:

1. Comment out the signature verification in your webhook
2. Use the test script to simulate a successful payment
3. Verify that connections are added correctly

Let me know which approach you'd like to try!

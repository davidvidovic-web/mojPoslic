# Stripe Integration Setup

## Checking Environment Variables

After configuring your environment variables, you can verify them with:

```bash
npm run check-stripe
```

This will check if all required Stripe variables are properly set up in your `.env.local` file.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key

# Either of these names will work for the publishable key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Preferred name
# OR
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Alternative name

# Webhook configuration (required for payment confirmations)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret from Stripe dashboard

# Required for redirect URLs
NEXTAUTH_URL=http://localhost:3000  # Your app URL
```

## Stripe Setup Instructions

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Switch to test mode for development

### 2. Get API Keys
- In Stripe Dashboard, go to Developers > API keys
- Copy the Publishable key and Secret key
- Add them to your `.env` file

### 3. Set up Webhook
- Go to Developers > Webhooks in Stripe Dashboard
- Click "Add endpoint"
- Use URL: `https://your-domain.com/api/stripe/webhook`
- For local development: Use ngrok or similar to expose your local server
- Select event: `checkout.session.completed`
- Copy the webhook signing secret and add to `.env`

### 4. Test Mode
The current implementation uses test mode. For production:
- Switch to live keys in Stripe dashboard
- Update environment variables with live keys
- Test thoroughly before going live

## Connection Packages

The system offers these packages:
- 20 connections for €0.75
- 40 connections for €1.50 (Most Popular)
- 60 connections for €3.00
- 100 connections for €6.00 (Best Value)

## Flow

1. User clicks "Purchase Connects"
2. Selects a package and clicks "Purchase Now"
3. Redirected to Stripe Checkout
4. After payment, webhook adds connections to user account
5. User redirected back to dashboard with success message

## Security

- All payments processed securely by Stripe
- Webhook signature verification prevents tampering
- User authentication required for purchases
- Connection additions logged in database

## Implementation Details

### File Structure

```
src/
  ├── lib/
  │   └── stripe.ts          # Stripe configuration and helpers
  ├── app/
  │   └── api/
  │       └── stripe/
  │           ├── checkout/  # Creates checkout sessions
  │           │   └── route.ts
  │           └── webhook/   # Handles payment confirmations
  │               └── route.ts
  └── components/
      └── purchase-connections.tsx  # UI for purchase dialog
```

### Database Schema

The system uses the following database structures:

- **User Model**: Contains a `connections` field (integer)
- **ConnectionHistory Model**: Records all connection changes
  - `userId`: User ID
  - `action`: Type of action (includes "PURCHASE")
  - `amount`: Number of connections added/removed
  - `description`: Details about the transaction
  - `createdAt`: Timestamp of the transaction

### Key Components

1. **Stripe Client Setup** (`src/lib/stripe.ts`):
   - Configures Stripe client and server instances
   - Defines connection packages with pricing
   - Exports helpers to look up packages

2. **Checkout Endpoint** (`src/app/api/stripe/checkout/route.ts`):
   - Creates Stripe Checkout sessions
   - Requires authentication
   - Stores user ID and package details in metadata
   - Sets success/cancel URLs

3. **Webhook Handler** (`src/app/api/stripe/webhook/route.ts`):
   - Verifies webhook signatures
   - Processes successful payments
   - Updates user's connection count
   - Records transaction in ConnectionHistory

4. **Purchase UI** (`src/components/purchase-connections.tsx`):
   - Displays available packages
   - Handles purchase flow
   - Redirects to Stripe Checkout

### Testing the Integration

To test the Stripe integration:

1. Ensure all environment variables are set up
2. Use Stripe test cards (e.g., 4242 4242 4242 4242) for payments
3. For webhook testing, use the Stripe CLI or a service like ngrok
4. Check the ConnectionHistory table to verify purchases are recorded

To simulate a webhook for testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then make a test payment:
```bash
stripe trigger checkout.session.completed
```

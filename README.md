# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash


# pnpm
pnpm install

```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Stripe Webhooks

For local Stripe webhook testing, set `NUXT_STRIPE_WEBHOOK_SECRET_KEY` in `.env` to
the signing secret printed by `stripe listen`, then restart `pnpm dev` so Nuxt
loads the new value.

```bash
stripe listen --forward-to http://harmony-rooster.localhost:1355/api/stripe/webhook
```

The app also accepts the legacy path `/api/webhooks/stripe`.

## Registration receipts

Checkout creates a protected receipt link. The server checks its access token before
returning payment or course details; a Checkout session ID alone cannot open a receipt.
The token is carried in the link fragment, removed before the router and analytics
initialize, and sent only in an Authorization header. Same-tab reloads retain access.
Customers can use **Copy receipt link** to open the receipt on another device.
Treat that link as private: anyone holding it can view the receipt. Removing
`receipt_token_hash` from the Stripe Checkout Session metadata revokes its access.
No additional signing secret or account login is required.

Registration confirmation comes from the fulfillment record, not payment status.
Pending outcomes refresh every five seconds for up to 30 seconds; customers can then
check again or contact support. Missing records for recent payments receive
a ten-minute confirmation window (using Checkout creation time when charge details are unavailable). Older missing records, including records expired
from Redis, show **Registration status unavailable** while retaining payment details.
Receipt reads never create registrations or retry payments.

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## QuickBooks OAuth2 Setup

Configure the following runtime config values (via environment variables) for QuickBooks OAuth:

- `NUXT_QBO_CLIENT_ID`
- `NUXT_QBO_CLIENT_SECRET`
- `NUXT_QBO_REDIRECT_URI` (e.g. `http://localhost:3000/api/qbo/callback`)
- `NUXT_QBO_ENVIRONMENT` (`sandbox` or `production`)
- `NUXT_CHARGE_URL` (QuickBooks Payments charge URL for your environment)

Then, connect your QuickBooks company by visiting:

- `GET /api/qbo/start` → redirects to Intuit for consent
- `GET /api/qbo/callback` → handles the OAuth callback and stores tokens
- `GET /api/qbo/status` → shows connection status

The server will automatically refresh access tokens. API calls now use a valid `Bearer` token instead of a static access token.

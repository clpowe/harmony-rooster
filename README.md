# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash


# pnpm
pnpm install

```

## Formatting and linting (Neovim)

Vite+ runs Oxfmt for formatting and Oxlint for linting. Both read `vite.config.ts`;
keep formatting options in its `fmt` block and lint rules in its `lint` block.
`.editorconfig` keeps indentation and line endings consistent while typing.

```bash
pnpm format        # Format files
pnpm format:check  # Check formatting without editing
pnpm lint          # Report lint and TypeScript diagnostics
pnpm lint:fix      # Apply safe lint fixes
```

In Neovim, use Conform as the formatting provider, running the project's
`node_modules/.bin/vp fmt --stdin-filepath <filename>`. Use the project's
`node_modules/.bin/oxlint --lsp` for lint diagnostics; its root must include
`package.json` or `vite.config.ts`, rather than requiring `.oxlintrc.json`.
Keep Vue and TypeScript language servers enabled for completion and type information.
Avoid running Prettier, Biome, or LSP formatting alongside Oxfmt on the same file.
Use `:ConformInfo` to inspect the formatter and `:LspInfo` to confirm Oxlint is attached.
If the editor reports missing `.nuxt/tsconfig` files, run `pnpm exec nuxt prepare`
to regenerate Nuxt's types, then restart the language servers.

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

Start Nuxt and the Stripe CLI webhook forwarder together (Ctrl+C stops both; if
either exits, the other is stopped too):

```bash
pnpm dev:all
```

`pnpm stripe:listen` runs the forwarder alone. It forwards all snapshot events to
`http://harmony-rooster.localhost:1355/api/stripe/webhook`.

Set `NUXT_STRIPE_WEBHOOK_SECRET_KEY` in `.env` to the signing secret printed by
`stripe listen`, then restart the dev server so Nuxt loads the new value. If the
Stripe CLI fails with `api_key_expired`, run `stripe login` again.

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

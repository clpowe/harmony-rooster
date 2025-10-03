# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
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

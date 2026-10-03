# taiho-api

Cloudflare Worker + D1 for the shared Time Attack rankings (weekly and all-time, per map) and cloud saves. Free tier covers a small game comfortably.

## Deploy once

```sh
cd worker
npm install
npx wrangler login
npm run db:create            # prints a database_id; paste it into wrangler.toml
npm run db:init              # creates the tables
npm run deploy               # prints https://taiho-api.<you>.workers.dev
# existing databases: apply the migrate-00N-*.sql files you have not run yet, in order, e.g.
# npx wrangler d1 execute taiho --remote --file=./migrate-004-weekly.sql
```

Then build the game with the API URL:

```sh
VITE_API_URL=https://taiho-api.<you>.workers.dev npm run build
```

Set `ALLOWED_ORIGIN` in `wrangler.toml` to the game's origin once it has a domain.

## Payments

Sets are direct unlocks; there is no in-game currency for sale.

- **Web (Stripe)**: create one Product per set in the Stripe dashboard with a one-time price, paste the price ids into `STRIPE_PRICES` in `wrangler.toml`, then `npx wrangler secret put STRIPE_SECRET` and `STRIPE_WEBHOOK_SECRET` (webhook endpoint: `https://<worker>/api/webhooks/stripe`, event `checkout.session.completed`). Japan: enable konbini and PayPay in Checkout settings; add a 特定商取引法 page to the site.
- **App Store / Google Play (RevenueCat)**: create the same products in both stores with ids `taiho_<set>` (e.g. `taiho_shonen`), add them to a RevenueCat offering, install `@revenuecat/purchases-capacitor` in the app and call `Purchases.configure` with `appUserID` set to the game's owner key (`a:<account>` or `d:<device>`), then point a RevenueCat webhook at `https://<worker>/api/webhooks/revenuecat` with the bearer token you store as `REVENUECAT_WEBHOOK_SECRET`.
- Existing databases: run `migrate-003-purchases.sql`.

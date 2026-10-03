# taiho-api

Cloudflare Worker + D1 for the shared Time Attack ranking and cloud saves. Free tier covers a small game comfortably.

## Deploy once

```sh
cd worker
npm install
npx wrangler login
npm run db:create            # prints a database_id; paste it into wrangler.toml
npm run db:init              # creates the tables
npm run deploy               # prints https://taiho-api.<you>.workers.dev
```

Then build the game with the API URL:

```sh
VITE_API_URL=https://taiho-api.<you>.workers.dev npm run build
```

Set `ALLOWED_ORIGIN` in `wrangler.toml` to the game's origin once it has a domain.

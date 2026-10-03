# TAIHO!! (タイホ!!)

Konbini vigilante. A top-down, Pokémon-style pixel game: read the mark over a suspicious shopper's head, close in when it turns red, and chase him down in 20 seconds. Catch five to open the elevator. English and kana-only Japanese.

## Run

```sh
npm install
npm run dev        # http://localhost:5173, open on your phone via the LAN address printed
npm test           # layout generator, difficulty curve, kana rule
npm run build      # type-check + production build in dist/
npm run check:kana # fails if ja.ts contains kanji
```

## Layout

- `src/game/` rules: `const.ts` map frame and tuning constants, `mapgen.ts` aisle generator with the two-wide-lane rule, `difficulty.ts` the level 1-100 curve, `ai.ts` NPC and perv state machine, `chase.ts`, `player.ts`, `economy.ts` yen, shop and leaderboard interface, `tutorial.ts`, `loop.ts` the update orchestrator.
- `src/core/` engine: input (keyboard and slide-over touch pad), camera that follows the player on small screens, audio, asset loader, canvas helpers, seedable RNG.
- `src/ui/` canvas HUD and text boxes, DOM overlays for menus, shop, results.
- `src/i18n/` `en.ts` is the source of keys, `ja.ts` must match it and stay kana only.
- `tools/` Python scripts that draw the pixel art and pack the atlas (`npm run art` needs Pillow).
- `public/` PWA manifest, service worker, icons.

## Mobile

Portrait first. On phones the viewport is a scrolling window of about 15 by 15 tiles with the camera on the player; on larger screens the whole 20 by 15 map shows. The d-pad is slide-over (hold and drag), A and B are big round buttons. Installable to the home screen and playable offline once cached. Wrap with Capacitor for the app stores.

## Ship it

- **CI**: `.github/workflows/ci.yml` runs the kana check, tests and build on every push and pull request.
- **Web**: `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on pushes to `master` or `game/scaffold`. One-time setup in the repository: Settings → Pages → Source → "GitHub Actions". The game then lives at `https://<user>.github.io/<repo>/`. To point it at the API, add a repository variable `VITE_API_URL`. Cloudflare Pages works the same way (build command `npm run build`, output `dist`).
- **Phones, no store**: the site is a PWA. Android and desktop Chrome show an "Install app" button on the title; iPhone users add it from Safari's Share menu. It runs fullscreen and offline.
- **App stores**: Capacitor is configured (`capacitor.config.ts`, app id `com.wearbons.taiho`). On a machine with Android Studio or Xcode: `npm run cap:add:android` or `npm run cap:add:ios` once, then `npm run cap:android` / `npm run cap:ios` to build, sync and open the native project.

## Backend (optional)

`worker/` holds a Cloudflare Worker + D1 for the shared Time Attack rankings (one board per floor, this week and all time; weeks reset Monday 00:00 UTC) and cloud saves. Without it the game keeps everything on the device. See `worker/README.md`; build the game with `VITE_API_URL=https://...` to enable it.

Career progress (level, stats, yen, items, total catches, unlocked maps) persists on the device and syncs to the cloud when the API is configured. "Reset save" on the title screen erases it after a confirming tap.

## Floors

Twenty floors. The store run: Konbini, Boutique, Department Store, Electronics Store, Shopping Mall, then Mega Mall 1F-5F. Then the train takes the run outdoors (`src/game/tokyo.ts`, floors 11-20): Shibuya Crossing, Harajuku Takeshita Street, Kabukicho (night), Ginza, Asakusa Temple, Akihabara, Ameyoko Market, Tsukiji Outer Market, Roppongi & Tokyo Tower (night), Odaiba. Outdoors the station stands in for the elevator, the koban for the shop, railings for partitions, back alleys for the chase arena, and the station stairs on the road side are the IN and OUT. Each district has its own street fixtures (`tools/tokyo.py`). Maps 4 and up are assembled by `src/game/mall.ts`: a fixture strip with the elevator, shop rooms behind glass partitions with two-wide openings, back halls that open during chases, and separate IN / OUT doors. Each room places its own shop's fixtures, so a mall floor is a konbini corner next to a boutique next to an electronics shop. The mega malls are built from a seed per floor (deterministic, bigger each floor, shops drawn from the catalogue). Tipped vending machines appear from map 4 and need Strength 3.

## Level 100+: pervs that study you

From level 100 every chase picks an evasion style (`src/game/adapt.ts`): RUNNER, ZIGZAG, DODGER (steers clear of the zones you usually catch in), HALL RAT (runs for the back halls), JUKER (breaks to your blind side) or WARY (sees through decoys, avoids peels and obstacles). Each catch feeds a small profile in the save: a 4x4 heatmap of catch spots, the side you close from, and the items you finish with. The style is chosen by Thompson sampling over how often each one has escaped, everything decays over ~25 chases so changing your habits works, and the pervs never get faster than the level-100 curve. The style is shown above the runner during the chase.

## Rewarded ads (optional)

Two placements only, never forced: a second chance after an escape and doubling a boss reward. On the web no provider exists and the offers never appear. In the app, install `@capacitor-community/admob`, create two rewarded ad units, and build with `VITE_AD_SECOND_CHANCE` and `VITE_AD_DOUBLE_BOSS` set to their ids.

## Accounts

Guest first: the game plays anonymously under a device id. "Link save" on the title offers a transfer code (web and app) and, inside the Capacitor app, Sign in with Apple / Google through a social-login plugin. The Worker verifies ID tokens against Apple's and Google's public keys (set `APPLE_AUDIENCES` and `GOOGLE_AUDIENCES` in `worker/wrangler.toml`), keys saves by account once linked, and merges with the rule "more career catches wins". Existing databases run `worker/migrate-002-accounts.sql`.

## Fonts and art

PixelMplus 10 (M+ FONT LICENSE, see `src/assets/fonts/`), subset to kana and Latin. All sprites and tiles are original pixel art generated from `tools/`.

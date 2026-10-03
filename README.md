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

## Fonts and art

PixelMplus 10 (M+ FONT LICENSE, see `src/assets/fonts/`), subset to kana and Latin. All sprites and tiles are original pixel art generated from `tools/`.

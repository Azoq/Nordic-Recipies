# Nordic Recipes — PWA prototype (Next.js)

A locale-aware recipe web app for Danish, Swedish, Norwegian, and English. Installable on iPhone as a PWA, no App Store required.

## Why this architecture

Same data model as the SwiftUI prototype — `recipes.json` + `ingredients.json` + a locale-aware formatter. The data layer is identical and the logic in `src/lib/format.ts` is a direct port of the Swift `IngredientFormatter`. If you later want a native iOS app, the proven data model moves over without changes.

## Prerequisites on Windows

1. Install **Node.js** (version 20 or newer) from https://nodejs.org
2. Install a code editor — **VS Code** (free) is standard
3. Open a terminal: PowerShell, Windows Terminal, or the one built into VS Code

That's it. No Xcode, no Mac, no Apple Developer account needed.

## First run

```powershell
cd nordic_recipes_web
npm install
npm run dev
```

Open http://localhost:3000 in any browser. The three seed recipes should appear.

## What to verify

- Switch locale via the top-right button (sv/no/da/en); all text updates in place
- Open the Norwegian kjøttkaker recipe with Danish locale selected — the "Skrevet på norsk (bokmål)" label appears at the top
- Kanelbullar in Swedish shows "7 dl vetemjöl" and "1 msk kardemumma, mald"
- Same recipe in Norwegian shows "7 dl hvetemel" and "1 ss kardemomme, malt"
- Same in Danish shows "7 dl hvedemel" and "1 spsk kardemomme, stødt"
- Same in English shows "7 dl all-purpose flour" and "1 tbsp ground cardamom"
- Reload the page — the selected locale persists via localStorage

## File structure

```
nordic_recipes_web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with LocaleProvider
│   │   ├── page.tsx                # Recipe list (home)
│   │   ├── recipe/[id]/page.tsx    # Recipe detail
│   │   ├── globals.css             # Tailwind base
│   │   ├── ingredients.json        # 30 ingredients, all locales
│   │   └── recipes.json            # 3 seed recipes
│   ├── components/
│   │   └── LocaleButton.tsx        # Top-right locale selector + modal
│   └── lib/
│       ├── types.ts                # TypeScript types for JSON schema
│       ├── format.ts               # Ingredient/amount/unit formatter
│       ├── ui-strings.ts           # UI labels in all four languages
│       ├── locale-context.tsx      # React context for current locale
│       └── data.ts                 # Loads bundled JSON
├── public/
│   └── manifest.json               # PWA manifest
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Testing on your actual iPhone

This is the magic of PWAs — no Mac, no TestFlight, no review queue.

**Option A: same Wi-Fi (fastest for dev)**

1. Run `npm run dev` on your PC
2. Find your PC's local IP: `ipconfig` in PowerShell, look for IPv4 (e.g. `192.168.1.42`)
3. In Next.js, use `npm run dev -- --hostname 0.0.0.0` so it accepts connections from other devices
4. On your iPhone (same Wi-Fi), open Safari and go to `http://192.168.1.42:3000`
5. Tap the share button → "Add to Home Screen" — now it looks and behaves like an app

Note: PWAs need HTTPS for full functionality (offline, install prompt). Over local IP with HTTP, most things work but service worker won't. For real testing, use Option B.

**Option B: deploy to Vercel (free, HTTPS, 2 minutes)**

1. Push this folder to a GitHub repo
2. Go to vercel.com, sign in with GitHub, import the repo
3. Click Deploy — you'll get a URL like `nordic-recipes-web.vercel.app`
4. Open that URL on your iPhone → Add to Home Screen

Every `git push` triggers a redeploy. This is the proper development loop.

## What's in the prototype vs what's missing

**In the prototype:**
- Full locale switching with persistence
- Recipe list + detail
- Locale-aware ingredient names, amounts, and units
- Authorship label when viewing a recipe in a non-native locale
- Ingredient grouping (dough / filling / patties / gravy)
- Responsive layout, tap-friendly targets

**Deliberately missing (add when the core works):**
- Images (hero tiles use solid colors for now)
- Search + tag filtering
- Serving scaler
- Cooking mode (one-step-at-a-time view with timers)
- Grocery list
- Offline service worker (add `next-pwa` package when ready)
- Real backend for content updates (swap JSON imports for API calls)

## Next steps once the prototype proves out

1. **Get it on your phone** — deploy to Vercel, add to home screen, cook something from it. This is the real test.
2. **Write 20 more recipes** — the bottleneck isn't code, it's content. Aim for 5 per language.
3. **Add images** — a single hero image per recipe. Store in `public/images/` for now.
4. **Add serving scaler** — multiply `usage.amount` by a user-chosen ratio in `formatIngredient`. The formatter already takes a `servingMultiplier` parameter.
5. **Add cooking mode** — new route `/recipe/[id]/cook/[step]`, big text, timer from `step.timer_seconds`.
6. **Add a backend when you need it** — Supabase is the easiest path. Move `recipes.json` and `ingredients.json` into Postgres tables, fetch at runtime. Don't do this until you have a reason to.

## Known rough edges

- `formatAmount` uses `Math.floor` + fraction detection; won't produce "⅓" or "⅔" yet. Add when a recipe needs it.
- Dairy fat-percentage suffix ("vispgrädde (36%)") isn't rendered. Add it in `formatIngredient` when needed.
- The ingredients JSON is imported at build time, so content updates require a redeploy. Fine for now.
- No skeleton/loading state — the JSON is bundled so there's nothing to wait for. If you swap to an API later, add one.
- The "Skrivet på" label is fully localized but uses `.toLowerCase()` on the language name, which isn't ideal for all locales. Refine when you have more than four languages.

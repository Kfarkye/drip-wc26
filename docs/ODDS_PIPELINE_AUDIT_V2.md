# The Drip — World Cup 2026 Wedge Readiness Audit V2

**Date:** 2026-02-22
**Repo:** `Kfarkye/drip-wc26`
**Stack:** Vite + React + TypeScript, Supabase, Netlify/Vercel

---

## Summary Table

| # | Feature Layer              | Status       | Critical Gaps                                      |
|---|----------------------------|--------------|----------------------------------------------------|
| 1 | Canonical Snapshot Binding | 🔄 PARTIAL   | No `snapshot_id`; no shared ref between chat & edge |
| 2 | Cross-Ecosystem Gap Math   | ✅ BUILT     | Core math complete; devig, edge, gap all wired      |
| 3 | Red Card / Event Alerts    | ❌ NOT FOUND | Entire pipeline missing                             |
| 4 | /Learn Pages (SEO)         | ❌ NOT FOUND | No content pages exist                              |
| 5 | /Edges/[Match] SEO         | 🔄 PARTIAL   | Canonical tags present; noindex + pruning missing   |
| 6 | Prediction Market Data     | 🔄 PARTIAL   | Venue metadata exists; no live fetch pipeline       |
| 7 | Sportsbook Data            | 🔄 PARTIAL   | Venue metadata exists; no live fetch pipeline       |

---

## 1. Canonical Snapshot Binding

**Status: 🔄 PARTIAL**

### What exists
- `OddsLine.updated` and `PMPrice.updated` fields carry ISO timestamps (`src/types/game.ts:13,22`).
- `Game.updatedAt` provides a per-game last-modified stamp (`src/types/game.ts:57`).
- Static edge pages embed a generation timestamp in the "Data Receipt" footer (`public/edges/*/index.html`).

### What's missing
- **No `snapshot_id`** — there is no unique identifier that binds a set of odds readings to a single point-in-time capture. Timestamps exist per-line but nothing groups them.
- **No shared reference between chat and edge cards** — if an AI chat response references odds, there is no mechanism to guarantee it's looking at the same snapshot the edge card displays.
- **No `as_of_ts` displayed in the SPA** — the static HTML pages show a generation timestamp in the receipt block, but the React SPA (`EdgeDetailPage.tsx`) does not surface any timestamp to the user.

### Files examined
- `src/types/game.ts`
- `src/pages/EdgeDetailPage.tsx`
- `public/edges/a4-vs-kor-2026-06-11/index.html`

---

## 2. Cross-Ecosystem Gap Math

**Status: ✅ BUILT**

### What exists
- **American → Implied Probability:** `americanToImplied()` in `src/lib/odds.ts:6-12`.
- **Implied → American:** `impliedToAmerican()` in `src/lib/odds.ts:19-26`.
- **Vig normalization:** `devigPower()` implements the Multiplicative (Power) Method for devigging sportsbook overrounds (`src/lib/odds.ts:68-85`).
- **PM price → Implied:** `predictionPriceCents / 100` conversion inside `calculateEdge()` (`src/lib/odds.ts:46`).
- **Edge calculation:** `calculateEdge()` returns `{ edge, sportsbookImplied, predictionImplied, direction, fairValueAmerican }` (`src/lib/odds.ts:35-62`).
- **Gap per side:** `teamGap()` in `src/lib/gap.ts:14-16`.
- **Max gap per game:** `maxGapForGame()` averages across books per side, finds the largest divergence (`src/lib/gap.ts:27-55`).
- **Thresholds:** `INTL_THRESHOLD = 1.5` and `MIN_FEATURED_GAP = 2.0` in `src/lib/edge.ts:11,14`.
- **Confidence tiers:** High (≥5% gap, ≥3 sources), Medium (≥2%, ≥2 sources), Low (else) (`src/lib/edge.ts:27-31`).
- **CTA builder:** Generates up to 2 actionable links depending on edge direction (`src/lib/edge.ts:36-82`).

### What's missing
- Nothing critical. The math layer is the most complete part of the codebase.

### Files examined
- `src/lib/odds.ts`
- `src/lib/gap.ts`
- `src/lib/edge.ts`

---

## 3. Red Card / Event Alerts

**Status: ❌ NOT FOUND**

### What exists
- Nothing. No files, functions, or types related to live event ingestion, alerting, or notification delivery.

### What's missing
- **Event ingest pipeline** — no webhook receiver or polling worker for match events (goals, cards, VAR, injuries).
- **Alert rules engine** — no conditional logic that triggers on specific event types.
- **Notification delivery** — no push, email, SMS, or Telegram integration.
- **Alert payload schema** — no type definition for alerts carrying pre/post lines and timestamps.

### Files examined
- Grep across entire `src/` for: `red card`, `alert`, `webhook`, `push`, `telegram` — zero results.

---

## 4. /Learn Pages (SEO Authority)

**Status: ❌ NOT FOUND**

### What exists
- Nothing. No `/learn` directory, no MDX files, no content pages.

### What's missing
- **`/learn/withdrawals`** — withdrawal guides with steps, fees, timelines, KYC notes per venue. (Note: raw metadata exists in `src/data/withdrawal-metadata.ts` with full deposit/withdrawal specs for all 12 venues — this is the data source, not the rendered page.)
- **`/learn/prediction-markets`** — explainer covering how PM contracts work, geography constraints, US vs international access.
- **`/learn/legality`** — state-by-state / country-level legality matrix.
- **"Last updated" timestamps** — not applicable since pages don't exist.
- **SSR** — the app is a Vite SPA; no server-rendering. Static edge pages in `public/` are pre-built HTML but `/learn` pages would need the same treatment or an SSR migration.

### Files examined
- `find` across repo for `learn` — zero results.

---

## 5. /Edges/[Match] Generator + SEO Hygiene

**Status: 🔄 PARTIAL**

### What exists
- **Deterministic URLs:** ~30+ pre-built static HTML pages under `public/edges/{slug}/index.html` using the pattern `{away}-vs-{home}-{date}`.
- **Canonical tags:** Each static page includes `<link rel="canonical" href="https://thedrip.to/edges/{slug}/">` (e.g., `public/edges/a4-vs-kor-2026-06-11/index.html:10`).
- **Open Graph / Twitter cards** with proper title, description, URL.
- **JSON-LD SportsEvent schema** with structured data for teams, venue, date, and parent event (FIFA WC 2026).
- **Sitemap:** `public/sitemap.xml` exists.

### What's missing
- **No `noindex` for thin pages** — pages with no odds data show "—" placeholders and "Odds loading..." badges but are still indexable. Should add `<meta name="robots" content="noindex">` until data populates.
- **No automated pruning** — after a match is played, the edge page remains indefinitely. No expiration or archival strategy.
- **No internal linking** — edge pages don't link to `/learn/*` (which doesn't exist) or to other edge pages. The only cross-link is back to "Group D" and to the SPA live view.
- **SPA detail page is a stub** — `src/pages/EdgeDetailPage.tsx` shows "Full edge breakdown coming soon." with no odds rendering.

### Files examined
- `public/edges/a4-vs-kor-2026-06-11/index.html`
- `src/pages/EdgeDetailPage.tsx`
- `public/sitemap.xml`

---

## 6. Prediction Market Data

**Status: 🔄 PARTIAL**

### What exists
- **Venue definitions:** Kalshi, Polymarket, Robinhood, Interactive Brokers defined in `src/data/withdrawal-metadata.ts` with full withdrawal/deposit method specs.
- **Type system:** `PMPrice` type in `src/types/game.ts:16-23` with `book`, `away`, `home`, `draw?`, `updated` fields.
- **Edge math:** `calculateEdge()` and `getEdgeInsight()` both consume PM centesimal prices.

### What's missing
- **No fetch pipeline** — no API client, no polling loop, no Supabase Edge Function, no cron job fetching live PM prices.
- **No PM price storage** — no database table or local cache holding timestamped PM price history.
- **No refresh frequency** — no scheduled or event-driven data refresh.

### Files examined
- `src/data/withdrawal-metadata.ts`
- `src/types/game.ts`
- `src/lib/odds.ts`
- Grep for `kalshi`, `polymarket` — only found in withdrawal metadata.

---

## 7. Sportsbook Data

**Status: 🔄 PARTIAL**

### What exists
- **Venue definitions:** DraftKings, FanDuel, BetMGM, Caesars, BetRivers (US regulated), Bovada, BetOnline (international) — all in `src/data/withdrawal-metadata.ts`.
- **Type system:** `OddsLine` in `src/types/game.ts:7-14` with `book`, `type`, `away`, `home`, `draw?`, `updated`.
- **Rendering:** `OddsDisplay.tsx` component exists.
- **Math:** Full American odds conversion and devigging in `src/lib/odds.ts`.

### What's missing
- **No API integration** — no calls to The Odds API or any other odds provider. Grep for `the-odds-api`, `sportsbook` returned zero hits.
- **No odds storage** — no database table, no Supabase integration for persisting sportsbook odds.
- **No refresh/cron** — no scheduled ingestion.
- **Vig is calculated but not displayed** — `devigPower()` exists but is never called from any component or page.

### Files examined
- `src/data/withdrawal-metadata.ts`
- `src/types/game.ts`
- `src/lib/odds.ts`
- `src/components/OddsDisplay.tsx`

---

## Architecture Observations

1. **Client-only SPA** — The app is a Vite React SPA with hash-based routing (`react-router-dom`). No SSR, no ISR, no API routes.
2. **Static fallback for SEO** — Pre-built HTML files in `public/edges/` serve as crawlable snapshots. This is a solid interim strategy but doesn't scale past ~50 matches without a build script.
3. **Supabase is wired but idle** — `src/lib/supabase.ts` exists, `.env.example` has Supabase keys, but no data flows through it for odds or events.
4. **Math is production-ready, data is not** — The probability/edge/gap calculation layer is fully built and type-safe. The missing piece is the data ingestion pipeline to feed it.
5. **No chat integration** — Despite the audit asking about chat ↔ snapshot binding, there is no chat feature in this repo.

---

## Priority Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| P0 | Build odds ingestion pipeline (Supabase Edge Function + The Odds API) | Unblocks all data display |
| P0 | Build PM price ingestion (Kalshi API + Polymarket subgraph) | Enables cross-ecosystem edge |
| P1 | Add `snapshot_id` to batch ingestion writes | Data integrity |
| P1 | Wire `EdgeDetailPage.tsx` to real data via Supabase query | Activates SPA match pages |
| P1 | Add `noindex` meta to thin/unpopulated edge pages | SEO hygiene |
| P2 | Create `/learn` content pages from withdrawal metadata | SEO authority |
| P2 | Build event alert pipeline | User engagement |
| P3 | Add match pruning / archival strategy | Long-term maintenance |

# THE DRIP — World Cup Wedge Readiness Audit

**Date**: 2026-02-22
**Auditor**: Claude (automated codebase scan)
**Branch**: `claude/audit-world-cup-wedge-LTz22`

---

## 1. CANONICAL SNAPSHOT BINDING

**STATUS**: 🔄 PARTIAL

### Evidence

**Database layer** — timestamps exist on all data tables:
- `odds.fetched_at TIMESTAMPTZ` — `supabase/migrations/20260217000000_init.sql:61`
- `prediction_prices.fetched_at TIMESTAMPTZ` — `supabase/migrations/20260217000000_init.sql:77`
- `edges.calculated_at TIMESTAMPTZ` — `supabase/migrations/20260217000000_init.sql:95`
- `matches.updated_at TIMESTAMPTZ` with auto-update trigger — `supabase/migrations/20260217000001_enhancements.sql:21-30`

**Type system** — timestamp fields defined:
```typescript
// src/types/game.ts:13
export interface OddsLine { updated: string; }
// src/types/game.ts:22
export interface PMPrice { updated: string; }
// src/types/game.ts:57
export interface Game { updatedAt: string; }
```

**Pre-rendered pages** — static snapshot receipt:
```html
<!-- scripts/prerender-matches.ts:181 -->
<strong>Pre-game snapshot</strong> · Page generated: 2026-02-21T04:36:15 UTC
```

**JSON-LD** — `last_verified` property in index.html:
```json
// index.html:111-113
{ "@type": "PropertyValue", "name": "last_verified", "value": "2026-02-18" }
```

### NOT FOUND
- No `snapshot_id` field tying odds + PM prices to a single coherent snapshot
- No `as_of_ts` displayed in EdgeCard or dynamic SPA pages
- No chat interface exists (no chat response handlers at all)
- `EdgeCard` component (`src/components/EdgeCard.tsx`) renders zero timestamp information
- API layer (`src/lib/api.ts`) does not surface `fetched_at` or `calculated_at` to the frontend
- No real-time polling or data staleness detection

### GAPS
1. **Add `snapshot_id`** to the `edges` table (or a new `snapshots` table) that groups an odds fetch + PM fetch into one atomic unit
2. **Surface `as_of_ts`** in EdgeCard props and display "Odds as of HH:MM ET" on each card
3. **Propagate `fetched_at`** from Supabase queries through `api.ts` → components
4. **Add data staleness warning** when `fetched_at` is > N minutes old

---

## 2. CROSS-ECOSYSTEM GAP MATH

**STATUS**: ✅ BUILT

### Evidence

**Vig normalization (Hole 6)**:
```typescript
// src/lib/odds.ts:6-11 — American odds → implied probability
export function americanToImplied(odds: number): number {
    if (odds > 0) return 100 / (odds + 100)
    else return Math.abs(odds) / (Math.abs(odds) + 100)
}

// src/lib/odds.ts:68-84 — Power Method devigging
export function devigPower(impliedProbs: number[]): number[] { ... }
```

DB column: `odds.devigged_probability DECIMAL(5,4)` — `supabase/migrations/20260217000001_enhancements.sql:9`

**PM price → implied probability**:
```typescript
// src/lib/odds.ts:46
const predictionImplied = predictionPriceCents / 100
// src/lib/edge.ts:114
pmOdds.reduce((sum, o) => sum + o.odds / 100, 0) / pmOdds.length
```

**Delta computation**:
```typescript
// src/lib/gap.ts:14-16
export function teamGap(sbImplied: number, pmImplied: number): number {
  return Math.abs(sbImplied - pmImplied) * 100;
}

// src/lib/edge.ts:116
const gapPct = Math.round(Math.abs(sbAvgImplied - pmAvgImplied) * 1000) / 10;
```

**Stored per market**: `edges` table stores `sportsbook_implied`, `prediction_implied`, `edge_pct`, `direction` — `supabase/migrations/20260217000000_init.sql:84-96`

**Display thresholds**:
```typescript
// src/lib/edge.ts:11
export const INTL_THRESHOLD = 1.5;   // show international books
// src/lib/edge.ts:14
export const MIN_FEATURED_GAP = 2.0; // feature on landing page
```

**Confidence scoring**:
```typescript
// src/lib/edge.ts:27-31
function getConfidence(gapPct: number, sourceCount: number): 'high' | 'medium' | 'low' {
  if (gapPct >= 5 && sourceCount >= 3) return 'high';
  if (gapPct >= 2 && sourceCount >= 2) return 'medium';
  return 'low';
}
```

### GAPS
1. **`devigPower()` is defined but not called** in the data pipeline — no code currently invokes it during edge calculation. The `devigged_probability` column exists in DB but isn't populated by any pipeline
2. **No liquidity-weighted averaging** — PM prices are simple averages, not weighted by `volume_usd` (Hole 4 column exists but unused)

---

## 3. RED CARD / EVENT ALERTS

**STATUS**: ❌ NOT FOUND

### Evidence

No matching files found for:
- `**/alert*`, `**/event*`, `**/worker*`, `**/chat*` — all returned zero results
- No `lib/events.ts`, `api/alerts/`, `workers/` directories exist
- No webhook handlers, notification delivery code, or push/email/SMS/Telegram integrations
- No event ingest pipeline for goals, red cards, VAR, injuries
- No alert rules or trigger conditions
- No pre/post line tracking in any alert payload

### GAPS
1. **Build event ingest pipeline** — subscribe to a match events API (e.g., football-data.org, SportRadar) for goals, cards, VAR, substitutions
2. **Define alert rules** — thresholds for line movement (>2% shift), red card impact recalculation, VAR decisions
3. **Notification delivery** — implement at least one channel (Telegram bot recommended for MVP, email for broader reach)
4. **Alert payload** — include `pre_line`, `post_line`, `event_type`, `timestamp`, `match_context`

---

## 4. /LEARN PAGES (SEO AUTHORITY)

**STATUS**: 🔄 PARTIAL

### Evidence

**Sitemap references** (pages are planned but not built):
```xml
<!-- public/sitemap.xml:10-26 -->
<loc>https://thedrip.to/learn/withdrawals</loc>    <!-- priority 0.8 -->
<loc>https://thedrip.to/learn/how-it-works</loc>    <!-- priority 0.7 -->
<loc>https://thedrip.to/learn/odds-converter</loc>   <!-- priority 0.7 -->
```

**Withdrawal data exists** — `src/data/withdrawal-metadata.ts` contains complete deposit/withdrawal metadata for all 12 venues (5 US regulated, 2 international, 5 prediction markets) with method, speed, fee, min, max.

**No actual /learn pages or routes**:
- No files under `src/pages/Learn*`, `src/pages/learn/`, or any MDX/content files
- `src/App.tsx` defines only 3 routes: `/`, `/group/d`, `/edges/:slug`
- No React components for learn content

**No "last updated" timestamps** on any content pages.

**Client-only rendering** — this is a Vite SPA. No SSR/SSG for learn pages. The only server-rendered content is pre-rendered static HTML in `public/edges/*/index.html`.

### GAPS
1. **Create `/learn/withdrawals` page** — data is ready in `withdrawal-metadata.ts`, just needs a React component with table rendering
2. **Create `/learn/prediction-markets`** — explain Kalshi vs Polymarket, KYC requirements, geography constraints (US-only for Kalshi, crypto for Polymarket)
3. **Create `/learn/legality`** — state-by-state legality matrix for sportsbooks, CFTC regulation for prediction markets
4. **Add routes** to `App.tsx` for all learn pages
5. **Add "last updated" display** to each learn page
6. **Consider pre-rendering** learn pages (like edges) for SEO since Vite SPA content isn't visible to crawlers without JS

---

## 5. /EDGES/[MATCH] GENERATOR + SEO HYGIENE

**STATUS**: ✅ BUILT (with gaps)

### Evidence

**Deterministic URLs** — slug-based:
```typescript
// src/data/all-matches.ts provides slugs like:
// "usa-vs-par-2026-06-12", "qf-1-2026-07-09", "golden-boot-mbappe"
```

**Canonical tags** on every pre-rendered page:
```html
<!-- scripts/prerender-matches.ts:78 -->
<link rel="canonical" href="https://thedrip.to/edges/${match.slug}/">
```

Also on `index.html:16`:
```html
<link rel="canonical" href="https://thedrip.to/" />
```

**JSON-LD SportsEvent schema** on every edge page — `scripts/prerender-matches.ts:91-108`

**Open Graph + Twitter meta tags** — `scripts/prerender-matches.ts:81-88`

**Sitemap** — `public/sitemap.xml` covers all 104 match pages + 3 learn URLs + home, with `lastmod`, `changefreq`, `priority`

**robots.txt** — `public/robots.txt` allows search engines, blocks training bots (GPTBot, anthropic-ai), references sitemap

**Internal linking**:
- Home → Group D, Golden Boot edge (`src/pages/Home.tsx:12,18`)
- Group D → individual edges via EdgeCard links (`src/pages/GroupPage.tsx:59,71,85,110`)
- Pre-rendered pages → SPA live view (`scripts/prerender-matches.ts:175`)
- **Missing**: No learn ↔ edges cross-links, no edges → learn links

**Dynamic SPA route**: `/edges/:slug` in `src/App.tsx:12` — but `EdgeDetailPage.tsx` is a stub:
```typescript
// src/pages/EdgeDetailPage.tsx:22-24
<p className="text-lg text-[var(--silver)] font-serif italic">
    Full edge breakdown coming soon.
</p>
```

### NOT FOUND
- **No `noindex` rule** for thin/missing data pages — all 104 pages render identical placeholder content with "—" dashes
- **No pruning strategy** for expired matches (post-tournament cleanup)
- **No internal linking** between learn and edges sections

### GAPS
1. **Add `<meta name="robots" content="noindex">` for pages with no odds data** — currently all 104 placeholder pages are indexable with identical "—" content, which is thin content risk
2. **Implement conditional noindex** in `prerender-matches.ts` based on whether odds data exists
3. **Build `EdgeDetailPage.tsx`** — currently a stub, should render actual edge data from Supabase
4. **Add cross-linking** between learn pages and edge pages
5. **Add pruning strategy** — set `noindex` on expired matches or redirect to a "results" view

---

## 6. PREDICTION MARKET DATA

**STATUS**: 🔄 PARTIAL

### Evidence

**Integrated PMs**: Kalshi + Polymarket (primary), Robinhood + Interactive Brokers (listed in affiliate URLs)

**Database schema** — `prediction_prices` table:
```sql
-- supabase/migrations/20260217000000_init.sql:68-79
source TEXT NOT NULL,              -- 'kalshi', 'polymarket'
price_cents INT,                   -- 55 = $0.55 = 55% implied
implied_probability DECIMAL(5, 4),
volume_usd DECIMAL(12, 2),
fetched_at TIMESTAMPTZ DEFAULT now()
```

**Seed data** — one Kalshi sample row:
```sql
-- supabase/migrations/20260217000000_init.sql:166-167
INSERT INTO prediction_prices ... ('group_winner', 'USA', 'kalshi', 45, 0.4500)
```

**Affiliate URLs** — `src/data/book-urls.ts:49-64`:
- Kalshi: `kalshi.com/sign-up/?referral=thedrip`
- Polymarket: `polymarket.com/?ref=thedrip`
- Robinhood: `join.robinhood.com/thedrip`
- Interactive Brokers: `interactivebrokers.com/referral/thedrip`

**Pre-rendered pages list sources**: "DraftKings, FanDuel, BetMGM, Caesars, BetRivers, Kalshi, Polymarket"

### NOT FOUND
- **No data fetching pipeline** — no API integration code for Kalshi or Polymarket APIs
- **No refresh frequency** defined — no cron jobs, no polling intervals, no Supabase Edge Functions
- **No Supabase Edge Functions** exist in `supabase/functions/`
- Only 1 seed row for PM data (Kalshi USA group winner)

### GAPS
1. **Build Kalshi API integration** — fetch event contract prices via Kalshi REST API
2. **Build Polymarket API integration** — fetch CLOB orderbook data
3. **Define refresh cadence** — recommendation: every 15 min pre-tournament, every 5 min during matches
4. **Store with timestamps** — `fetched_at` column exists, just needs pipeline to populate it
5. **Implement liquidity-weighted pricing** using `volume_usd`

---

## 7. SPORTSBOOK DATA

**STATUS**: 🔄 PARTIAL

### Evidence

**Integrated books** (by affiliate URL and DB schema):
- **US Regulated**: DraftKings, FanDuel, BetMGM, Caesars, BetRivers — `src/data/book-urls.ts:17-36`
- **International**: Bovada, BetOnline — `src/data/book-urls.ts:39-46`
- DB `odds.source` column: `'draftkings', 'fanduel', 'betmgm', 'caesars'` — `supabase/migrations/20260217000000_init.sql:58`

**Database schema** — `odds` table:
```sql
-- supabase/migrations/20260217000000_init.sql:53-63
american_odds INT,
implied_probability DECIMAL(5, 4),
fetched_at TIMESTAMPTZ DEFAULT now()
```

Enhanced with: `devigged_probability DECIMAL(5,4)` — `supabase/migrations/20260217000001_enhancements.sql:9`

**Seed data** — one DraftKings sample row:
```sql
-- supabase/migrations/20260217000000_init.sql:162-163
INSERT INTO odds ... ('futures_group_winner', 'USA', 'draftkings', 150, 0.4000)
```

**Vig calculation** — `devigPower()` defined in `src/lib/odds.ts:68-84` but not wired into any pipeline.

**Hardcoded odds in UI** — `src/pages/GroupPage.tsx` has hardcoded edge percentages and odds strings, not fetched from Supabase:
```typescript
// src/pages/GroupPage.tsx:51-52
sportsbookOdds="+150"    // hardcoded string
edgePercentage={5.2}     // hardcoded number
```

### NOT FOUND
- **No odds API integration** — no code fetches from DraftKings, FanDuel, or any odds provider API
- **No refresh frequency** — no polling, no cron, no scheduled functions
- **Vig is calculated (`devigPower`) but never called** in any execution path
- **`devigged_probability` column** exists in DB but has no population pipeline

### GAPS
1. **Build odds ingestion pipeline** — integrate with an odds aggregator API (The Odds API, OddsJam, etc.) or scrape individual books
2. **Wire `devigPower()`** into the pipeline — compute devigged probabilities on ingest and store in `devigged_probability`
3. **Define refresh cadence** — recommendation: every 10 min for futures, every 2 min for live match odds
4. **Replace hardcoded odds** in `GroupPage.tsx` with dynamic Supabase queries
5. **Expose vig % to users** — show "Book Overround: X%" on edge cards

---

## SUMMARY TABLE

| # | Layer | Status | Core Logic | Data Pipeline | UI Display |
|---|-------|--------|------------|---------------|------------|
| 1 | Snapshot Binding | 🔄 PARTIAL | DB timestamps exist | Not surfaced to frontend | No `as_of_ts` shown |
| 2 | Gap Math | ✅ BUILT | americanToImplied, devigPower, teamGap, getEdgeInsight | Thresholds defined (1.5%, 2.0%, 5.0%) | EdgeCard renders gaps + confidence |
| 3 | Event Alerts | ❌ NOT FOUND | — | — | — |
| 4 | /learn Pages | 🔄 PARTIAL | Withdrawal data exists | Sitemap references 3 learn URLs | No routes or components built |
| 5 | /edges/[match] SEO | ✅ BUILT | 104 pre-rendered pages | Canonical, JSON-LD, OG, sitemap, robots.txt | No noindex for thin pages |
| 6 | PM Data | 🔄 PARTIAL | Schema + types ready | 1 seed row, no API pipeline | Hardcoded in UI |
| 7 | Sportsbook Data | 🔄 PARTIAL | Schema + devig function | 1 seed row, no API pipeline | Hardcoded in UI |

### Priority Order for Completion

1. **P0 — Data pipelines** (sections 6, 7): Without live odds and PM data flowing in, everything else is static. Build Supabase Edge Functions for odds + PM ingestion.
2. **P0 — Dynamic UI** (sections 1, 5): Replace hardcoded GroupPage data with Supabase queries. Surface `fetched_at` timestamps. Build EdgeDetailPage.
3. **P1 — /learn pages** (section 4): Withdrawal data is ready. Create 3 learn routes + components. Pre-render for SEO.
4. **P1 — SEO hardening** (section 5): Add noindex for thin pages. Cross-link learn ↔ edges.
5. **P2 — Event alerts** (section 3): Requires match event data source. Build after core data pipeline is stable.
6. **P2 — Snapshot binding** (section 1): Add snapshot_id after data pipeline proves stable.

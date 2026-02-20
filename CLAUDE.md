# THE DRIP — MASTER CONTEXT

## Project Overview

Oracle-grade edge analysis for FIFA World Cup 2026. Comparing sportsbook implied probabilities (DraftKings, FanDuel) against prediction market benchmarks (Kalshi, Polymarket) to identify pricing discrepancies.

## Core Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Design System**: Obsidian Weissach v7 (Dark mode, glassmorphism, precise rail alignment)
- **Deployment**: Netlify

## Database Schema (Supabase)

1. `teams`: FIFA rankings, group assignments, flags.
2. `venues`: Stadium metadata, timezones, capacities.
3. `matches`: Schedule, status, score integration.
4. `odds`: Raw and devigged probabilities from sportsbooks.
5. `prediction_prices`: Liquidity-weighted benchmarks from prediction markets.
6. `edges`: Calculated gaps between markets with confidence scoring.

## Critical Logic

- **Devigging**: Hole 6 (Converting raw vig-included odds to fair probability).
- **Liquidity Thresholds**: Hole 4 (Filtering edges by market volume).
- **Schema**: SportsEvent JSON-LD for rich result SEO.

## Commands

- `npm run build`: Production Vite build.
- `npx tsc --noEmit`: Type checking.
- `supabase db push`: (Future) Sync migrations.

/**
 * useHomepageData — Data hooks for homepage boards (Trends, Picks, Props Edge)
 *
 * Calls Supabase RPCs:
 *   - get_all_trends(53::numeric, 'trend'::text)
 *   - get_daily_picks()
 *   - get_todays_prop_edges()
 *
 * Falls back gracefully when Supabase is unconfigured.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TrendRow {
  team: string;
  league: string;
  layer: string;
  trend: string;
  sample: number;
  hit_rate: number;
  visibility: string;
  last_result?: boolean | null;
}

export interface PickRow {
  home_team: string;
  away_team: string;
  league: string;
  play: string;
  pick_type: string;
  game_time?: string;
}

export interface PropEdgeRow {
  grade: string;
  player: string;
  prop: string;
  side: string;
  line: number;
  odds: string;
  pick_type?: string;
  hist_total?: number;
  hist_win_pct?: number;
  hist_avg?: number;
  delta?: number;
}

// ── Layer → Section label mapping ──────────────────────────────────────────

export const LAYER_LABELS: Record<string, string> = {
  SOCCER_1H_BTTS: 'First Half Both Teams to Score',
  SOCCER_HALF_GOALS: 'Second Half Goals',
  SOCCER_LATE_GOALS: "Late Goals (After 75')",
  SOCCER_CORNERS: 'Corners',
  SOCCER_CARDS: 'Cards',
  SOCCER_HT_FT: 'Halftime / Fulltime',
  TEAM_OU_LINE: 'Over/Under the Line',
  TEAM_ATS_LINE: 'Against the Spread',
  LEAGUE: 'League-Wide Trends',
};

// ── Trend text → plain English ─────────────────────────────────────────────

export function humanizeTrend(raw: string): string {
  const t = raw.trim().toUpperCase();

  if (t === '1H BTTS NO') return 'No 1st Half BTTS';
  if (t === '1H BTTS YES' || t === 'BTTS YES') return 'Both Teams Score';
  if (t === 'BTTS NO') return 'Clean Sheet on One Side';
  if (t === '2H GOALS > 0') return 'Goal Scored in 2nd Half';
  if (t === 'LATE GOAL RESISTANT') return "No Goal After 75'";
  if (t === 'UNDER VS LINE') return 'Under the Total';
  if (t === 'OVER VS LINE') return 'Over the Total';
  if (t === 'DOG COVER') return 'Covers as Underdog';
  if (t === 'FAV COVER') return 'Covers as Favorite';

  // CORNERS UNDER 10.2 → Under 10 Corners
  const cornersUnder = t.match(/^CORNERS UNDER ([\d.]+)$/);
  if (cornersUnder) return `Under ${Math.floor(parseFloat(cornersUnder[1]))} Corners`;

  // CORNERS OVER 9.8 → Over 10 Corners
  const cornersOver = t.match(/^CORNERS OVER ([\d.]+)$/);
  if (cornersOver) return `Over ${Math.ceil(parseFloat(cornersOver[1]))} Corners`;

  // CARDS UNDER 4.1 → Under 4 Cards
  const cardsUnder = t.match(/^CARDS UNDER ([\d.]+)$/);
  if (cardsUnder) return `Under ${Math.floor(parseFloat(cardsUnder[1]))} Cards`;

  // CARDS OVER 3.8 → Over 4 Cards
  const cardsOver = t.match(/^CARDS OVER ([\d.]+)$/);
  if (cardsOver) return `Over ${Math.ceil(parseFloat(cardsOver[1]))} Cards`;

  // Fallback: title case
  return raw
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Record string from sample + hit_rate ───────────────────────────────────

export function deriveRecord(sample: number, hitRate: number): string {
  const wins = Math.round(sample * hitRate);
  const losses = sample - wins;
  return `${wins}-${losses}`;
}

// ── Pick type mapping ──────────────────────────────────────────────────────

export function mapPickType(pickType: string): string {
  const map: Record<string, string> = {
    ml_streak: 'ML Streak',
    ml_fade: 'ML Fade',
    ou_trend: 'O/U Trend',
    ou_fade: 'O/U Fade',
    btts_trend: 'BTTS Trend',
    btts_fade: 'BTTS Fade',
    ats_trend: 'ATS Trend',
    ats_fade: 'ATS Fade',
    spread_trend: 'Spread Trend',
    spread_fade: 'Spread Fade',
    prop_trend: 'Prop Trend',
    prop_fade: 'Prop Fade',
  };
  return map[pickType] || pickType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useTrends() {
  return useQuery<TrendRow[]>({
    queryKey: ['homepage-trends'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];

      try {
        const { data, error } = await supabase.rpc('get_all_trends', {
          p_sport_id: 53,
          p_type: 'trend',
        });

        if (error || !data) return [];

        // Filter to PUBLIC only
        return (data as TrendRow[]).filter(
          (row) => row.visibility === 'PUBLIC'
        );
      } catch {
        return [];
      }
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

export function useDailyPicks() {
  return useQuery<PickRow[]>({
    queryKey: ['homepage-daily-picks'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];

      try {
        const { data, error } = await supabase.rpc('get_daily_picks');

        if (error || !data) return [];

        return data as PickRow[];
      } catch {
        return [];
      }
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

export function usePropEdges() {
  return useQuery<PropEdgeRow[]>({
    queryKey: ['homepage-prop-edges'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];

      try {
        const { data, error } = await supabase.rpc('get_todays_prop_edges');

        if (error || !data) return [];

        return data as PropEdgeRow[];
      } catch {
        return [];
      }
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

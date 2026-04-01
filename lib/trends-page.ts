import { createServerSupabaseClient } from './supabase/server';

export type TrendDirection = 'trend' | 'fade' | 'neutral';

export interface TrendsPageRequestFilters {
  league?: string | null;
  layer?: string | null;
  minRate?: number;
  limit?: number;
}

export interface TrendsPageTrendRow {
  id: string;
  section: string | null;
  team: string;
  league: string;
  trend: string;
  record: string;
  hitRate: number;
  sample: number;
  lastHeld: boolean;
  layer: string;
  signalType: string;
  direction: TrendDirection;
  logoUrl: string | null;
  updatedAt?: string;
}

export interface TrendsSummaryMetrics {
  avgGoals: number | null;
  avgCorners: number | null;
  avgCards: number | null;
  avgPassPct: number | null;
  avgShotAccuracy: number | null;
  overRoi: number | null;
  homeAtsRoi: number | null;
}

export interface TrendsPageData {
  updatedAt: string;
  sourceLabel: string;
  rows: TrendsPageTrendRow[];
  layers: string[];
  leagues: string[];
  metrics: TrendsSummaryMetrics;
}

type TrendDbRow = Record<string, unknown>;
type MatchFeedRow = Record<string, unknown>;
type TeamLogoRow = Record<string, unknown>;

const SITE_URL = 'https://thedrip.to';
const SOURCE_UNKNOWN = 'Trend feed unavailable';
const SOURCE_LIVE = 'Powered by get_trends RPC';
const DEFAULT_MIN_RATE = 80;
const DEFAULT_LIMIT = 250;
const DEFAULT_MAX_ROWS = 1000;

function readString(row: TrendDbRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  return null;
}

function readNumber(row: TrendDbRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value.trim());
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function readBoolean(row: TrendDbRow, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'y', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'n', 'no', 'off'].includes(normalized)) return false;
    }
  }
  return null;
}

function normalizeDirection(value: string | null, trend: string, signalType: string): TrendDirection {
  const check = `${(value ?? '')} ${(trend ?? '')} ${(signalType ?? '')}`.toLowerCase();
  if (/\b(fade|under|down|away|dog|sell|against|negative|lay|off)\b/.test(check)) return 'fade';
  if (/\b(trend|over|up|home|favorable|buy|for|positive|long)\b/.test(check)) return 'trend';
  return 'neutral';
}

function normalizeLeagueName(value: string): string {
  const raw = value.trim();
  if (!raw) return 'global';
  if (/^[A-Za-z]{2,6}\.\d+$/.test(raw)) return raw.toUpperCase();
  if (raw.length <= 3) return raw.toUpperCase();
  return raw
    .split(/[-_./\s]+/)
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase();
      if (upper.length <= 3) return upper;
      return `${upper.charAt(0)}${upper.slice(1).toLowerCase()}`;
    })
    .join(' ');
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  const items = Array.from(new Set(values.filter(Boolean)));
  items.sort((a, b) => a.localeCompare(b));
  return items;
}

function mapToTrendRow(row: TrendDbRow): TrendsPageTrendRow | null {
  const section = readString(row, ['section']) ?? null;
  const layer = readString(row, ['layer', 'signal_layer']) ?? 'Unspecified layer';
  const team = readString(row, ['team', 'entity', 'team_name']) ?? 'Unknown team';
  const league = normalizeLeagueName(readString(row, ['league', 'league_id']) ?? 'global');
  const trend = readString(row, ['trend', 'signal']) ?? 'No trend text';
  const record = readString(row, ['record', 'record_line']) ?? '0-0';
  const hitRate = readNumber(row, ['hit_rate', 'hitrate']) ?? null;
  const sample = Math.max(0, Math.round(readNumber(row, ['sample', 'sample_size', 'games']) ?? 0));
  const lastHeld = readBoolean(row, ['last_held', 'lastheld']) ?? false;
  const signalType = (readString(row, ['signal_type', 'signalType']) ?? 'trend').toLowerCase();

  if (!Number.isFinite(hitRate)) return null;

  return {
    id: `${league}|${team}|${layer}|${trend}`.toLowerCase(),
    section,
    team,
    league,
    trend,
    record,
    hitRate: Number(Math.max(0, Math.min(100, hitRate)).toFixed(1)),
    sample,
    lastHeld,
    layer,
    signalType,
    direction: normalizeDirection(signalType, trend, signalType),
    logoUrl: null,
  };
}

function clampMinRate(value: number | undefined): number {
  if (!Number.isFinite(value ?? NaN)) return DEFAULT_MIN_RATE;
  return Math.min(100, Math.max(50, Math.round(value)));
}

function clampLimit(value: number | undefined): number {
  if (!Number.isFinite(value ?? NaN)) return DEFAULT_LIMIT;
  return Math.min(1000, Math.max(25, Math.round(value)));
}

function pickOne<T>(row: Record<string, unknown>, keys: string[]): T | null {
  for (const key of keys) {
    const raw = row[key];
    if (raw !== null && raw !== undefined) return raw as T;
  }
  return null;
}

function round1(value: number | null): number | null {
  if (!Number.isFinite(value ?? NaN)) return null;
  return Math.round(value * 10) / 10;
}

function toTeamLogoKey(league: string, team: string): string {
  return `${normalizeLeagueName(league)}::${normalizeKey(team)}`;
}

function addPercentage(value: number | null, list: number[]): void {
  if (Number.isFinite(value ?? NaN)) list.push(Number(value.toFixed(4)));
}

function addTotalFromPair(row: MatchFeedRow, pairs: Array<[string[], string[]]> , list: number[]): void {
  for (const [leftKeys, rightKeys] of pairs) {
    const left = readNumber(row, leftKeys);
    const right = readNumber(row, rightKeys);
    if (Number.isFinite(left ?? NaN) || Number.isFinite(right ?? NaN)) {
      const total = (left ?? 0) + (right ?? 0);
      if (Number.isFinite(total)) list.push(total);
      return;
    }
  }
}

function addAverageFromPair(row: MatchFeedRow, pairs: Array<[string[], string[]]>, list: number[]): void {
  for (const [leftKeys, rightKeys] of pairs) {
    const left = readNumber(row, leftKeys);
    const right = readNumber(row, rightKeys);
    if (Number.isFinite(left ?? NaN) || Number.isFinite(right ?? NaN)) {
      const count = (left !== null ? 1 : 0) + (right !== null ? 1 : 0);
      if (count === 0) return;
      const mean = ((left ?? 0) + (right ?? 0)) / count;
      if (Number.isFinite(mean)) list.push(mean);
      return;
    }
  }
}

function normalizePercent(value: number | null): number | null {
  if (!Number.isFinite(value ?? NaN)) return null;
  if (Math.abs(value) <= 1) return value * 100;
  return value;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestUpdatedAt(rows: TrendsPageTrendRow[]): string {
  const rowsWithDate = rows
    .map((row) => row.updatedAt)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  if (rowsWithDate.length === 0) return new Date().toISOString();

  const latest = rowsWithDate
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value))
    .reduce((acc, value) => (value > acc ? value : acc), -Infinity);

  if (!Number.isFinite(latest) || latest <= 0) return new Date().toISOString();
  return new Date(latest).toISOString();
}

async function loadTeamLogos(
  rows: TrendsPageTrendRow[],
  supabase: ReturnType<typeof createServerSupabaseClient>,
): Promise<void> {
  if (!rows.length) return;

  const leagues = Array.from(new Set(rows.map((row) => normalizeLeagueName(row.league))));

  if (rows.length === 0 || leagues.length === 0) return;

  const { data, error } = await supabase
    .from('team_logos')
    .select('team_name, league_id, logo_url')
    .in('league_id', leagues);

  if (error || !data) return;

  const logoByKey = new Map<string, string>();
  for (const raw of data as TeamLogoRow[]) {
    const teamName = readString(raw, ['team_name']);
    const leagueId = readString(raw, ['league_id']);
    const logoUrl = readString(raw, ['logo_url']);

    if (!teamName || !leagueId || !logoUrl) continue;
    logoByKey.set(toTeamLogoKey(leagueId, teamName), logoUrl);
  }

  for (const row of rows) {
    const key = toTeamLogoKey(row.league, row.team);
    row.logoUrl = logoByKey.get(key) ?? null;
  }
}

async function loadLiveTrends(filters: TrendsPageRequestFilters = {}): Promise<TrendsPageTrendRow[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const pLeague = filters.league && filters.league.trim().toLowerCase() !== 'all' ? filters.league.trim() : null;
  const pLayer = filters.layer && filters.layer.trim().toLowerCase() !== 'all' ? filters.layer.trim() : null;

  const args = {
    p_league: pLeague,
    p_layer: pLayer,
    p_min_rate: clampMinRate(filters.minRate),
    p_limit: clampLimit(filters.limit),
  };

  try {
    const { data, error } = await supabase.rpc('get_trends', args);
    if (error || !data) return [];

    const rows = (data as TrendDbRow[])
      .map(mapToTrendRow)
      .filter((row): row is TrendsPageTrendRow => row !== null)
      .filter((row) => row.hitRate >= clampMinRate(filters.minRate));

    const rowsWithIds = rows.map((row, index) => ({
      ...row,
      id: `${row.id}-${index}`,
    }));

    const uniqueRows = Array.from(
      new Map(
        rowsWithIds.map((row) => [`${row.team.toLowerCase()}|${row.league.toLowerCase()}|${row.layer}|${row.trend}`, row]),
      ).values(),
    );

    await loadTeamLogos(uniqueRows, supabase);
    return uniqueRows.sort((left, right) => right.hitRate - left.hitRate).slice(0, clampLimit(filters.limit));
  } catch {
    return [];
  }
}

async function loadMatchFeedSummary(): Promise<TrendsSummaryMetrics> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return {
      avgGoals: null,
      avgCorners: null,
      avgCards: null,
      avgPassPct: null,
      avgShotAccuracy: null,
      overRoi: null,
      homeAtsRoi: null,
    };
  }

  try {
    const { data, error } = await supabase.from('match_feed').select('*').eq('status', 'finished');
    if (error || !data || data.length === 0) {
      return {
        avgGoals: null,
        avgCorners: null,
        avgCards: null,
        avgPassPct: null,
        avgShotAccuracy: null,
        overRoi: null,
        homeAtsRoi: null,
      };
    }

    const goals: number[] = [];
    const corners: number[] = [];
    const cards: number[] = [];
    const passPct: number[] = [];
    const shotAccuracy: number[] = [];
    const overRoiSamples: number[] = [];
    const atsRoiSamples: number[] = [];

    for (const row of data as MatchFeedRow[]) {
      addTotalFromPair(row, [
        [['home_score'], ['away_score']],
        [['home_goals'], ['away_goals']],
        [['home_team_score'], ['away_team_score']],
        [['goals_scored'], ['goals_allowed']],
      ], goals);

      addTotalFromPair(row, [
        [['home_corners'], ['away_corners']],
        [['corners'], ['total_corners']],
      ], corners);

      addTotalFromPair(row, [
        [['home_cards'], ['away_cards']],
        [['team_cards'], ['opponent_cards']],
      ], cards);

      addAverageFromPair(row, [
        [['home_pass_pct'], ['away_pass_pct']],
        [['home_pass_percentage'], ['away_pass_percentage']],
      ], passPct);

      addAverageFromPair(row, [
        [['home_shot_accuracy'], ['away_shot_accuracy']],
        [['home_shots_accuracy'], ['away_shots_accuracy']],
      ], shotAccuracy);

      const over = pickOne<number>(row, ['over_roi', 'over_roi_pct', 'over_roi_percentage']);
      const homeAts = pickOne<number>(row, ['home_ats_roi', 'home_ats_roi_pct', 'home_ats_roi_percentage']);
      if (Number.isFinite(over ?? NaN)) addPercentage(normalizePercent(over), overRoiSamples);
      if (Number.isFinite(homeAts ?? NaN)) addPercentage(normalizePercent(homeAts), atsRoiSamples);
    }

    return {
      avgGoals: round1(average(goals)),
      avgCorners: round1(average(corners)),
      avgCards: round1(average(cards)),
      avgPassPct: round1(average(passPct)),
      avgShotAccuracy: round1(average(shotAccuracy)),
      overRoi: round1(average(overRoiSamples)),
      homeAtsRoi: round1(average(atsRoiSamples)),
    };
  } catch {
    return {
      avgGoals: null,
      avgCorners: null,
      avgCards: null,
      avgPassPct: null,
      avgShotAccuracy: null,
      overRoi: null,
      homeAtsRoi: null,
    };
  }
}

export async function getTrendsPageData(
  filters: TrendsPageRequestFilters = {},
): Promise<TrendsPageData> {
  const rows = await loadLiveTrends(filters);
  const metrics = await loadMatchFeedSummary();
  const layers = uniqueSorted(rows.map((row) => row.layer));
  const leagues = uniqueSorted(rows.map((row) => row.league));

  return {
    updatedAt: latestUpdatedAt(rows),
    sourceLabel: rows.length > 0 ? SOURCE_LIVE : SOURCE_UNKNOWN,
    rows,
    layers,
    leagues,
    metrics,
  };
}

export function buildTrendMeta(): {
  title: string;
  canonical: string;
  description: string;
} {
  return {
    title: 'Trends | SportsSync',
    canonical: `${SITE_URL}/trends`,
    description: 'Trend and signal board for market edges and team behavior.',
  };
}

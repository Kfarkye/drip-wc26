/**
 * Pre-render static HTML for World Cup 2026 edge pages.
 * Generates SEO-ready pages in public/edges/<slug>/index.html and sitemap.xml.
 *
 * Data behavior:
 * - Pull match-level probabilities from Supabase `matches` when credentials exist.
 * - Pull bookmaker rows from `soccer_player_odds` and `player_prop_bets` by `match_id`.
 * - If no bookmaker 3-way lines are available, render model-implied odds and pre-market note.
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { ALL_MATCHES, type MatchSeed } from '../src/data/all-matches';
import { EDGE_LANGUAGES, LANGUAGE_LABELS } from '../src/data/languages';
import { allGroups } from '../src/data/groups';

const SITE_URL = 'https://thedrip.to';
const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');
const BUILD_TIME = new Date().toISOString().slice(0, 10);
const TOURNAMENT_START = '2026-06-01T00:00:00.000Z';
const TOURNAMENT_END = '2026-07-31T23:59:59.999Z';

const SUPABASE_URL =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qffzvrnbzabcokqqrwbv.supabase.co';
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

type DbRow = Record<string, unknown>;
type Outcome = 'away' | 'draw' | 'home';

interface MatchedDbMatch {
    row: DbRow;
    swapped: boolean;
    rowId: string | null;
    league: string | null;
    kickoff: string | null;
    venueName: string | null;
    venueCity: string | null;
    venueState: string | null;
    status: string | null;
}

interface ModelProbabilities {
    away: number | null;
    draw: number | null;
    home: number | null;
}

interface BookmakerCard {
    bookmaker: string;
    odds: Record<Outcome, string>;
    implied: Record<Outcome, string>;
    decimal: Record<Outcome, number>;
    sourceCount: number;
}

interface EdgeSignal {
    outcome: Outcome;
    teamLabel: string;
    gap: number;
    modelProb: number;
    marketProb: number;
    edgeLabel: string;
    summary: string;
}

interface MatchTranslation {
    languageCode: string;
    title: string;
    metaDescription: string;
    analysisHeadline: string;
    analysisBody: string;
    keyFactors: string[];
}

interface RenderModel {
    match: MatchSeed;
    matchedDb: MatchedDbMatch | null;
    modelProb: ModelProbabilities;
    modelOdds: Record<Outcome, string>;
    modelImplied: Record<Outcome, string>;
    bookmakerCards: BookmakerCard[];
    trackedBookmakers: string[];
    hasBookmakerLines: boolean;
    edgeSignal: EdgeSignal | null;
    leagueProfile: DbRow | null;
    leadParagraph: string;
    structuralLines: string[];
    keyNumberLines: string[];
    pageTitle: string;
    pageDescription: string;
    translations: Record<string, MatchTranslation>;
    availableLanguages: string[];
}

interface SupabaseLoad {
    matchesRows: DbRow[];
    soccerOddsByMatchId: Map<string, DbRow[]>;
    propOddsByMatchId: Map<string, DbRow[]>;
    leagueProfiles: Map<string, DbRow>;
    translationsBySlug: Map<string, Map<string, MatchTranslation>>;
}

const VENUE_STATE_BY_MATCH_NUMBER = new Map<number, string>();
for (const group of Object.values(allGroups)) {
    for (const m of group.matches) {
        if (typeof m.matchNumber === 'number' && m.venue.state) {
            VENUE_STATE_BY_MATCH_NUMBER.set(m.matchNumber, m.venue.state);
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeJsonForScript(value: unknown): string {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const TEAM_ALIAS: Record<string, string> = {
    usa: 'united states',
    'u s a': 'united states',
    usmnt: 'united states',
    'korea republic': 'south korea',
    'republic of korea': 'south korea',
    "cote d ivoire": 'ivory coast',
    'cote divoire': 'ivory coast',
    "cote d'ivoire": 'ivory coast',
};

function normalizeTeam(value: string): string {
    const normalized = normalizeText(value);
    return TEAM_ALIAS[normalized] ?? normalized;
}

function readFirstString(row: DbRow, keys: string[]): string | null {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
}

function readFirstNumber(row: DbRow, keys: string[]): number | null {
    for (const key of keys) {
        const value = row[key];
        const numeric = toNumber(value);
        if (numeric != null) return numeric;
    }
    return null;
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const cleaned = value.trim();
        if (!cleaned) return null;
        const parsed = Number.parseFloat(cleaned.replace(/[^0-9.+-]/g, ''));
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}

function normalizeProbability(value: unknown): number | null {
    const n = toNumber(value);
    if (n == null) return null;

    if (n > 0 && n < 1) return n;
    if (n >= 1 && n <= 100) return n / 100;
    return null;
}

function toAmericanOdds(decimal: number): string {
    if (!decimal || decimal <= 1) return 'N/A';
    if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
    return `-${Math.round(100 / (decimal - 1))}`;
}

function probToAmericanOdds(prob: number): string {
    if (!prob || prob <= 0 || prob >= 1) return 'N/A';
    const decimal = 1 / prob;
    return toAmericanOdds(decimal);
}

function americanToDecimal(american: number): number | null {
    if (!Number.isFinite(american) || american === 0) return null;
    if (american > 0) return (american / 100) + 1;
    return (100 / Math.abs(american)) + 1;
}

function decimalToImplied(decimal: number): number | null {
    if (!Number.isFinite(decimal) || decimal <= 1) return null;
    return 1 / decimal;
}

function formatPercent(prob: number | null): string {
    if (prob == null || prob <= 0 || prob >= 1) return 'N/A';
    return `${(prob * 100).toFixed(1)}%`;
}

function asIdKey(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return null;
}

function kickoffIsoFromRow(row: DbRow): string | null {
    return readFirstString(row, ['start_time', 'commence_time', 'kickoff', 'match_time']);
}

function formatHeaderDateTimeUtc(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Kickoff time pending';

    const dayPart = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    });
    return `${dayPart} · ${timePart} UTC`;
}

function formatDateShort(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Date pending';
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

function daysToKickoff(iso: string): number | null {
    const target = new Date(iso);
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function countdownLabel(iso: string): string {
    const days = daysToKickoff(iso);
    if (days == null) return 'KICKOFF TBA';
    if (days > 1) return `${days} DAYS TO KICKOFF`;
    if (days === 1) return '1 DAY TO KICKOFF';
    if (days === 0) return 'MATCHDAY';
    return 'COMPLETED';
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    return error.code === '42703' || /column .* does not exist/i.test(error.message ?? '');
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    return error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? '');
}

function parseError(value: unknown): { code?: string; message?: string } | null {
    if (!value || typeof value !== 'object') return null;
    const row = value as { code?: unknown; message?: unknown };
    return {
        code: typeof row.code === 'string' ? row.code : undefined,
        message: typeof row.message === 'string' ? row.message : undefined,
    };
}

function phaseLabel(phase: MatchSeed['phase']): string {
    const labels: Record<MatchSeed['phase'], string> = {
        group: 'Group Stage',
        'round-of-32': 'Round of 32',
        'round-of-16': 'Round of 16',
        quarterfinal: 'Quarterfinal',
        semifinal: 'Semifinal',
        'third-place': 'Third Place',
        final: 'Final',
    };
    return labels[phase] ?? phase;
}

function isRealTeam(name: string): boolean {
    return !/^[WL\d]/.test(name) && !/Playoff/.test(name) && !/^\d[A-Z]/.test(name);
}

function clampDescription(value: string, max = 155): string {
    const collapsed = value.replace(/\s+/g, ' ').trim();
    if (collapsed.length <= max) return collapsed;
    const slice = collapsed.slice(0, max);
    const cut = slice.lastIndexOf(' ');
    return `${slice.slice(0, cut > 80 ? cut : max - 1).trim()}.`;
}

function teamsToSeoTitle(match: MatchSeed): string {
    if (isRealTeam(match.awayTeam) && isRealTeam(match.homeTeam)) {
        return `${match.awayTeam} vs ${match.homeTeam}`;
    }
    return `${phaseLabel(match.phase)} Match ${match.matchNumber}`;
}

function buildPageTitle(match: MatchSeed): string {
    return `${teamsToSeoTitle(match)} Odds & Betting Preview — World Cup 2026 | The Drip`;
}

function buildPageDescription(match: MatchSeed): string {
    const date = formatDateShort(match.kickoff);
    const groupPart = match.group ? `Group ${match.group}. ` : '';
    const rich = `${teamsToSeoTitle(match)} World Cup 2026 odds, implied probabilities, and betting edge analysis. ${groupPart}${date} at ${match.venue}. Cross-market pricing gaps.`;

    if (rich.length <= 155) return rich;

    const compact = `${teamsToSeoTitle(match)} World Cup 2026 odds and betting preview with implied probabilities. ${groupPart}${date}. Cross-market pricing gaps.`;
    return clampDescription(compact, 155);
}

function metricLabel(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetricValue(key: string, value: number): string {
    const k = key.toLowerCase();
    if (k.includes('pct') || k.includes('prob') || k.includes('rate')) {
        const pct = value <= 1 ? value * 100 : value;
        return `${pct.toFixed(1)}%`;
    }
    if (k.includes('goal') || k.includes('xg') || k.includes('tempo')) {
        return value.toFixed(2);
    }
    return value.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// SUPABASE DATA
// ═══════════════════════════════════════════════════════════════

async function fetchMatchesRows(supabase: ReturnType<typeof createClient>): Promise<DbRow[]> {
    const timeColumns = ['start_time', 'commence_time', 'kickoff'];

    for (const timeColumn of timeColumns) {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .gte(timeColumn, TOURNAMENT_START)
            .lte(timeColumn, TOURNAMENT_END)
            .order(timeColumn, { ascending: true });

        if (!error) {
            return (data as DbRow[] | null) ?? [];
        }

        const normalized = parseError(error);
        if (isMissingColumnError(normalized)) {
            continue;
        }

        if (isMissingTableError(normalized)) {
            return [];
        }

        console.warn(`[prerender] matches query failed on column ${timeColumn}:`, normalized?.message || error);
        return [];
    }

    return [];
}

async function fetchRowsByMatchIds(
    supabase: ReturnType<typeof createClient>,
    table: 'soccer_player_odds' | 'player_prop_bets',
    matchIds: string[],
): Promise<Map<string, DbRow[]>> {
    const grouped = new Map<string, DbRow[]>();
    if (matchIds.length === 0) return grouped;

    const { data, error } = await supabase
        .from(table)
        .select('*')
        .in('match_id', matchIds);

    if (error) {
        const normalized = parseError(error);
        if (!isMissingTableError(normalized)) {
            console.warn(`[prerender] ${table} query failed:`, normalized?.message || error);
        }
        return grouped;
    }

    for (const row of ((data as DbRow[] | null) ?? [])) {
        const key = asIdKey(row.match_id);
        if (!key) continue;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)?.push(row);
    }

    return grouped;
}

async function fetchLeagueProfiles(
    supabase: ReturnType<typeof createClient>,
    leagues: string[],
): Promise<Map<string, DbRow>> {
    const map = new Map<string, DbRow>();
    if (leagues.length === 0) return map;

    const candidateColumns = ['league', 'league_name', 'competition', 'league_key'];

    for (const column of candidateColumns) {
        const { data, error } = await supabase
            .from('mv_league_structural_profiles')
            .select('*')
            .in(column, leagues);

        if (!error) {
            for (const row of ((data as DbRow[] | null) ?? [])) {
                const leagueName = readFirstString(row, ['league', 'league_name', 'competition', 'league_key']);
                if (!leagueName) continue;
                map.set(normalizeText(leagueName), row);
            }
            return map;
        }

        const normalized = parseError(error);
        if (isMissingColumnError(normalized)) {
            continue;
        }

        if (!isMissingTableError(normalized)) {
            console.warn('[prerender] league profile query failed:', normalized?.message || error);
        }
        return map;
    }

    return map;
}

function parseKeyFactors(raw: unknown): string[] {
    if (Array.isArray(raw)) {
        return raw
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .map((item) => item.trim())
            .slice(0, 8);
    }

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                    .map((item) => item.trim())
                    .slice(0, 8);
            }
        } catch {
            return [];
        }
    }

    return [];
}

async function fetchTranslationsBySlugs(
    supabase: ReturnType<typeof createClient>,
    slugs: string[],
): Promise<Map<string, Map<string, MatchTranslation>>> {
    const map = new Map<string, Map<string, MatchTranslation>>();
    if (slugs.length === 0) return map;

    const supportedCodes = new Set(EDGE_LANGUAGES.map((language) => language.code));

    const { data, error } = await supabase
        .from('match_translations')
        .select('match_slug, language_code, title, meta_description, analysis_headline, analysis_body, key_factors')
        .in('match_slug', slugs);

    if (error) {
        const normalized = parseError(error);
        if (!isMissingTableError(normalized)) {
            console.warn('[prerender] match_translations query failed:', normalized?.message || error);
        }
        return map;
    }

    for (const row of ((data as DbRow[] | null) ?? [])) {
        const slug = readFirstString(row, ['match_slug']);
        const languageCodeRaw = readFirstString(row, ['language_code']);
        const title = readFirstString(row, ['title']);
        const metaDescription = readFirstString(row, ['meta_description']);
        const analysisHeadline = readFirstString(row, ['analysis_headline']);
        const analysisBody = readFirstString(row, ['analysis_body']);

        if (!slug || !languageCodeRaw || !title || !metaDescription || !analysisHeadline || !analysisBody) {
            continue;
        }

        const languageCode = languageCodeRaw.toLowerCase();
        if (!supportedCodes.has(languageCode)) continue;

        const translation: MatchTranslation = {
            languageCode,
            title,
            metaDescription,
            analysisHeadline,
            analysisBody,
            keyFactors: parseKeyFactors(row.key_factors),
        };

        if (!map.has(slug)) {
            map.set(slug, new Map<string, MatchTranslation>());
        }
        map.get(slug)?.set(languageCode, translation);
    }

    return map;
}

function matchRowToSeed(row: DbRow, seed: MatchSeed): { swapped: boolean; diffMs: number } | null {
    const rowHome = readFirstString(row, ['home_team', 'home_team_name', 'home_name']);
    const rowAway = readFirstString(row, ['away_team', 'away_team_name', 'away_name']);
    if (!rowHome || !rowAway) return null;

    const seedHome = normalizeTeam(seed.homeTeam);
    const seedAway = normalizeTeam(seed.awayTeam);
    const homeNorm = normalizeTeam(rowHome);
    const awayNorm = normalizeTeam(rowAway);

    let swapped = false;
    if (homeNorm === seedHome && awayNorm === seedAway) {
        swapped = false;
    } else if (homeNorm === seedAway && awayNorm === seedHome) {
        swapped = true;
    } else {
        return null;
    }

    const rowKickoff = kickoffIsoFromRow(row);
    const seedKickoffMs = new Date(seed.kickoff).getTime();
    const rowKickoffMs = rowKickoff ? new Date(rowKickoff).getTime() : Number.NaN;
    const diffMs = Number.isFinite(rowKickoffMs)
        ? Math.abs(rowKickoffMs - seedKickoffMs)
        : Number.MAX_SAFE_INTEGER;

    return { swapped, diffMs };
}

function findBestDbMatch(seed: MatchSeed, rows: DbRow[]): MatchedDbMatch | null {
    let best: { row: DbRow; swapped: boolean; diffMs: number } | null = null;

    for (const row of rows) {
        const candidate = matchRowToSeed(row, seed);
        if (!candidate) continue;

        if (!best || candidate.diffMs < best.diffMs) {
            best = { row, swapped: candidate.swapped, diffMs: candidate.diffMs };
        }
    }

    if (!best) return null;

    const league = readFirstString(best.row, ['league', 'league_name', 'competition', 'league_key']);
    const kickoff = kickoffIsoFromRow(best.row);
    const venueName = readFirstString(best.row, ['venue_name', 'venue', 'stadium']);
    const venueCity = readFirstString(best.row, ['venue_city', 'city']);
    const venueState = readFirstString(best.row, ['venue_state', 'state']) ||
        VENUE_STATE_BY_MATCH_NUMBER.get(seed.matchNumber) ||
        null;

    return {
        row: best.row,
        swapped: best.swapped,
        rowId: asIdKey(best.row.id ?? best.row.match_id),
        league,
        kickoff,
        venueName,
        venueCity,
        venueState,
        status: readFirstString(best.row, ['status']),
    };
}

async function loadSupabaseData(matches: MatchSeed[]): Promise<SupabaseLoad> {
    const empty: SupabaseLoad = {
        matchesRows: [],
        soccerOddsByMatchId: new Map<string, DbRow[]>(),
        propOddsByMatchId: new Map<string, DbRow[]>(),
        leagueProfiles: new Map<string, DbRow>(),
        translationsBySlug: new Map<string, Map<string, MatchTranslation>>(),
    };

    if (!SUPABASE_KEY || SUPABASE_KEY.length < 20) {
        console.log('[prerender] Supabase key not configured. Rendering model-only fallbacks.');
        return empty;
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const matchesRows = await fetchMatchesRows(supabase);
        console.log(`[prerender] matches rows loaded: ${matchesRows.length}`);

        const matched = matches
            .map((seed) => findBestDbMatch(seed, matchesRows))
            .filter((m): m is MatchedDbMatch => m !== null && !!m.rowId);

        const matchIds = Array.from(new Set(matched.map((m) => m.rowId).filter((id): id is string => !!id)));

        const [soccerOddsByMatchId, propOddsByMatchId] = await Promise.all([
            fetchRowsByMatchIds(supabase, 'soccer_player_odds', matchIds),
            fetchRowsByMatchIds(supabase, 'player_prop_bets', matchIds),
        ]);

        const leagues = Array.from(
            new Set(
                matched
                    .map((m) => m.league)
                    .filter((league): league is string => typeof league === 'string' && league.trim().length > 0),
            ),
        );

        const leagueProfiles = await fetchLeagueProfiles(supabase, leagues);
        const translationsBySlug = await fetchTranslationsBySlugs(
            supabase,
            matches.map((seed) => seed.slug),
        );

        console.log(`[prerender] soccer_player_odds matched ids: ${soccerOddsByMatchId.size}`);
        console.log(`[prerender] player_prop_bets matched ids: ${propOddsByMatchId.size}`);
        console.log(`[prerender] structural profiles loaded: ${leagueProfiles.size}`);
        console.log(`[prerender] translated edge slugs loaded: ${translationsBySlug.size}`);

        return {
            matchesRows,
            soccerOddsByMatchId,
            propOddsByMatchId,
            leagueProfiles,
            translationsBySlug,
        };
    } catch (error) {
        console.warn('[prerender] Supabase load failed. Rendering model-only fallbacks.', error);
        return empty;
    }
}

// ═══════════════════════════════════════════════════════════════
// ODDS MODELING
// ═══════════════════════════════════════════════════════════════

function parseDecimalFromOddsValue(raw: unknown): number | null {
    const numeric = toNumber(raw);
    if (numeric == null || !Number.isFinite(numeric)) return null;

    if (numeric > 1 && numeric < 30) {
        return numeric;
    }

    if (Math.abs(numeric) >= 100) {
        return americanToDecimal(numeric);
    }

    if (numeric > 0 && numeric < 1) {
        return 1 / numeric;
    }

    if (numeric >= 1 && numeric <= 100) {
        return 1 / (numeric / 100);
    }

    return null;
}

function inferOutcomeFromRow(row: DbRow, seed: MatchSeed): Outcome | null {
    const explicitOutcome = normalizeText(
        readFirstString(row, ['outcome', 'selection', 'result', 'side']) || '',
    );

    if (explicitOutcome) {
        if (['draw', 'tie', 'x'].includes(explicitOutcome)) return 'draw';
        if (['home', 'home win', 'team1', '1'].includes(explicitOutcome)) return 'home';
        if (['away', 'away win', 'team2', '2'].includes(explicitOutcome)) return 'away';
    }

    const marketType = normalizeText(
        `${readFirstString(row, ['market_type', 'market', 'bet_type']) || ''} ${
            readFirstString(row, ['player_name', 'selection_name', 'runner_name']) || ''
        }`,
    );

    if (!marketType) return null;

    if (/\b(draw|tie)\b/.test(marketType)) return 'draw';

    const awayAliases = [normalizeTeam(seed.awayTeam), normalizeText(seed.awayCode)];
    const homeAliases = [normalizeTeam(seed.homeTeam), normalizeText(seed.homeCode)];

    const hasAway = awayAliases.some((alias) => alias.length > 0 && marketType.includes(alias));
    const hasHome = homeAliases.some((alias) => alias.length > 0 && marketType.includes(alias));

    if (hasAway && !hasHome) return 'away';
    if (hasHome && !hasAway) return 'home';

    if (/\bhome\b/.test(marketType)) return 'home';
    if (/\baway\b/.test(marketType)) return 'away';

    if (/\bteam 1\b|\bteam1\b/.test(marketType)) return 'home';
    if (/\bteam 2\b|\bteam2\b/.test(marketType)) return 'away';

    return null;
}

function extractDecimalFromRow(row: DbRow): number | null {
    const directDecimal = parseDecimalFromOddsValue(
        row.decimal_odds ?? row.odds_decimal ?? row.decimal,
    );
    if (directDecimal && directDecimal > 1) return directDecimal;

    const fromPrice = parseDecimalFromOddsValue(row.price);
    if (fromPrice && fromPrice > 1) return fromPrice;

    const fromLine = parseDecimalFromOddsValue(row.line);
    if (fromLine && fromLine > 1) return fromLine;

    const fromOdds = parseDecimalFromOddsValue(row.odds);
    if (fromOdds && fromOdds > 1) return fromOdds;

    return null;
}

function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function buildModelProbabilities(match: MatchSeed, matchedDb: MatchedDbMatch | null): ModelProbabilities {
    if (!matchedDb) {
        return { away: null, draw: null, home: null };
    }

    const row = matchedDb.row;

    const homeProb = normalizeProbability(
        row.prob_home ?? row.home_prob ?? row.home_probability,
    );
    const drawProb = normalizeProbability(
        row.prob_draw ?? row.draw_prob ?? row.draw_probability,
    );
    const awayProb = normalizeProbability(
        row.prob_away ?? row.away_prob ?? row.away_probability,
    );

    if (!matchedDb.swapped) {
        return {
            away: awayProb,
            draw: drawProb,
            home: homeProb,
        };
    }

    return {
        away: homeProb,
        draw: drawProb,
        home: awayProb,
    };
}

function buildBookmakerCards(
    match: MatchSeed,
    matchedDb: MatchedDbMatch | null,
    soccerRowsByMatchId: Map<string, DbRow[]>,
    propRowsByMatchId: Map<string, DbRow[]>,
): { cards: BookmakerCard[]; tracked: string[] } {
    if (!matchedDb?.rowId) {
        return { cards: [], tracked: [] };
    }

    const rows = [
        ...(soccerRowsByMatchId.get(matchedDb.rowId) ?? []),
        ...(propRowsByMatchId.get(matchedDb.rowId) ?? []),
    ];

    if (rows.length === 0) {
        return { cards: [], tracked: [] };
    }

    const trackedSet = new Set<string>();
    const byBookmaker = new Map<string, DbRow[]>();

    for (const row of rows) {
        const bookmaker = readFirstString(row, ['bookmaker', 'book', 'source']) || 'Unknown';
        trackedSet.add(bookmaker);
        if (!byBookmaker.has(bookmaker)) byBookmaker.set(bookmaker, []);
        byBookmaker.get(bookmaker)?.push(row);
    }

    const cards: BookmakerCard[] = [];

    for (const [bookmaker, bookRows] of byBookmaker.entries()) {
        const outcomes: Record<Outcome, number[]> = {
            away: [],
            draw: [],
            home: [],
        };

        for (const row of bookRows) {
            const outcome = inferOutcomeFromRow(row, match);
            if (!outcome) continue;

            const decimal = extractDecimalFromRow(row);
            if (!decimal || decimal <= 1) continue;

            outcomes[outcome].push(decimal);
        }

        const awayDecimal = average(outcomes.away);
        const drawDecimal = average(outcomes.draw);
        const homeDecimal = average(outcomes.home);

        // Require true 3-way lines for sportsbook cards.
        if (!awayDecimal || !drawDecimal || !homeDecimal) {
            continue;
        }

        const awayImp = decimalToImplied(awayDecimal);
        const drawImp = decimalToImplied(drawDecimal);
        const homeImp = decimalToImplied(homeDecimal);

        cards.push({
            bookmaker,
            odds: {
                away: toAmericanOdds(awayDecimal),
                draw: toAmericanOdds(drawDecimal),
                home: toAmericanOdds(homeDecimal),
            },
            implied: {
                away: `${((awayImp ?? 0) * 100).toFixed(1)}% imp`,
                draw: `${((drawImp ?? 0) * 100).toFixed(1)}% imp`,
                home: `${((homeImp ?? 0) * 100).toFixed(1)}% imp`,
            },
            decimal: {
                away: awayDecimal,
                draw: drawDecimal,
                home: homeDecimal,
            },
            sourceCount: bookRows.length,
        });
    }

    cards.sort((a, b) => a.bookmaker.localeCompare(b.bookmaker));

    return {
        cards,
        tracked: Array.from(trackedSet).sort((a, b) => a.localeCompare(b)),
    };
}

function buildConsensusProbabilities(cards: BookmakerCard[]): Record<Outcome, number | null> {
    if (cards.length === 0) {
        return { away: null, draw: null, home: null };
    }

    const outcomes: Record<Outcome, number[]> = {
        away: [],
        draw: [],
        home: [],
    };

    for (const card of cards) {
        for (const outcome of ['away', 'draw', 'home'] as Outcome[]) {
            const implied = decimalToImplied(card.decimal[outcome]);
            if (implied != null) outcomes[outcome].push(implied);
        }
    }

    return {
        away: average(outcomes.away),
        draw: average(outcomes.draw),
        home: average(outcomes.home),
    };
}

function computeEdgeSignal(
    match: MatchSeed,
    modelProb: ModelProbabilities,
    bookCards: BookmakerCard[],
): EdgeSignal | null {
    if (bookCards.length === 0) return null;

    const consensus = buildConsensusProbabilities(bookCards);
    let best: EdgeSignal | null = null;

    for (const outcome of ['away', 'draw', 'home'] as Outcome[]) {
        const model = modelProb[outcome];
        const market = consensus[outcome];
        if (model == null || market == null) continue;

        const gap = Math.abs(model - market);
        if (gap <= 0.04) continue;

        const teamLabel = outcome === 'away'
            ? match.awayTeam
            : outcome === 'home'
                ? match.homeTeam
                : 'Draw';

        const edgeLabel = outcome === 'draw' ? 'EDGE: DRAW' : `EDGE: ${teamLabel.toUpperCase()} ML`;
        const direction = model > market ? 'higher' : 'lower';
        const summary = `Model prices ${teamLabel} ${(gap * 100).toFixed(1)}% ${direction} than current market consensus.`;

        const signal: EdgeSignal = {
            outcome,
            teamLabel,
            gap,
            modelProb: model,
            marketProb: market,
            edgeLabel,
            summary,
        };

        if (!best || signal.gap > best.gap) {
            best = signal;
        }
    }

    return best;
}

function buildStructuralLines(
    match: MatchSeed,
    matchedDb: MatchedDbMatch | null,
    trackedBookmakers: string[],
    hasBookmakerLines: boolean,
    profile: DbRow | null,
): string[] {
    const lines: string[] = [];

    if (matchedDb?.league) {
        lines.push(`Competition: ${matchedDb.league}`);
    } else if (match.group) {
        lines.push(`Competition: World Cup 2026 Group ${match.group}`);
    }

    if (matchedDb?.status) {
        lines.push(`Match status: ${matchedDb.status}`);
    }

    if (trackedBookmakers.length > 0) {
        lines.push(`Bookmakers tracked for this match: ${trackedBookmakers.join(', ')}`);
    }

    if (!hasBookmakerLines) {
        lines.push('Markets open closer to kickoff for complete 3-way match-result pricing');
    }

    if (profile) {
        const candidateKeys = [
            'market_efficiency',
            'draw_rate',
            'upset_rate',
            'goals_per_match',
            'home_advantage',
            'tempo_index',
            'volatility_index',
            'xg_mean',
        ];

        for (const key of candidateKeys) {
            const value = toNumber(profile[key]);
            if (value == null) continue;
            lines.push(`${metricLabel(key)}: ${formatMetricValue(key, value)}`);
            if (lines.length >= 7) break;
        }

        if (lines.length < 5) {
            const genericNumeric = Object.entries(profile)
                .filter(([key, value]) =>
                    typeof value === 'number' &&
                    Number.isFinite(value) &&
                    !candidateKeys.includes(key),
                )
                .slice(0, 3);

            for (const [key, value] of genericNumeric) {
                lines.push(`${metricLabel(key)}: ${formatMetricValue(key, value)}`);
            }
        }
    }

    return lines.slice(0, 8);
}

function buildKeyNumberLines(
    match: MatchSeed,
    modelProb: ModelProbabilities,
    bookCards: BookmakerCard[],
): string[] {
    const lines: string[] = [];

    lines.push(`${match.homeTeam} implied: ${formatPercent(modelProb.home)}`);
    lines.push(`${match.awayTeam} implied: ${formatPercent(modelProb.away)}`);
    lines.push(`Draw implied: ${formatPercent(modelProb.draw)}`);

    if (bookCards.length > 0) {
        const consensus = buildConsensusProbabilities(bookCards);
        const probs = [consensus.away, consensus.draw, consensus.home].filter((p): p is number => p != null);
        if (probs.length === 3) {
            const vig = probs.reduce((sum, p) => sum + p, 0) - 1;
            lines.push(`Combined vig: ${(vig * 100).toFixed(1)}%`);
        }
        lines.push(`Bookmaker cards rendered: ${bookCards.length}`);
    } else {
        lines.push('Bookmaker cards rendered: 0 (model implied pre-market)');
    }

    return lines;
}

function buildLeadParagraph(
    match: MatchSeed,
    modelProb: ModelProbabilities,
    edgeSignal: EdgeSignal | null,
    hasBookmakerLines: boolean,
): string {
    const awayPct = formatPercent(modelProb.away);
    const drawPct = formatPercent(modelProb.draw);
    const homePct = formatPercent(modelProb.home);

    const base = `${match.awayTeam} vs ${match.homeTeam} World Cup 2026 odds currently imply ${awayPct} for ${match.awayTeam}, ${drawPct} for draw, and ${homePct} for ${match.homeTeam}.`;

    if (edgeSignal) {
        return `${base} The largest model-market divergence is ${(
            edgeSignal.gap * 100
        ).toFixed(1)}% on ${edgeSignal.teamLabel}.`;
    }

    if (!hasBookmakerLines) {
        return `${base} Live sportsbook 3-way markets have not fully opened yet, so this page is using model-implied pricing as the baseline.`;
    }

    return `${base} Current bookmaker coverage is active, but no outcome is above the 4% edge threshold right now.`;
}

function modelToOdds(prob: number | null): string {
    if (prob == null) return 'N/A';
    return probToAmericanOdds(prob);
}

function buildRenderModel(
    match: MatchSeed,
    supabaseData: SupabaseLoad,
): RenderModel {
    const matchedDb = findBestDbMatch(match, supabaseData.matchesRows);
    const modelProb = buildModelProbabilities(match, matchedDb);

    const { cards: bookmakerCards, tracked: trackedBookmakers } = buildBookmakerCards(
        match,
        matchedDb,
        supabaseData.soccerOddsByMatchId,
        supabaseData.propOddsByMatchId,
    );

    const hasBookmakerLines = bookmakerCards.length > 0;
    const edgeSignal = computeEdgeSignal(match, modelProb, bookmakerCards);

    const leagueProfile = matchedDb?.league
        ? (supabaseData.leagueProfiles.get(normalizeText(matchedDb.league)) ?? null)
        : null;

    const structuralLines = buildStructuralLines(
        match,
        matchedDb,
        trackedBookmakers,
        hasBookmakerLines,
        leagueProfile,
    );

    const keyNumberLines = buildKeyNumberLines(match, modelProb, bookmakerCards);
    const leadParagraph = buildLeadParagraph(match, modelProb, edgeSignal, hasBookmakerLines);
    const translationsForSlug = supabaseData.translationsBySlug.get(match.slug);
    const translations: Record<string, MatchTranslation> = {};

    for (const language of EDGE_LANGUAGES) {
        const translation = translationsForSlug?.get(language.code);
        if (translation) {
            translations[language.code] = translation;
        }
    }

    const availableLanguages = EDGE_LANGUAGES
        .map((language) => language.code)
        .filter((languageCode) => !!translations[languageCode]);

    return {
        match,
        matchedDb,
        modelProb,
        modelOdds: {
            away: modelToOdds(modelProb.away),
            draw: modelToOdds(modelProb.draw),
            home: modelToOdds(modelProb.home),
        },
        modelImplied: {
            away: `${formatPercent(modelProb.away)} imp`,
            draw: `${formatPercent(modelProb.draw)} imp`,
            home: `${formatPercent(modelProb.home)} imp`,
        },
        bookmakerCards,
        trackedBookmakers,
        hasBookmakerLines,
        edgeSignal,
        leagueProfile,
        leadParagraph,
        structuralLines,
        keyNumberLines,
        pageTitle: buildPageTitle(match),
        pageDescription: buildPageDescription(match),
        translations,
        availableLanguages,
    };
}

// ═══════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════

const INLINE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{background:#000;scroll-behavior:smooth}
body{background:#000;color:#f4f4f5;font-family:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.45;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{text-decoration:none;color:inherit}

:root{
--bg:#000000;
--surface:#09090b;
--border:#27272a;
--border-hover:#3f3f46;
--text:#f4f4f5;
--text-2:#a1a1aa;
--text-3:#71717a;
--ghost:#52525b;
--green:#22c55e;
--red:#ef4444;
}

.page{min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(1200px 500px at 20% -20%,rgba(34,197,94,0.05),transparent 70%),var(--bg)}
.wrap{max-width:1100px;margin:0 auto;padding:0 24px}

.nav{position:sticky;top:0;z-index:40;background:rgba(0,0,0,0.9);backdrop-filter:saturate(150%) blur(6px);border-bottom:1px solid var(--border)}
.nav-inner{height:60px;display:flex;align-items:center;justify-content:space-between}
.wordmark{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.02em}
.nav-links{display:flex;align-items:center;gap:16px}
.nav-link{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--text-3)}
.nav-link:hover{color:var(--text)}
.live{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--green)}
.live-dot{width:6px;height:6px;border-radius:999px;background:var(--green);box-shadow:0 0 12px rgba(34,197,94,0.8)}

.edge-main{padding:32px 0 80px;flex:1}
.utility-row{display:flex;justify-content:flex-end;margin-bottom:12px}
.language-switcher{display:flex;align-items:center;gap:8px;border:1px solid var(--border);background:var(--surface);border-radius:10px;padding:7px 9px}
.language-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-3)}
.language-select{appearance:none;background:#09090b;color:var(--text);border:1px solid var(--border);border-radius:8px;padding:6px 26px 6px 10px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;max-width:180px}
.language-select:focus{outline:1px solid var(--green);outline-offset:1px}

.edge-header{width:100%;background:var(--surface);border:1px solid var(--border);border-bottom:1px solid var(--border);padding:48px 32px;border-radius:18px;margin-bottom:24px}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:20px}
.headline-row{display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap}
.team{font-family:'Space Grotesk',sans-serif;font-size:clamp(40px,7vw,72px);font-weight:900;line-height:0.95;letter-spacing:-0.05em;color:var(--text)}
.v-mark{font-size:clamp(24px,4vw,32px);font-weight:300;color:var(--ghost);line-height:1}
.kickoff{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.02em;color:var(--text-3);margin-top:16px}
.venue{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--ghost);margin-top:6px}
.chip{display:inline-flex;align-items:center;gap:8px;padding:6px 11px;border-radius:999px;margin-top:20px;background:rgba(9,9,11,0.5);color:var(--green);border:1px solid rgba(34,197,94,0.30);font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase}

.section{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:24px;margin-bottom:16px}
.section-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:16px}
.rule{height:1px;background:var(--border);margin-bottom:18px}

.odds-grid{display:grid;gap:12px}
.odds-card{border:1px solid var(--border);background:#0b0b0e;border-radius:14px;padding:16px;transition:border-color .2s ease}
.odds-card:hover{border-color:var(--border-hover)}
.bookmaker{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text)}
.columns{margin-top:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.col-head{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-3)}
.odd{font-family:'IBM Plex Mono',monospace;font-size:28px;font-weight:700;letter-spacing:-0.02em;color:var(--text)}
.imp{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--text-3)}
.sub-note{margin-top:12px;font-size:12px;color:var(--text-3);font-style:italic}

.edge-banner{border:1px solid rgba(34,197,94,0.35);background:rgba(34,197,94,0.06);border-radius:14px;padding:14px 16px}
.edge-banner h3{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--green)}
.edge-banner p{margin-top:8px;font-size:14px;color:var(--text-2)}
.edge-tag{margin-top:8px;display:inline-flex;border:1px solid rgba(34,197,94,0.3);border-radius:999px;padding:4px 10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--green)}

.intel-lead{font-size:15px;color:var(--text-2);line-height:1.7;margin-bottom:20px}
.intel-headline{font-size:17px;font-weight:700;color:var(--text);line-height:1.5;margin-bottom:14px}
.intel-body{display:grid;gap:10px;margin-bottom:18px}
.intel-body p{font-size:15px;color:var(--text-2);line-height:1.75}
.subsection-label{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px}
.intel-list{list-style:none;display:grid;gap:8px;margin-bottom:18px}
.intel-list li{font-size:14px;color:var(--text-2);line-height:1.6;border-left:2px solid var(--border);padding-left:10px}
.translated-analysis{display:none}
.translated-analysis[aria-hidden="false"]{display:block}

.rtl .intel-list li{border-left:none;border-right:2px solid var(--border);padding-left:0;padding-right:10px}
.rtl .intel-body p,.rtl .intel-headline{text-align:right}

.related-list{display:grid;gap:10px}
.related-card{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--border);background:#09090b;border-radius:12px;padding:14px 16px;transition:border-color .2s ease}
.related-card:hover{border-color:var(--border-hover)}
.related-card.current{border-left:2px solid var(--green)}
.related-teams{font-size:15px;font-weight:700;color:var(--text)}
.related-v{color:var(--ghost);font-weight:300;margin:0 8px}
.related-date{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text-3)}

.footer{border-top:1px solid var(--border);padding:20px 0 32px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--text-3)}

@media (max-width: 780px){
  .nav-links{gap:10px}
  .nav-link{display:none}
  .utility-row{justify-content:stretch}
  .language-switcher{width:100%;justify-content:space-between}
  .language-select{max-width:none;width:100%}
  .edge-header{padding:32px 18px}
  .section{padding:18px}
  .columns{grid-template-columns:1fr}
  .odd{font-size:24px}
  .related-card{flex-direction:column;align-items:flex-start}
}
`.trim();

function renderNav(groupLetter?: string): string {
    const currentDate = new Date()
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        .toUpperCase();

    return `
<nav class="nav">
  <div class="wrap nav-inner">
    <a href="/" class="wordmark">THE DRIP</a>
    <div class="nav-links">
      <a class="nav-link" href="/">Hub</a>
      <a class="nav-link" href="/today">Today</a>
      ${groupLetter ? `<a class="nav-link" href="/group/${groupLetter.toLowerCase()}">Group ${groupLetter}</a>` : ''}
      <span class="live"><span class="live-dot"></span>Live ${currentDate}</span>
    </div>
  </div>
</nav>`;
}

function renderLanguageSwitcher(model: RenderModel): string {
    const availableCodes = ['en', ...model.availableLanguages];
    const options = availableCodes
        .map((code) => {
            const label = LANGUAGE_LABELS[code] ?? code.toUpperCase();
            return `<option value="${escapeHtml(code)}">${escapeHtml(label)}</option>`;
        })
        .join('');

    return `
<div class="utility-row">
  <div class="language-switcher">
    <label class="language-label" for="language-switcher">Language</label>
    <select id="language-switcher" class="language-select" aria-label="Language selector">
      ${options}
    </select>
  </div>
</div>`;
}

function renderHreflangLinks(matchSlug: string): string {
    const base = `${SITE_URL}/edges/${matchSlug}/`;
    const tags = [
        `<link rel="alternate" hreflang="en" href="${base}?lang=en" />`,
        ...EDGE_LANGUAGES.map((language) =>
            `<link rel="alternate" hreflang="${language.hreflang}" href="${base}?lang=${language.code}" />`),
        `<link rel="alternate" hreflang="x-default" href="${base}" />`,
    ];
    return tags.join('\n  ');
}

function renderTranslationPayload(model: RenderModel): string {
    const english: MatchTranslation = {
        languageCode: 'en',
        title: model.pageTitle,
        metaDescription: model.pageDescription,
        analysisHeadline: model.leadParagraph,
        analysisBody: model.leadParagraph,
        keyFactors: model.structuralLines.slice(0, 6),
    };

    const payload = {
        availableLanguages: ['en', ...model.availableLanguages],
        rtlLanguages: ['ar'],
        translations: {
            en: english,
            ...model.translations,
        },
    };

    return `<script id="drip-i18n-payload" type="application/json">${escapeJsonForScript(payload)}</script>`;
}

function renderTranslationRuntimeScript(): string {
    return `<script>
(function () {
  var payloadTag = document.getElementById('drip-i18n-payload');
  if (!payloadTag) return;

  var payload;
  try {
    payload = JSON.parse(payloadTag.textContent || '{}');
  } catch (_error) {
    return;
  }

  var available = Array.isArray(payload.availableLanguages) ? payload.availableLanguages : ['en'];
  var availableSet = new Set(available);
  var params = new URLSearchParams(window.location.search);
  var urlLang = (params.get('lang') || '').toLowerCase();

  var storedLang = '';
  try {
    storedLang = (window.localStorage.getItem('drip-language') || '').toLowerCase();
  } catch (_error) {
    storedLang = '';
  }

  var browserLang = ((window.navigator.language || 'en').slice(0, 2) || 'en').toLowerCase();
  var candidates = [urlLang, storedLang, browserLang, 'en'];
  var selected = 'en';

  for (var i = 0; i < candidates.length; i += 1) {
    var candidate = candidates[i];
    if (candidate && availableSet.has(candidate)) {
      selected = candidate;
      break;
    }
  }

  if (!availableSet.has(selected)) {
    selected = 'en';
  }

  var translations = payload.translations || {};
  var translation = translations[selected] || translations.en;
  if (!translation) return;

  try {
    window.localStorage.setItem('drip-language', selected);
  } catch (_error) {
    // ignore storage errors
  }

  var isRtl = Array.isArray(payload.rtlLanguages) && payload.rtlLanguages.indexOf(selected) !== -1;
  document.documentElement.lang = selected;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

  var pageRoot = document.getElementById('edge-page-root');
  if (pageRoot) {
    pageRoot.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    pageRoot.classList.toggle('rtl', isRtl);
  }

  if (typeof translation.title === 'string' && translation.title.trim()) {
    document.title = translation.title.trim();
  }

  function setMeta(selector, value) {
    if (typeof value !== 'string' || !value.trim()) return;
    var node = document.querySelector(selector);
    if (node) node.setAttribute('content', value.trim());
  }

  setMeta('meta[name=\"description\"]', translation.metaDescription);
  setMeta('meta[property=\"og:title\"]', translation.title);
  setMeta('meta[property=\"og:description\"]', translation.metaDescription);
  setMeta('meta[name=\"twitter:title\"]', translation.title);
  setMeta('meta[name=\"twitter:description\"]', translation.metaDescription);

  var englishBlock = document.getElementById('english-analysis');
  var translatedBlock = document.getElementById('translated-analysis');
  var useTranslation = selected !== 'en' && !!translations[selected];

  if (englishBlock) {
    englishBlock.style.display = useTranslation ? 'none' : 'block';
  }

  if (translatedBlock) {
    translatedBlock.setAttribute('aria-hidden', useTranslation ? 'false' : 'true');
    translatedBlock.style.display = useTranslation ? 'block' : 'none';
  }

  if (useTranslation) {
    var headlineNode = document.getElementById('translated-headline');
    if (headlineNode) {
      headlineNode.textContent = translation.analysisHeadline || '';
    }

    var bodyNode = document.getElementById('translated-body');
    if (bodyNode) {
      var bodyText = typeof translation.analysisBody === 'string' ? translation.analysisBody : '';
      var paragraphs = bodyText
        .split(/\\n{2,}/)
        .map(function (part) { return part.trim(); })
        .filter(Boolean);
      if (paragraphs.length === 0 && bodyText.trim()) paragraphs = [bodyText.trim()];
      bodyNode.innerHTML = paragraphs
        .map(function (paragraph) {
          return '<p>' +
            paragraph
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\"/g, '&quot;')
              .replace(/'/g, '&#39;') +
            '</p>';
        })
        .join('');
    }

    var factorsNode = document.getElementById('translated-factors');
    if (factorsNode) {
      var factors = Array.isArray(translation.keyFactors) ? translation.keyFactors : [];
      factorsNode.innerHTML = factors
        .filter(function (factor) { return typeof factor === 'string' && factor.trim().length > 0; })
        .map(function (factor) {
          return '<li>' +
            factor
              .trim()
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\"/g, '&quot;')
              .replace(/'/g, '&#39;') +
            '</li>';
        })
        .join('');
    }
  }

  var selector = document.getElementById('language-switcher');
  if (selector && selector instanceof HTMLSelectElement) {
    selector.value = selected;
    selector.addEventListener('change', function () {
      var next = (selector.value || 'en').toLowerCase();
      try {
        window.localStorage.setItem('drip-language', next);
      } catch (_error) {
        // ignore storage errors
      }
      var nextUrl = new URL(window.location.href);
      if (next === 'en') {
        nextUrl.searchParams.delete('lang');
      } else {
        nextUrl.searchParams.set('lang', next);
      }
      window.location.href = nextUrl.toString();
    });
  }
})();
</script>`;
}

function renderHeader(model: RenderModel): string {
    const match = model.match;
    const kickoff = model.matchedDb?.kickoff ?? match.kickoff;
    const venueName = model.matchedDb?.venueName ?? match.venue;
    const venueCity = model.matchedDb?.venueCity ?? match.venueCity;
    const venueState = model.matchedDb?.venueState;
    const venueLine = venueState ? `${venueName}, ${venueCity}, ${venueState}` : `${venueName}, ${venueCity}`;

    const eyebrow = match.group
        ? `GROUP ${match.group} · MATCH ${match.matchNumber}`
        : `${phaseLabel(match.phase).toUpperCase()} · MATCH ${match.matchNumber}`;

    return `
<header class="edge-header">
  <div class="eyebrow">${escapeHtml(eyebrow)}</div>
  <div class="headline-row">
    <h1 class="team">${escapeHtml(match.awayTeam)}</h1>
    <span class="v-mark">v</span>
    <h1 class="team">${escapeHtml(match.homeTeam)}</h1>
  </div>
  <p class="kickoff">${escapeHtml(formatHeaderDateTimeUtc(kickoff))}</p>
  <p class="venue">${escapeHtml(venueLine)}</p>
  <div class="chip">${escapeHtml(countdownLabel(kickoff))}</div>
</header>`;
}

function renderBookmakerCard(match: MatchSeed, card: BookmakerCard): string {
    return `
<div class="odds-card">
  <div class="bookmaker">${escapeHtml(card.bookmaker.toUpperCase())}</div>
  <div class="columns">
    <div>
      <div class="col-head">${escapeHtml(match.awayTeam)}</div>
      <div class="odd">${escapeHtml(card.odds.away)}</div>
      <div class="imp">${escapeHtml(card.implied.away)}</div>
    </div>
    <div>
      <div class="col-head">Draw</div>
      <div class="odd">${escapeHtml(card.odds.draw)}</div>
      <div class="imp">${escapeHtml(card.implied.draw)}</div>
    </div>
    <div>
      <div class="col-head">${escapeHtml(match.homeTeam)}</div>
      <div class="odd">${escapeHtml(card.odds.home)}</div>
      <div class="imp">${escapeHtml(card.implied.home)}</div>
    </div>
  </div>
</div>`;
}

function renderModelCard(model: RenderModel): string {
    const match = model.match;
    const preMarketLabel = model.hasBookmakerLines
        ? 'MODEL IMPLIED · BASELINE'
        : 'MODEL IMPLIED · PRE-MARKET';

    return `
<div class="odds-card">
  <div class="bookmaker">${preMarketLabel}</div>
  <div class="columns">
    <div>
      <div class="col-head">${escapeHtml(match.awayTeam)}</div>
      <div class="odd">${escapeHtml(model.modelOdds.away)}</div>
      <div class="imp">${escapeHtml(model.modelImplied.away)}</div>
    </div>
    <div>
      <div class="col-head">Draw</div>
      <div class="odd">${escapeHtml(model.modelOdds.draw)}</div>
      <div class="imp">${escapeHtml(model.modelImplied.draw)}</div>
    </div>
    <div>
      <div class="col-head">${escapeHtml(match.homeTeam)}</div>
      <div class="odd">${escapeHtml(model.modelOdds.home)}</div>
      <div class="imp">${escapeHtml(model.modelImplied.home)}</div>
    </div>
  </div>
  ${!model.hasBookmakerLines ? '<p class="sub-note">Markets open closer to kickoff.</p>' : ''}
</div>`;
}

function renderOddsSection(model: RenderModel): string {
    const cardsHtml = model.bookmakerCards.length > 0
        ? model.bookmakerCards.map((card) => renderBookmakerCard(model.match, card)).join('\n')
        : '';

    const edgeBanner = model.edgeSignal
        ? `
<div class="edge-banner">
  <h3>◆ Edge Detected</h3>
  <p>${escapeHtml(model.edgeSignal.summary)}</p>
  <span class="edge-tag">${escapeHtml(model.edgeSignal.edgeLabel)}</span>
</div>`
        : '';

    return `
<section class="section">
  <div class="section-label">Odds Comparison</div>
  <div class="rule"></div>
  <div class="odds-grid">
    ${cardsHtml}
    ${renderModelCard(model)}
    ${edgeBanner}
  </div>
</section>`;
}

function renderAnalysisSection(model: RenderModel): string {
    const structuralHtml = model.structuralLines
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join('');

    const keyNumbersHtml = model.keyNumberLines
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join('');

    return `
<section class="section">
  <div class="section-label">Match Intelligence</div>
  <div class="rule"></div>
  <div id="english-analysis">
    <p class="intel-lead">${escapeHtml(model.leadParagraph)}</p>

    ${model.structuralLines.length > 0 ? `
    <div class="subsection-label">Structural Context</div>
    <ul class="intel-list">${structuralHtml}</ul>
    ` : ''}

    <div class="subsection-label">Key Numbers</div>
    <ul class="intel-list">${keyNumbersHtml}</ul>
  </div>

  <div id="translated-analysis" class="translated-analysis" aria-hidden="true">
    <p class="intel-headline" id="translated-headline"></p>
    <div class="intel-body" id="translated-body"></div>
    <div class="subsection-label">Key Factors</div>
    <ul class="intel-list" id="translated-factors"></ul>
  </div>
</section>`;
}

function renderGroupMatches(model: RenderModel): string {
    const { match } = model;
    if (!match.group) return '';

    const groupMatches = ALL_MATCHES
        .filter((m) => m.group === match.group)
        .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

    if (groupMatches.length === 0) return '';

    const cards = groupMatches
        .map((m) => {
            const current = m.slug === match.slug;
            const cardClass = current ? 'related-card current' : 'related-card';
            const body = `
  <span class="related-teams">${escapeHtml(m.homeTeam)}<span class="related-v">v</span>${escapeHtml(m.awayTeam)}</span>
  <span class="related-date">${escapeHtml(formatDateShort(m.kickoff))}</span>`;

            if (current) {
                return `<div class="${cardClass}">${body}</div>`;
            }

            return `<a href="/edges/${m.slug}/" class="${cardClass}">${body}</a>`;
        })
        .join('');

    return `
<section class="section">
  <div class="section-label">Group ${match.group} Matches</div>
  <div class="rule"></div>
  <div class="related-list">${cards}</div>
</section>`;
}

function renderFooter(): string {
    return `<footer class="footer">© 2026 The Drip · Not financial advice</footer>`;
}

function renderJsonLd(model: RenderModel): string {
    const { match, matchedDb } = model;

    const venueName = matchedDb?.venueName ?? match.venue;
    const venueCity = matchedDb?.venueCity ?? match.venueCity;
    const venueState = matchedDb?.venueState;
    const kickoff = matchedDb?.kickoff ?? match.kickoff;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${match.awayTeam} vs ${match.homeTeam}`,
        startDate: kickoff,
        location: {
            '@type': 'Place',
            name: venueName,
            address: {
                '@type': 'PostalAddress',
                addressLocality: venueCity,
                ...(venueState ? { addressRegion: venueState } : {}),
            },
        },
        organizer: {
            '@type': 'Organization',
            name: 'FIFA',
        },
        description: match.group
            ? `World Cup 2026 Group ${match.group} Match ${match.matchNumber}`
            : `World Cup 2026 ${phaseLabel(match.phase)} Match ${match.matchNumber}`,
    };

    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function renderMatchPage(model: RenderModel): string {
    const canonical = `${SITE_URL}/edges/${model.match.slug}/`;
    const hreflangLinks = renderHreflangLinks(model.match.slug);
    const translationPayload = renderTranslationPayload(model);
    const translationRuntime = renderTranslationRuntimeScript();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="theme-color" content="#000000" />

  <title>${escapeHtml(model.pageTitle)}</title>
  <meta name="description" content="${escapeHtml(model.pageDescription)}" />
  <link rel="canonical" href="${canonical}" />
  ${hreflangLinks}

  <meta property="og:title" content="${escapeHtml(model.pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(model.pageDescription)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="The Drip" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(model.pageTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(model.pageDescription)}" />

  ${renderJsonLd(model)}

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;700;800;900&display=swap" rel="stylesheet" />
  ${translationPayload}

  <style>${INLINE_CSS}</style>
</head>
<body>
  <div class="page" id="edge-page-root" dir="ltr">
    ${renderNav(model.match.group)}

    <main class="edge-main">
      <div class="wrap">
        ${renderLanguageSwitcher(model)}
        ${renderHeader(model)}
        ${renderOddsSection(model)}
        ${renderAnalysisSection(model)}
        ${renderGroupMatches(model)}
      </div>
    </main>

    ${renderFooter()}
  </div>
  ${translationRuntime}
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// SITEMAP
// ═══════════════════════════════════════════════════════════════

function generateSitemap(matches: MatchSeed[]): string {
    const groupUrls = Object.keys(allGroups)
        .sort()
        .map((letter) => ({
            loc: `${SITE_URL}/group/${letter.toLowerCase()}`,
            priority: '0.8',
            changefreq: 'daily',
        }));

    const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${SITE_URL}/today`, priority: '0.95', changefreq: 'daily' },
        ...groupUrls,
        ...matches.map((m) => ({
            loc: `${SITE_URL}/edges/${m.slug}/`,
            priority: m.phase === 'group' ? '0.9' : '0.8',
            changefreq: 'daily',
        })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${BUILD_TIME}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')}
</urlset>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
    console.log(`Pre-rendering ${ALL_MATCHES.length} match pages...`);

    const supabaseData = await loadSupabaseData(ALL_MATCHES);

    let generated = 0;
    let cardsWithBookLines = 0;
    let cardsModelOnly = 0;

    for (const match of ALL_MATCHES) {
        const model = buildRenderModel(match, supabaseData);

        if (model.hasBookmakerLines) {
            cardsWithBookLines += 1;
        } else {
            cardsModelOnly += 1;
        }

        const dir = resolve(PUBLIC_DIR, 'edges', match.slug);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        const html = renderMatchPage(model);
        writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
        generated += 1;
    }

    const sitemap = generateSitemap(ALL_MATCHES);
    writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8');

    console.log(`✓ ${generated} match pages`);
    console.log(`✓ pages with bookmaker cards: ${cardsWithBookLines}`);
    console.log(`✓ pages with model-only fallback: ${cardsModelOnly}`);
    console.log('✓ sitemap.xml');
    console.log(`Build date: ${BUILD_TIME}`);
}

main().catch((err) => {
    console.error('Prerender failed:', err);
    process.exit(1);
});

/**
 * useLiveData — Unified data layer for The Drip WC26
 *
 * Queries wc26_odds + wc26_teams on supabase-sports (qffzvrnbzabcokqqrwbv).
 * Polymarket data lives alongside sportsbook data in wc26_odds (bookmaker='polymarket').
 * Falls back to static editorial data when Supabase is unconfigured or tables are empty.
 *
 * The product promise: live data when available, editorial quality always.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatOdds } from '../lib/odds';

// ── Types ──────────────────────────────────────────────────────────────────

export interface LiveFavorite {
    name: string;
    code: string;
    group: string;
    odds: string;
    implied: string;
    pct: number;
    desc: string;
    isLive: boolean;
    source?: string;
    updatedAt?: string;
}

export interface LiveEdge {
    market: string;
    sbName: string;
    sbOdds: string;
    pmName: string;
    pmPrice: string;
    edge: number;
    confidence: 'high' | 'medium' | 'low';
    volume: number;
    link: string;
    isLive: boolean;
    updatedAt?: string;
}

export interface LiveMarketDepth {
    name: string;
    code: string;
    amount: string;
    pct: string;
    width: number;
    isLeader: boolean;
    isLive: boolean;
}

export interface LiveTeamOdds {
    odds: string;
    implied: string;
    pct: number;
    isLongshot: boolean;
    isLive: boolean;
    source?: string;
}

export interface GroupFixture {
    id: string;
    kickoff: string;
    homeTeam: string;
    awayTeam: string;
    venue: string;
    city: string | null;
    matchNumber: number | null;
}

// ── Static fallback data (editorial baseline) ──────────────────────────────

const STATIC_FAVORITES: LiveFavorite[] = [
    { name: 'Spain', code: 'ESP', group: 'H', odds: '+450', implied: '15.0%', pct: 100, desc: 'Euro 2024 Champs', isLive: false },
    { name: 'England', code: 'ENG', group: 'L', odds: '+550', implied: '13.2%', pct: 88, desc: 'Kane + Bellingham', isLive: false },
    { name: 'Argentina', code: 'ARG', group: 'J', odds: '+800', implied: '12.3%', pct: 82, desc: 'Defending Champs', isLive: false },
    { name: 'France', code: 'FRA', group: 'I', odds: '+750', implied: '10.5%', pct: 70, desc: 'Mbappé Golden Boot fav', isLive: false },
    { name: 'Brazil', code: 'BRA', group: 'C', odds: '+750', implied: '10.5%', pct: 70, desc: '5× Champions', isLive: false },
    { name: 'Germany', code: 'GER', group: 'E', odds: '+1000', implied: '7.1%', pct: 47, desc: 'Wirtz & Musiala', isLive: false },
];

const STATIC_MARKET_DEPTH: LiveMarketDepth[] = [
    { name: 'Spain', code: 'ESP', amount: '$41.3M', pct: '18.5%', width: 100, isLeader: true, isLive: false },
    { name: 'England', code: 'ENG', amount: '$31.7M', pct: '14.2%', width: 76, isLeader: false, isLive: false },
    { name: 'Argentina', code: 'ARG', amount: '$30.8M', pct: '13.8%', width: 74, isLeader: false, isLive: false },
    { name: 'France', code: 'FRA', amount: '$27.0M', pct: '12.1%', width: 65, isLeader: false, isLive: false },
    { name: 'Brazil', code: 'BRA', amount: '$25.7M', pct: '11.5%', width: 62, isLeader: false, isLive: false },
    { name: 'Germany', code: 'GER', amount: '$18.5M', pct: '8.3%', width: 44, isLeader: false, isLive: false },
];

const STATIC_TEAM_ODDS: Record<string, LiveTeamOdds> = {
    MEX: { odds: '+6600', implied: '1.5%', pct: 10, isLongshot: false, isLive: false },
    KOR: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true, isLive: false },
    RSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    SUI: { odds: '+10000', implied: '1.0%', pct: 7, isLongshot: false, isLive: false },
    CAN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true, isLive: false },
    QAT: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    BRA: { odds: '+750', implied: '10.5%', pct: 70, isLongshot: false, isLive: false },
    MAR: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false, isLive: false },
    SCO: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    HAI: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    USA: { odds: '+2500', implied: '3.8%', pct: 25, isLongshot: false, isLive: false },
    PAR: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true, isLive: false },
    AUS: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true, isLive: false },
    GER: { odds: '+1000', implied: '7.1%', pct: 47, isLongshot: false, isLive: false },
    CIV: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true, isLive: false },
    ECU: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true, isLive: false },
    CUW: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    NED: { odds: '+1400', implied: '5.3%', pct: 35, isLongshot: false, isLive: false },
    JPN: { odds: '+8000', implied: '1.2%', pct: 8, isLongshot: false, isLive: false },
    TUN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    BEL: { odds: '+3000', implied: '2.5%', pct: 17, isLongshot: false, isLive: false },
    EGY: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true, isLive: false },
    IRN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    NZL: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    ESP: { odds: '+450', implied: '15.0%', pct: 100, isLongshot: false, isLive: false },
    URU: { odds: '+4000', implied: '2.4%', pct: 16, isLongshot: false, isLive: false },
    KSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    CPV: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    FRA: { odds: '+750', implied: '10.5%', pct: 70, isLongshot: false, isLive: false },
    NOR: { odds: '+10000', implied: '1.0%', pct: 7, isLongshot: false, isLive: false },
    SEN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true, isLive: false },
    ARG: { odds: '+800', implied: '12.3%', pct: 82, isLongshot: false, isLive: false },
    AUT: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true, isLive: false },
    ALG: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    JOR: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    POR: { odds: '+1200', implied: '6.3%', pct: 42, isLongshot: false, isLive: false },
    COL: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false, isLive: false },
    UZB: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
    ENG: { odds: '+550', implied: '13.2%', pct: 88, isLongshot: false, isLive: false },
    CRO: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false, isLive: false },
    GHA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true, isLive: false },
    PAN: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true, isLive: false },
};

// Team name/group lookup for building favorites from DB
const TEAM_META: Record<string, { name: string; group: string; desc: string }> = {
    ESP: { name: 'Spain', group: 'H', desc: 'Euro 2024 Champs' },
    ENG: { name: 'England', group: 'L', desc: 'Kane + Bellingham' },
    ARG: { name: 'Argentina', group: 'J', desc: 'Defending Champs' },
    FRA: { name: 'France', group: 'I', desc: 'Mbappé Golden Boot fav' },
    BRA: { name: 'Brazil', group: 'C', desc: '5× Champions' },
    GER: { name: 'Germany', group: 'E', desc: 'Wirtz & Musiala' },
    NED: { name: 'Netherlands', group: 'F', desc: '2024 Euro semifinal' },
    POR: { name: 'Portugal', group: 'K', desc: 'Ronaldo swan song' },
    BEL: { name: 'Belgium', group: 'G', desc: 'Golden gen final chapter' },
    USA: { name: 'USA', group: 'D', desc: 'Pochettino · Home soil' },
};

// ── Unified hooks ──────────────────────────────────────────────────────────

/**
 * useFavorites: Returns top tournament favorites with live multi-book consensus.
 * Queries wc26_odds joined with wc26_teams for fifa_code resolution.
 */
export function useFavorites() {
    return useQuery<{ data: LiveFavorite[]; isLive: boolean }>({
        queryKey: ['wc-favorites'],
        queryFn: async () => {
            if (!isSupabaseConfigured()) {
                return { data: STATIC_FAVORITES, isLive: false };
            }

            try {
                const { data, error } = await supabase
                    .from('wc26_odds')
                    .select('team_slug, bookmaker, american_odds, implied_probability, fetched_at, wc26_teams!inner(fifa_code, name, group_letter)')
                    .eq('market', 'outright_winner')
                    .order('implied_probability', { ascending: false })
                    .limit(80);

                if (error || !data?.length) {
                    return { data: STATIC_FAVORITES, isLive: false };
                }

                // Group by team, take highest implied per team
                const teamMap: Record<string, {
                    odds: number;
                    implied: number;
                    bookmaker: string;
                    fetchedAt: string;
                    name: string;
                    code: string;
                    group: string;
                }> = {};

                for (const row of data) {
                    const team = row.wc26_teams as unknown as { fifa_code: string; name: string; group_letter: string };
                    const code = team.fifa_code;
                    const implied = Number(row.implied_probability);
                    const existing = teamMap[code];
                    if (!existing || implied > existing.implied) {
                        teamMap[code] = {
                            odds: row.american_odds,
                            implied,
                            bookmaker: row.bookmaker,
                            fetchedAt: row.fetched_at,
                            name: team.name,
                            code,
                            group: team.group_letter,
                        };
                    }
                }

                const sorted = Object.values(teamMap)
                    .sort((a, b) => b.implied - a.implied)
                    .slice(0, 6);

                if (sorted.length === 0) {
                    return { data: STATIC_FAVORITES, isLive: false };
                }

                const maxImplied = sorted[0].implied;

                const favorites: LiveFavorite[] = sorted.map(d => {
                    const meta = TEAM_META[d.code];
                    return {
                        name: meta?.name || d.name,
                        code: d.code,
                        group: d.group?.trim() || meta?.group || '?',
                        odds: formatOdds(d.odds),
                        implied: `${(d.implied * 100).toFixed(1)}%`,
                        pct: Math.round((d.implied / maxImplied) * 100),
                        desc: meta?.desc || '',
                        isLive: true,
                        source: d.bookmaker,
                        updatedAt: d.fetchedAt,
                    };
                });

                return { data: favorites, isLive: true };
            } catch {
                return { data: STATIC_FAVORITES, isLive: false };
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    });
}

/**
 * useMarketDepth: Polymarket volume distribution.
 * Queries wc26_odds WHERE bookmaker='polymarket' for volume data.
 */
export function useMarketDepth() {
    return useQuery<{ data: LiveMarketDepth[]; isLive: boolean; totalVolume: string }>({
        queryKey: ['wc-market-depth'],
        queryFn: async () => {
            if (!isSupabaseConfigured()) {
                return { data: STATIC_MARKET_DEPTH, isLive: false, totalVolume: '$223.3M' };
            }

            try {
                const { data, error } = await supabase
                    .from('wc26_odds')
                    .select('team_slug, volume, wc26_teams!inner(fifa_code, name)')
                    .eq('bookmaker', 'polymarket')
                    .eq('market', 'outright_winner')
                    .order('volume', { ascending: false });

                if (error || !data?.length) {
                    return { data: STATIC_MARKET_DEPTH, isLive: false, totalVolume: '$223.3M' };
                }

                let total = 0;
                const rows = data.map(row => {
                    const team = row.wc26_teams as unknown as { fifa_code: string; name: string };
                    const vol = Number(row.volume) || 0;
                    total += vol;
                    return { code: team.fifa_code, name: team.name, vol };
                });

                const sorted = rows.sort((a, b) => b.vol - a.vol).slice(0, 6);

                if (sorted.length === 0 || total === 0) {
                    return { data: STATIC_MARKET_DEPTH, isLive: false, totalVolume: '$223.3M' };
                }

                const maxVol = sorted[0].vol;

                const depth: LiveMarketDepth[] = sorted.map((r, i) => ({
                    name: r.name,
                    code: r.code,
                    amount: r.vol >= 1_000_000 ? `$${(r.vol / 1_000_000).toFixed(1)}M` : `$${(r.vol / 1_000).toFixed(0)}K`,
                    pct: `${((r.vol / total) * 100).toFixed(1)}%`,
                    width: Math.round((r.vol / maxVol) * 100),
                    isLeader: i === 0,
                    isLive: true,
                }));

                const totalStr = total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : `$${(total / 1_000).toFixed(0)}K`;

                return { data: depth, isLive: true, totalVolume: totalStr };
            } catch {
                return { data: STATIC_MARKET_DEPTH, isLive: false, totalVolume: '$223.3M' };
            }
        },
        staleTime: 120_000,
        refetchInterval: 300_000,
    });
}

/**
 * getStaticTeamOdds: Synchronous fallback for when live data is unavailable.
 */
export function getStaticTeamOdds(teamCode: string): LiveTeamOdds {
    return STATIC_TEAM_ODDS[teamCode] || {
        odds: 'TBD',
        implied: '—',
        pct: 0,
        isLongshot: true,
        isLive: false,
    };
}

const normalizeMarket = (market: string): string =>
    market
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ');

const isAdvancementMarket = (market: unknown): boolean => {
    if (typeof market !== 'string' || market.trim().length === 0) return false;
    const normalized = normalizeMarket(market);
    if (normalized.includes('winner') || normalized.includes('outright')) return false;
    return normalized.includes('advance') || normalized.includes('qualif') || normalized.includes('progress');
};

const readString = (row: Record<string, unknown>, keys: string[]): string | null => {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length > 0) return trimmed;
        }
    }
    return null;
};

const readNumber = (row: Record<string, unknown>, keys: string[]): number | null => {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string') {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
    }
    return null;
};

const slugToTeamName = (slug: string | null): string | null => {
    if (!slug) return null;
    return slug
        .split('-')
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
};

/**
 * useGroupAdvancementOdds: Multi-book consensus "to advance" pricing by group.
 * Hides outright/group-winner markets to keep group pages context-correct.
 */
export function useGroupAdvancementOdds(groupLetter: string) {
    return useQuery<Record<string, LiveTeamOdds>>({
        queryKey: ['wc-group-advancement-odds', groupLetter],
        queryFn: async () => {
            if (!isSupabaseConfigured() || !groupLetter.trim()) return {};

            try {
                const { data, error } = await supabase
                    .from('wc26_odds')
                    .select('market, team_slug, bookmaker, american_odds, implied_probability, wc26_teams!inner(fifa_code, name, group_letter)')
                    .eq('wc26_teams.group_letter', groupLetter.toUpperCase());

                if (error || !data?.length) return {};

                const advancementRows = (data as Array<Record<string, unknown>>)
                    .filter((row) => isAdvancementMarket(row.market));

                if (advancementRows.length === 0) return {};

                const teamMap: Record<string, { odds: number; implied: number; bookmaker: string }[]> = {};

                for (const row of advancementRows) {
                    const team = row.wc26_teams as { fifa_code?: string } | null;
                    const code = team?.fifa_code;
                    if (!code) continue;

                    const implied = Number(row.implied_probability);
                    const americanOdds = Number(row.american_odds);
                    const bookmaker = typeof row.bookmaker === 'string' ? row.bookmaker : 'sportsbook';

                    if (!Number.isFinite(implied) || !Number.isFinite(americanOdds)) continue;

                    if (!teamMap[code]) teamMap[code] = [];
                    teamMap[code].push({
                        odds: americanOdds,
                        implied,
                        bookmaker,
                    });
                }

                const codes = Object.keys(teamMap);
                if (codes.length === 0) return {};

                let maxImplied = 0;
                for (const rows of Object.values(teamMap)) {
                    const best = Math.max(...rows.map((entry) => entry.implied));
                    if (best > maxImplied) maxImplied = best;
                }

                const result: Record<string, LiveTeamOdds> = {};
                for (const code of codes) {
                    const rows = teamMap[code];
                    const avgImplied = rows.reduce((sum, entry) => sum + entry.implied, 0) / rows.length;
                    const bestOdds = rows.reduce((best, entry) => (entry.odds > best ? entry.odds : best), rows[0].odds);
                    const pct = maxImplied > 0 ? Math.round((avgImplied / maxImplied) * 100) : 0;

                    result[code] = {
                        odds: formatOdds(bestOdds),
                        implied: avgImplied >= 0.01 ? `${(avgImplied * 100).toFixed(1)}%` : '<1%',
                        pct,
                        isLongshot: avgImplied < 0.02,
                        isLive: true,
                        source: rows[0].bookmaker,
                    };
                }

                return result;
            } catch {
                return {};
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    });
}

/**
 * useGroupFixtures: Group-stage fixture rows from wc26_fixtures.
 */
export function useGroupFixtures(groupLetter: string) {
    return useQuery<GroupFixture[]>({
        queryKey: ['wc-group-fixtures', groupLetter],
        queryFn: async () => {
            if (!isSupabaseConfigured() || !groupLetter.trim()) return [];

            const targetGroup = groupLetter.toUpperCase();
            const candidateColumns = ['group_letter', 'group'];
            let rows: Array<Record<string, unknown>> = [];

            for (const column of candidateColumns) {
                const { data, error } = await supabase
                    .from('wc26_fixtures')
                    .select('*')
                    .eq(column, targetGroup);

                if (error) continue;
                if (Array.isArray(data) && data.length > 0) {
                    rows = data as Array<Record<string, unknown>>;
                    break;
                }
            }

            if (rows.length === 0) return [];

            const fixtures: GroupFixture[] = rows.map((row, index) => {
                const kickoff = readString(row, ['kickoff', 'start_time', 'commence_time', 'match_time']) || '';
                const homeTeam = readString(row, ['home_team', 'home_name', 'home']) || slugToTeamName(readString(row, ['home_slug'])) || 'TBD';
                const awayTeam = readString(row, ['away_team', 'away_name', 'away']) || slugToTeamName(readString(row, ['away_slug'])) || 'TBD';
                const venue = readString(row, ['venue_name', 'venue', 'stadium']) || 'Venue TBD';
                const city = readString(row, ['venue_city', 'city']);
                const id = readString(row, ['fixture_id', 'id']) || `${targetGroup}-${index + 1}`;

                return {
                    id,
                    kickoff,
                    homeTeam,
                    awayTeam,
                    venue,
                    city,
                    matchNumber: readNumber(row, ['match_number']),
                };
            }).filter((fixture) => fixture.kickoff.length > 0);

            fixtures.sort((a, b) => {
                const timeA = Date.parse(a.kickoff);
                const timeB = Date.parse(b.kickoff);
                if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
                    return timeA - timeB;
                }
                const matchA = a.matchNumber ?? Number.MAX_SAFE_INTEGER;
                const matchB = b.matchNumber ?? Number.MAX_SAFE_INTEGER;
                if (matchA !== matchB) return matchA - matchB;
                return a.id.localeCompare(b.id);
            });

            return fixtures;
        },
        staleTime: 300_000,
        refetchInterval: 300_000,
    });
}

/**
 * useGroupOdds: Multi-book consensus odds for all teams in a group.
 * Returns Record<fifaCode, LiveTeamOdds>.
 */
export function useGroupOdds(groupLetter: string) {
    return useQuery<Record<string, LiveTeamOdds>>({
        queryKey: ['wc-group-odds', groupLetter],
        queryFn: async () => {
            if (!isSupabaseConfigured()) return {};

            try {
                const { data, error } = await supabase
                    .from('wc26_odds')
                    .select('team_slug, bookmaker, american_odds, implied_probability, wc26_teams!inner(fifa_code, name, group_letter)')
                    .eq('market', 'outright_winner')
                    .eq('wc26_teams.group_letter', groupLetter.toUpperCase())
                    .order('implied_probability', { ascending: false });

                if (error || !data?.length) return {};

                const teamMap: Record<string, { odds: number; implied: number; bookmaker: string }[]> = {};

                for (const row of data) {
                    const team = row.wc26_teams as unknown as { fifa_code: string; name: string; group_letter: string };
                    const code = team.fifa_code;
                    if (!teamMap[code]) teamMap[code] = [];
                    teamMap[code].push({
                        odds: row.american_odds,
                        implied: Number(row.implied_probability),
                        bookmaker: row.bookmaker,
                    });
                }

                let maxImplied = 0;
                for (const rows of Object.values(teamMap)) {
                    const best = Math.max(...rows.map(r => r.implied));
                    if (best > maxImplied) maxImplied = best;
                }

                const { data: groupTeams } = await supabase
                    .from('wc26_teams')
                    .select('fifa_code')
                    .eq('group_letter', groupLetter.toUpperCase());

                const allCodes = groupTeams?.map(t => t.fifa_code) || Object.keys(teamMap);

                const result: Record<string, LiveTeamOdds> = {};
                for (const code of allCodes) {
                    const rows = teamMap[code];
                    if (!rows?.length) {
                        result[code] = { odds: 'TBD', implied: '—', pct: 0, isLongshot: true, isLive: false };
                        continue;
                    }
                    const avgImplied = rows.reduce((s, r) => s + r.implied, 0) / rows.length;
                    const bestOdds = rows.reduce((best, r) => r.odds > best ? r.odds : best, rows[0].odds);
                    const pct = maxImplied > 0 ? Math.round((avgImplied / maxImplied) * 100) : 0;

                    result[code] = {
                        odds: formatOdds(bestOdds),
                        implied: avgImplied >= 0.01 ? `${(avgImplied * 100).toFixed(1)}%` : '<1%',
                        pct,
                        isLongshot: avgImplied < 0.005,
                        isLive: true,
                        source: rows[0].bookmaker,
                    };
                }

                return result;
            } catch {
                return {};
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    });
}

/**
 * useDataStatus: Simple health check — is Supabase configured and populated?
 * Used by Nav to show live data indicator.
 */
export function useDataStatus() {
    return useQuery<{ configured: boolean; oddsCount: number; polyCount: number }>({
        queryKey: ['wc-data-status'],
        queryFn: async () => {
            if (!isSupabaseConfigured()) {
                return { configured: false, oddsCount: 0, polyCount: 0 };
            }
            try {
                const [oddsRes, polyRes] = await Promise.all([
                    supabase.from('wc26_odds').select('id', { count: 'exact', head: true }).neq('bookmaker', 'polymarket'),
                    supabase.from('wc26_odds').select('id', { count: 'exact', head: true }).eq('bookmaker', 'polymarket'),
                ]);
                return {
                    configured: true,
                    oddsCount: oddsRes.count ?? 0,
                    polyCount: polyRes.count ?? 0,
                };
            } catch {
                return { configured: false, oddsCount: 0, polyCount: 0 };
            }
        },
        staleTime: 300_000,
    });
}

/**
 * useGroupEdges: Book-vs-Polymarket edges for a specific group.
 * Computed client-side from wc26_odds comparing polymarket vs sportsbook rows.
 */
export function useGroupEdges(groupLetter: string) {
    return useQuery<{ data: LiveEdge[]; isLive: boolean }>({
        queryKey: ['wc-group-edges', groupLetter],
        queryFn: async () => {
            if (!isSupabaseConfigured() || !groupLetter.trim()) return { data: [], isLive: false };

            try {
                const { data, error } = await supabase
                    .from('wc26_odds')
                    .select('team_slug, bookmaker, american_odds, implied_probability, volume, fetched_at, wc26_teams!inner(fifa_code, name, group_letter)')
                    .eq('market', 'outright_winner')
                    .eq('wc26_teams.group_letter', groupLetter.toUpperCase());

                if (error || !data?.length) return { data: [], isLive: false };

                type OddsRow = {
                    team_slug: string;
                    bookmaker: string;
                    american_odds: number;
                    implied_probability: string | number;
                    volume: number | null;
                    fetched_at: string;
                    wc26_teams: { fifa_code: string; name: string; group_letter: string };
                };

                const polyRows: Record<string, OddsRow> = {};
                const bookRows: Record<string, OddsRow> = {};

                for (const row of data as unknown as OddsRow[]) {
                    const code = row.wc26_teams.fifa_code;
                    if (row.bookmaker === 'polymarket') {
                        polyRows[code] = row;
                    } else {
                        const existing = bookRows[code];
                        if (!existing || Number(row.implied_probability) < Number(existing.implied_probability)) {
                            bookRows[code] = row;
                        }
                    }
                }

                const edges: LiveEdge[] = [];
                for (const [code, poly] of Object.entries(polyRows)) {
                    const book = bookRows[code];
                    if (!book) continue;

                    const pmImplied = Number(poly.implied_probability);
                    const bookImplied = Number(book.implied_probability);
                    const edgePct = Math.round((pmImplied - bookImplied) * 1000) / 10;
                    const teamName = poly.wc26_teams.name;

                    edges.push({
                        market: `${teamName} to Win WC`,
                        sbName: book.bookmaker,
                        sbOdds: formatOdds(book.american_odds),
                        pmName: 'Polymarket',
                        pmPrice: `${Math.round(pmImplied * 100)}¢`,
                        edge: edgePct,
                        confidence: Math.abs(edgePct) >= 5 ? 'high' : Math.abs(edgePct) >= 2 ? 'medium' : 'low',
                        volume: Number(poly.volume) || 0,
                        link: `/edges/${teamName.toLowerCase().replace(/\s+/g, '-')}-outright`,
                        isLive: true,
                        updatedAt: poly.fetched_at,
                    });
                }

                edges.sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge));

                return { data: edges, isLive: edges.length > 0 };
            } catch {
                return { data: [], isLive: false };
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    });
}

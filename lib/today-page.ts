import type { SupabaseClient } from '@supabase/supabase-js';
import { ALL_MATCHES, type MatchSeed } from '../src/data/all-matches';
import { matchSlug } from '../src/lib/slugify';
import {
    HOME_FAVORITES,
    HOME_MARKET_DEPTH,
    type HomeFavorite,
    type HomeMarketDepthRow,
} from './home-page-data';
import { createServerSupabaseClient } from './supabase/server';

type MatchRow = Record<string, unknown>;
type CandidateTable = 'matches' | 'soccer_postgame';
type CandidateTimeColumn = 'commence_time' | 'start_time' | 'kickoff';

type QueryErrorLike = {
    code?: string;
    message?: string;
};

export interface TodayPageMatch {
    id: string;
    slug: string | null;
    homeTeam: string;
    homeCode?: string;
    awayTeam: string;
    awayCode?: string;
    kickoff: string;
    kickoffLabel: string;
    venue: string;
    matchNumber?: number;
    sportKey: string;
    leagueKey: string;
    sportLabel: string;
    leagueLabel: string;
    source: 'database' | 'schedule';
}

export interface TodayPageMatchGroup {
    key: string;
    sportLabel: string;
    leagueLabel: string;
    matches: TodayPageMatch[];
}

export interface TodayPageData {
    requestedDateUtc: string;
    requestedDateLabel: string;
    windowDateUtc: string;
    windowDateLabel: string;
    isFallbackDate: boolean;
    sourceLabel: string;
    totalMatches: number;
    groups: TodayPageMatchGroup[];
    topFavorite: HomeFavorite;
    topVolume: HomeMarketDepthRow;
    volumeTotal: string;
    sameLeader: boolean;
}

const TOTAL_VOLUME = '$223.3M';
const WORLD_CUP_LEAGUE_KEY = 'fifa-world-cup-2026';
const WORLD_CUP_LEAGUE_LABEL = 'FIFA World Cup 2026';
const WORLD_CUP_SPORT_KEY = 'soccer';
const WORLD_CUP_SPORT_LABEL = 'Soccer';
const CANDIDATE_TABLES: CandidateTable[] = ['matches', 'soccer_postgame'];
const CANDIDATE_TIME_COLUMNS: CandidateTimeColumn[] = ['commence_time', 'start_time', 'kickoff'];

function toUtcDateString(input: Date): string {
    return input.toISOString().slice(0, 10);
}

function formatUtcDate(dateUtc: string): string {
    const parsed = new Date(`${dateUtc}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return dateUtc;

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeZone: 'UTC',
    }).format(parsed);
}

function formatKickoff(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return 'Kickoff TBD';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(parsed);
}

function nextUtcDate(dateUtc: string): string {
    const next = new Date(`${dateUtc}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return toUtcDateString(next);
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
    return Array.from(
        new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)),
    );
}

function readFirstString(row: MatchRow | null, keys: string[]): string | null {
    if (!row) return null;

    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            return String(value);
        }
    }

    return null;
}

function readFirstNumber(row: MatchRow | null, keys: string[]): number | undefined {
    if (!row) return undefined;

    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            if (Number.isFinite(parsed)) return parsed;
        }
    }

    return undefined;
}

function humanizeToken(value: string): string {
    return value
        .replace(/[_./-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toToken(value: string | null, fallback: string): string {
    return (value ?? fallback).toLowerCase().trim();
}

function asQueryError(value: unknown): QueryErrorLike | null {
    if (!value || typeof value !== 'object') return null;

    const record = value as QueryErrorLike;
    return {
        code: typeof record.code === 'string' ? record.code : undefined,
        message: typeof record.message === 'string' ? record.message : undefined,
    };
}

function isMissingColumnError(error: QueryErrorLike | null): boolean {
    return !!error && (error.code === '42703' || /column .* does not exist/i.test(error.message ?? ''));
}

function isMissingTableError(error: QueryErrorLike | null): boolean {
    return !!error && (error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? ''));
}

function isPermissionError(error: QueryErrorLike | null): boolean {
    return !!error && (error.code === '42501' || /permission denied/i.test(error.message ?? ''));
}

async function withResolvedVenueAndTeams(supabase: SupabaseClient, rows: MatchRow[]): Promise<MatchRow[]> {
    if (rows.length === 0) return rows;

    const venueIds = uniqueStrings(rows.map((row) => readFirstString(row, ['venue_id'])));
    const teamCodes = uniqueStrings(rows.flatMap((row) => [
        readFirstString(row, ['home_team_code', 'home_code']),
        readFirstString(row, ['away_team_code', 'away_code']),
    ]).map((value) => value?.toUpperCase()));

    const venueById = new Map<string, string>();
    const teamNameByCode = new Map<string, string>();

    if (venueIds.length > 0) {
        const { data, error } = await supabase
            .from('venues')
            .select('id,name,city')
            .in('id', venueIds);

        if (!error) {
            for (const entry of ((data as MatchRow[] | null) ?? [])) {
                const id = readFirstString(entry, ['id']);
                const name = readFirstString(entry, ['name']);
                const city = readFirstString(entry, ['city']);
                if (!id || !name) continue;
                venueById.set(id, city ? `${name} • ${city}` : name);
            }
        }
    }

    if (teamCodes.length > 0) {
        const { data, error } = await supabase
            .from('teams')
            .select('code,name')
            .in('code', teamCodes);

        if (!error) {
            for (const entry of ((data as MatchRow[] | null) ?? [])) {
                const code = readFirstString(entry, ['code']);
                const name = readFirstString(entry, ['name']);
                if (!code || !name) continue;
                teamNameByCode.set(code.toUpperCase(), name);
            }
        }
    }

    return rows.map((row) => {
        const next = { ...row };

        if (!readFirstString(next, ['venue_name', 'venue', 'stadium'])) {
            const venueId = readFirstString(next, ['venue_id']);
            if (venueId) {
                const venue = venueById.get(venueId);
                if (venue) next.venue_name = venue;
            }
        }

        if (!readFirstString(next, ['home_team_name', 'home_team', 'home_name'])) {
            const homeCode = readFirstString(next, ['home_team_code', 'home_code']);
            if (homeCode) {
                const homeName = teamNameByCode.get(homeCode.toUpperCase());
                if (homeName) next.home_team_name = homeName;
            }
        }

        if (!readFirstString(next, ['away_team_name', 'away_team', 'away_name'])) {
            const awayCode = readFirstString(next, ['away_team_code', 'away_code']);
            if (awayCode) {
                const awayName = teamNameByCode.get(awayCode.toUpperCase());
                if (awayName) next.away_team_name = awayName;
            }
        }

        return next;
    });
}

function deriveSportLeague(row: MatchRow): {
    sportKey: string;
    leagueKey: string;
    sportLabel: string;
    leagueLabel: string;
} {
    const rawSportKey = readFirstString(row, ['sport_key', 'sport', 'sport_title']);
    const rawLeagueKey = readFirstString(row, ['league_id', 'league_key', 'league', 'league_title', 'league_name']);
    const rawSportLabel = readFirstString(row, ['sport_title', 'sport_name']);
    const rawLeagueLabel = readFirstString(row, ['league_name', 'league_title']);

    const parsedSportKey = (rawSportKey ?? '')
        .toLowerCase()
        .split(/[_./]/)
        .filter(Boolean);

    const parsedSport = parsedSportKey[0] ?? WORLD_CUP_SPORT_KEY;
    const parsedLeague = parsedSportKey.length > 1 ? parsedSportKey.slice(1).join('-') : WORLD_CUP_LEAGUE_KEY;

    return {
        sportKey: toToken(rawSportKey ?? parsedSport, WORLD_CUP_SPORT_KEY),
        leagueKey: toToken(rawLeagueKey ?? parsedLeague, WORLD_CUP_LEAGUE_KEY),
        sportLabel: rawSportLabel ?? humanizeToken(parsedSport),
        leagueLabel: rawLeagueLabel ?? humanizeToken(rawLeagueKey ?? parsedLeague),
    };
}

function findSeedForRow(row: MatchRow, kickoff: string): MatchSeed | null {
    const rowDate = kickoff.slice(0, 10);
    const homeCode = readFirstString(row, ['home_team_code', 'home_code'])?.toUpperCase();
    const awayCode = readFirstString(row, ['away_team_code', 'away_code'])?.toUpperCase();
    const homeTeam = readFirstString(row, ['home_team_name', 'home_team', 'home_name'])?.toLowerCase();
    const awayTeam = readFirstString(row, ['away_team_name', 'away_team', 'away_name'])?.toLowerCase();

    const byCode = ALL_MATCHES.find((match) =>
        match.kickoff.slice(0, 10) === rowDate
        && (!!homeCode && !!awayCode)
        && match.homeCode.toUpperCase() === homeCode
        && match.awayCode.toUpperCase() === awayCode,
    );

    if (byCode) return byCode;

    const byName = ALL_MATCHES.find((match) =>
        match.kickoff.slice(0, 10) === rowDate
        && (!!homeTeam && !!awayTeam)
        && match.homeTeam.toLowerCase() === homeTeam
        && match.awayTeam.toLowerCase() === awayTeam,
    );

    return byName ?? null;
}

function mapDatabaseMatch(row: MatchRow, index: number): TodayPageMatch | null {
    const kickoff = readFirstString(row, ['commence_time', 'start_time', 'kickoff']);
    if (!kickoff) return null;

    const explicitSlug = readFirstString(row, ['slug']);
    const seed = findSeedForRow(row, kickoff);
    const homeCode = readFirstString(row, ['home_team_code', 'home_code']) ?? seed?.homeCode;
    const awayCode = readFirstString(row, ['away_team_code', 'away_code']) ?? seed?.awayCode;

    const slug = explicitSlug
        ?? seed?.slug
        ?? (homeCode && awayCode && seed ? matchSlug(awayCode, homeCode, kickoff.slice(0, 10)) : null);

    const { sportKey, leagueKey, sportLabel, leagueLabel } = deriveSportLeague(row);
    const homeTeam = readFirstString(row, ['home_team_name', 'home_team', 'home_name']) ?? seed?.homeTeam ?? 'Home';
    const awayTeam = readFirstString(row, ['away_team_name', 'away_team', 'away_name']) ?? seed?.awayTeam ?? 'Away';
    const venue = readFirstString(row, ['venue_name', 'venue', 'stadium']) ?? seed?.venue ?? 'Venue TBD';
    const id = readFirstString(row, ['id', 'match_id', 'event_id']) ?? `${kickoff}-${homeTeam}-${awayTeam}-${index}`;

    return {
        id,
        slug,
        homeTeam,
        homeCode: homeCode ?? undefined,
        awayTeam,
        awayCode: awayCode ?? undefined,
        kickoff,
        kickoffLabel: formatKickoff(kickoff),
        venue,
        matchNumber: readFirstNumber(row, ['match_number']) ?? seed?.matchNumber,
        sportKey,
        leagueKey,
        sportLabel,
        leagueLabel,
        source: 'database',
    };
}

async function fetchDatabaseMatches(dateUtc: string): Promise<TodayPageMatch[]> {
    const supabase = createServerSupabaseClient();
    if (!supabase) return [];

    const startIso = `${dateUtc}T00:00:00.000Z`;
    const endIso = `${nextUtcDate(dateUtc)}T00:00:00.000Z`;

    for (const table of CANDIDATE_TABLES) {
        let skipTable = false;

        for (const timeColumn of CANDIDATE_TIME_COLUMNS) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .gte(timeColumn, startIso)
                    .lt(timeColumn, endIso)
                    .order(timeColumn, { ascending: true });

                if (!error) {
                    const rows = await withResolvedVenueAndTeams(supabase, (data as MatchRow[] | null) ?? []);
                    return rows
                        .map((row, index) => mapDatabaseMatch(row, index))
                        .filter((row): row is TodayPageMatch => row !== null);
                }

                const normalized = asQueryError(error);
                if (isMissingColumnError(normalized)) {
                    continue;
                }

                if (isMissingTableError(normalized) || isPermissionError(normalized)) {
                    skipTable = true;
                    break;
                }

                return [];
            } catch {
                return [];
            }
        }

        if (!skipTable) {
            break;
        }
    }

    return [];
}

function mapSeedMatch(seed: MatchSeed): TodayPageMatch {
    return {
        id: String(seed.id),
        slug: seed.slug,
        homeTeam: seed.homeTeam,
        homeCode: seed.homeCode,
        awayTeam: seed.awayTeam,
        awayCode: seed.awayCode,
        kickoff: seed.kickoff,
        kickoffLabel: formatKickoff(seed.kickoff),
        venue: `${seed.venue} • ${seed.venueCity}`,
        matchNumber: seed.matchNumber,
        sportKey: WORLD_CUP_SPORT_KEY,
        leagueKey: WORLD_CUP_LEAGUE_KEY,
        sportLabel: WORLD_CUP_SPORT_LABEL,
        leagueLabel: WORLD_CUP_LEAGUE_LABEL,
        source: 'schedule',
    };
}

function getSeedMatchesForDate(dateUtc: string): TodayPageMatch[] {
    return ALL_MATCHES
        .filter((match) => match.kickoff.slice(0, 10) === dateUtc)
        .sort((a, b) => a.matchNumber - b.matchNumber)
        .map(mapSeedMatch);
}

function getNextSeedWindow(requestedDateUtc: string): { dateUtc: string; matches: TodayPageMatch[] } {
    const nextDate = ALL_MATCHES
        .map((match) => match.kickoff.slice(0, 10))
        .filter((dateUtc) => dateUtc >= requestedDateUtc)
        .sort()[0];

    if (!nextDate) {
        return {
            dateUtc: requestedDateUtc,
            matches: [],
        };
    }

    return {
        dateUtc: nextDate,
        matches: getSeedMatchesForDate(nextDate),
    };
}

function groupMatches(matches: TodayPageMatch[]): TodayPageMatchGroup[] {
    const groups = new Map<string, TodayPageMatchGroup>();

    for (const match of matches) {
        const key = `${match.sportKey}::${match.leagueKey}`;
        const existing = groups.get(key);
        if (existing) {
            existing.matches.push(match);
            continue;
        }

        groups.set(key, {
            key,
            sportLabel: match.sportLabel,
            leagueLabel: match.leagueLabel,
            matches: [match],
        });
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            matches: [...group.matches].sort((a, b) => a.kickoff.localeCompare(b.kickoff)),
        }))
        .sort((a, b) => {
            const sportCompare = a.sportLabel.localeCompare(b.sportLabel);
            if (sportCompare !== 0) return sportCompare;
            return a.leagueLabel.localeCompare(b.leagueLabel);
        });
}

export async function getTodayPageData(now: Date = new Date()): Promise<TodayPageData> {
    const requestedDateUtc = toUtcDateString(now);
    const databaseMatches = await fetchDatabaseMatches(requestedDateUtc);

    let windowDateUtc = requestedDateUtc;
    let sourceLabel = 'Live daily slate';
    let matches = databaseMatches;

    if (matches.length === 0) {
        const seededTodayMatches = getSeedMatchesForDate(requestedDateUtc);
        if (seededTodayMatches.length > 0) {
            matches = seededTodayMatches;
            sourceLabel = 'Seeded World Cup schedule';
        } else {
            const nextWindow = getNextSeedWindow(requestedDateUtc);
            matches = nextWindow.matches;
            windowDateUtc = nextWindow.dateUtc;
            sourceLabel = nextWindow.matches.length > 0
                ? 'Next World Cup matchday'
                : 'No scheduled matches found';
        }
    }

    return {
        requestedDateUtc,
        requestedDateLabel: formatUtcDate(requestedDateUtc),
        windowDateUtc,
        windowDateLabel: formatUtcDate(windowDateUtc),
        isFallbackDate: windowDateUtc !== requestedDateUtc,
        sourceLabel,
        totalMatches: matches.length,
        groups: groupMatches(matches),
        topFavorite: HOME_FAVORITES[0],
        topVolume: HOME_MARKET_DEPTH[0],
        volumeTotal: TOTAL_VOLUME,
        sameLeader: HOME_FAVORITES[0].name === HOME_MARKET_DEPTH[0].name,
    };
}

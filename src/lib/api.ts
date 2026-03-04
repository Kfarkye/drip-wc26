import { supabase } from './supabase';

export async function getMatches(_groupLetter: string) {
    // Match data comes from static groups.ts — DB match table not yet wired
    return [];
}

export async function getEdges(groupLetter: string) {
    const { data, error } = await supabase
        .from('wc_edges')
        .select('*')
        .eq('group_letter', groupLetter.toUpperCase());

    if (error) throw error;
    return data;
}

export interface TodayMatch {
    id: string;
    homeTeam: string;
    homeCode?: string;
    awayTeam: string;
    awayCode?: string;
    commenceTime: string;
    venue: string;
    matchNumber?: number;
    sportKey: string;
    leagueKey: string;
    sportLabel: string;
    leagueLabel: string;
}

type DbRow = Record<string, unknown>;
type CandidateTable = 'matches' | 'soccer_postgame';
type CandidateTimeColumn = 'commence_time' | 'start_time' | 'kickoff';

const CANDIDATE_TABLES: CandidateTable[] = ['matches', 'soccer_postgame'];
const CANDIDATE_TIME_COLUMNS: CandidateTimeColumn[] = ['commence_time', 'start_time', 'kickoff'];

type QueryErrorLike = {
    code?: string;
    message?: string;
    details?: string;
};

const uniqueStrings = (values: Array<string | null | undefined>): string[] =>
    Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)));

const readFirstString = (row: DbRow, keys: string[]): string | null => {
    for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
};

const toToken = (value: string | null, fallback: string): string =>
    (value ?? fallback).toLowerCase().trim();

const humanizeToken = (value: string): string =>
    value
        .replace(/[_./-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const nextUtcDate = (dateUtc: string): string => {
    const next = new Date(`${dateUtc}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString().slice(0, 10);
};

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const asQueryError = (value: unknown): QueryErrorLike | null => {
    if (!isObject(value)) return null;
    return {
        code: typeof value.code === 'string' ? value.code : undefined,
        message: typeof value.message === 'string' ? value.message : undefined,
        details: typeof value.details === 'string' ? value.details : undefined,
    };
};

const isMissingColumnError = (error: QueryErrorLike | null): boolean =>
    !!error && (error.code === '42703' || /column .* does not exist/i.test(error.message ?? ''));

const isMissingTableError = (error: QueryErrorLike | null): boolean =>
    !!error && (error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? ''));

const isPermissionError = (error: QueryErrorLike | null): boolean =>
    !!error && (error.code === '42501' || /permission denied/i.test(error.message ?? ''));

const withResolvedVenueAndTeams = async (rows: DbRow[]): Promise<DbRow[]> => {
    if (rows.length === 0) return rows;

    const venueById = new Map<string, string>();
    const teamNameByCode = new Map<string, string>();

    const venueIds = uniqueStrings(rows.map((row) => readFirstString(row, ['venue_id'])));
    if (venueIds.length > 0) {
        const { data, error } = await supabase
            .from('venues')
            .select('id,name,city')
            .in('id', venueIds);

        if (!error) {
            for (const entry of ((data as DbRow[] | null) ?? [])) {
                const id = readFirstString(entry, ['id']);
                const name = readFirstString(entry, ['name']);
                const city = readFirstString(entry, ['city']);
                if (!id || !name) continue;
                venueById.set(id, city ? `${name}, ${city}` : name);
            }
        }
    }

    const teamCodes = uniqueStrings(rows.flatMap((row) => [
        readFirstString(row, ['home_team_code', 'home_code']),
        readFirstString(row, ['away_team_code', 'away_code']),
    ]).map((code) => code?.toUpperCase()));

    if (teamCodes.length > 0) {
        const { data, error } = await supabase
            .from('teams')
            .select('code,name')
            .in('code', teamCodes);

        if (!error) {
            for (const entry of ((data as DbRow[] | null) ?? [])) {
                const code = readFirstString(entry, ['code']);
                const name = readFirstString(entry, ['name']);
                if (!code || !name) continue;
                teamNameByCode.set(code.toUpperCase(), name);
            }
        }
    }

    return rows.map((row) => {
        const next = { ...row };

        const hasVenueText = readFirstString(next, ['venue_name', 'venue', 'stadium']);
        if (!hasVenueText) {
            const venueId = readFirstString(next, ['venue_id']);
            if (venueId) {
                const venueName = venueById.get(venueId);
                if (venueName) next.venue_name = venueName;
            }
        }

        const hasHomeName = readFirstString(next, ['home_team_name', 'home_team', 'home_name']);
        if (!hasHomeName) {
            const homeCode = readFirstString(next, ['home_team_code', 'home_code']);
            if (homeCode) {
                const resolved = teamNameByCode.get(homeCode.toUpperCase());
                if (resolved) next.home_team_name = resolved;
            }
        }

        const hasAwayName = readFirstString(next, ['away_team_name', 'away_team', 'away_name']);
        if (!hasAwayName) {
            const awayCode = readFirstString(next, ['away_team_code', 'away_code']);
            if (awayCode) {
                const resolved = teamNameByCode.get(awayCode.toUpperCase());
                if (resolved) next.away_team_name = resolved;
            }
        }

        return next;
    });
};

const deriveSportLeague = (row: DbRow): { sportKey: string; leagueKey: string; sportLabel: string; leagueLabel: string } => {
    const rawSportKey = readFirstString(row, ['sport_key', 'sport', 'sport_title']);
    const rawLeagueKey = readFirstString(row, ['league_id', 'league_key', 'league', 'league_title', 'league_name']);
    const rawSportLabel = readFirstString(row, ['sport_title', 'sport_name']);
    const rawLeagueLabel = readFirstString(row, ['league_name', 'league_title']);

    const keyParts = (rawSportKey ?? '')
        .toLowerCase()
        .split(/[_./]/)
        .filter(Boolean);

    const parsedSport = keyParts[0] ?? null;
    const parsedLeague = keyParts.length > 1 ? keyParts.slice(1).join('-') : null;

    const sportKey = toToken(rawSportKey ?? parsedSport, 'unknown-sport');
    const leagueKey = toToken(rawLeagueKey ?? parsedLeague, sportKey);
    const sportLabel = rawSportLabel ?? humanizeToken(parsedSport ?? sportKey);
    const leagueLabel = rawLeagueLabel ?? humanizeToken(rawLeagueKey ?? parsedLeague ?? sportKey);

    return { sportKey, leagueKey, sportLabel, leagueLabel };
};

const mapTodayMatch = (row: DbRow, index: number): TodayMatch | null => {
    const commenceTime = readFirstString(row, ['commence_time', 'kickoff', 'start_time']);
    if (!commenceTime) return null;

    const homeTeam = readFirstString(row, ['home_team_name', 'home_team', 'home_name']) ?? 'Home';
    const awayTeam = readFirstString(row, ['away_team_name', 'away_team', 'away_name']) ?? 'Away';
    const homeCode = readFirstString(row, ['home_team_code', 'home_code']) ?? undefined;
    const awayCode = readFirstString(row, ['away_team_code', 'away_code']) ?? undefined;
    const venue = readFirstString(row, ['venue_name', 'venue', 'stadium']) ?? 'Venue TBA';
    const id = readFirstString(row, ['id', 'match_id', 'event_id']) ?? `${commenceTime}-${homeTeam}-${awayTeam}-${index}`;
    const rawMatchNumber = row.match_number;
    const matchNumber = typeof rawMatchNumber === 'number'
        ? rawMatchNumber
        : typeof rawMatchNumber === 'string'
            ? Number.parseInt(rawMatchNumber, 10)
            : undefined;
    const { sportKey, leagueKey, sportLabel, leagueLabel } = deriveSportLeague(row);

    return {
        id,
        homeTeam,
        homeCode,
        awayTeam,
        awayCode,
        commenceTime,
        venue,
        matchNumber: Number.isFinite(matchNumber as number) ? matchNumber : undefined,
        sportKey,
        leagueKey,
        sportLabel,
        leagueLabel,
    };
};

export async function getMatchesForUtcDate(dateUtc: string): Promise<TodayMatch[]> {
    const startIso = `${dateUtc}T00:00:00.000Z`;
    const endIso = `${nextUtcDate(dateUtc)}T00:00:00.000Z`;
    let firstError: unknown = null;

    for (const table of CANDIDATE_TABLES) {
        let shouldTryNextTable = false;

        for (const timeColumn of CANDIDATE_TIME_COLUMNS) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .gte(timeColumn, startIso)
                .lt(timeColumn, endIso)
                .order(timeColumn, { ascending: true });

            if (!error) {
                const baseRows = (data as DbRow[] | null) ?? [];
                const displayRows = await withResolvedVenueAndTeams(baseRows);

                return displayRows
                    .map((row, index) => mapTodayMatch(row, index))
                    .filter((row): row is TodayMatch => row !== null);
            }

            const normalizedError = asQueryError(error);
            firstError ??= error;

            if (isMissingColumnError(normalizedError)) {
                continue;
            }

            if (isMissingTableError(normalizedError) || isPermissionError(normalizedError)) {
                shouldTryNextTable = true;
                break;
            }

            throw error;
        }

        if (!shouldTryNextTable) {
            break;
        }
    }

    if (firstError) throw firstError;
    throw new Error('Unable to query matches for the selected date.');
}

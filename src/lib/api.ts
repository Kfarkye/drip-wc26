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
    awayTeam: string;
    commenceTime: string;
    venue: string;
    sportKey: string;
    leagueKey: string;
    sportLabel: string;
    leagueLabel: string;
}

type DbRow = Record<string, unknown>;

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
    const venue = readFirstString(row, ['venue_name', 'venue', 'stadium']) ?? 'Venue TBA';
    const id = readFirstString(row, ['id', 'match_id', 'event_id']) ?? `${commenceTime}-${homeTeam}-${awayTeam}-${index}`;
    const { sportKey, leagueKey, sportLabel, leagueLabel } = deriveSportLeague(row);

    return {
        id,
        homeTeam,
        awayTeam,
        commenceTime,
        venue,
        sportKey,
        leagueKey,
        sportLabel,
        leagueLabel,
    };
};

export async function getMatchesForUtcDate(dateUtc: string): Promise<TodayMatch[]> {
    const startIso = `${dateUtc}T00:00:00.000Z`;
    const endIso = `${nextUtcDate(dateUtc)}T00:00:00.000Z`;

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('commence_time', startIso)
        .lt('commence_time', endIso)
        .order('commence_time', { ascending: true });

    if (error) throw error;

    return ((data as DbRow[] | null) ?? [])
        .map((row, index) => mapTodayMatch(row, index))
        .filter((row): row is TodayMatch => row !== null);
}

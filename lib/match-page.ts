import { ALL_MATCHES, getMatchBySlug, type MatchSeed } from '../src/data/all-matches';
import { createServerSupabaseClient } from './supabase/server';

const SITE_URL = 'https://thedrip.to';

type MatchRow = Record<string, unknown>;

const PHASE_LABELS: Record<MatchSeed['phase'], string> = {
    group: 'Group Stage',
    'round-of-32': 'Round of 32',
    'round-of-16': 'Round of 16',
    quarterfinal: 'Quarterfinal',
    semifinal: 'Semifinal',
    'third-place': 'Third-Place Playoff',
    final: 'Final',
};

export interface MatchPageData {
    slug: string;
    url: string;
    homeTeam: string;
    awayTeam: string;
    kickoff: string;
    kickoffLabel: string;
    venue: string;
    venueLine: string;
    phaseLabel: string;
    competitionLabel: string;
    title: string;
    description: string;
    homeOdds: string;
    awayOdds: string;
    drawOdds: string;
    hasLiveOdds: boolean;
    source: 'database' | 'schedule';
    updatedAt: string | null;
    seed: MatchSeed | null;
}

export interface SitemapEntry {
    slug: string;
    lastModified: Date;
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

function formatToken(value: string): string {
    return value
        .split('-')
        .filter(Boolean)
        .map((part) => {
            if (part.length <= 3) return part.toUpperCase();
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(' ');
}

function fallbackTeamsFromSlug(slug: string): { homeTeam: string; awayTeam: string } {
    const cleanSlug = slug.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) {
        return {
            awayTeam: 'TBD',
            homeTeam: formatToken(cleanSlug),
        };
    }

    return {
        awayTeam: formatToken(parts[0]),
        homeTeam: formatToken(parts[1]),
    };
}

function formatOddsValue(value: string | null): string {
    if (!value) return '-';
    return value;
}

function formatKickoff(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return 'Kickoff TBD';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
    }).format(parsed);
}

async function fetchMatchRow(slug: string): Promise<MatchRow | null> {
    const supabase = createServerSupabaseClient();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) return null;
        return data as MatchRow;
    } catch {
        return null;
    }
}

export async function getMatchPageData(slug: string): Promise<MatchPageData | null> {
    const seed = getMatchBySlug(slug) ?? null;
    const row = await fetchMatchRow(slug);

    if (!seed && !row) return null;

    const fallbackTeams = fallbackTeamsFromSlug(slug);
    const homeTeam = readFirstString(row, ['home_team', 'home_team_name']) ?? seed?.homeTeam ?? fallbackTeams.homeTeam;
    const awayTeam = readFirstString(row, ['away_team', 'away_team_name']) ?? seed?.awayTeam ?? fallbackTeams.awayTeam;
    const kickoff = readFirstString(row, ['start_time', 'kickoff', 'commence_time']) ?? seed?.kickoff ?? new Date().toISOString();
    const venue = readFirstString(row, ['venue_name', 'venue', 'stadium']) ?? seed?.venue ?? 'Venue TBD';
    const venueCity = readFirstString(row, ['venue_city', 'city']) ?? seed?.venueCity ?? '';
    const phaseLabel = seed ? PHASE_LABELS[seed.phase] : 'Matchday';
    const competitionLabel = seed?.group
        ? `World Cup 2026 • Group ${seed.group}`
        : `World Cup 2026 • ${phaseLabel}`;
    const venueLine = venueCity ? `${venue} • ${venueCity}` : venue;
    const title = `${homeTeam} vs ${awayTeam} Odds & Predictions | ${competitionLabel}`;
    const description = `Live odds, kickoff intel, and betting context for ${homeTeam} vs ${awayTeam} at ${venueLine}.`;

    return {
        slug,
        url: `${SITE_URL}/match/${slug}`,
        homeTeam,
        awayTeam,
        kickoff,
        kickoffLabel: formatKickoff(kickoff),
        venue,
        venueLine,
        phaseLabel,
        competitionLabel,
        title,
        description,
        homeOdds: formatOddsValue(readFirstString(row, ['home_odds'])),
        awayOdds: formatOddsValue(readFirstString(row, ['away_odds'])),
        drawOdds: formatOddsValue(readFirstString(row, ['draw_odds'])),
        hasLiveOdds: !!row,
        source: row ? 'database' : 'schedule',
        updatedAt: readFirstString(row, ['updated_at', 'last_updated_at']),
        seed,
    };
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
    const staticEntries = ALL_MATCHES.map((match) => ({
        slug: match.slug,
        lastModified: new Date(match.kickoff),
    }));

    const supabase = createServerSupabaseClient();
    if (!supabase) return staticEntries;

    try {
        const { data, error } = await supabase
            .from('matches')
            .select('slug, updated_at, start_time')
            .not('slug', 'is', null)
            .limit(20_000);

        if (error || !data) return staticEntries;

        const entries = new Map<string, SitemapEntry>();
        for (const entry of staticEntries) {
            entries.set(entry.slug, entry);
        }

        for (const row of data as MatchRow[]) {
            const slug = readFirstString(row, ['slug']);
            if (!slug) continue;

            const lastModifiedRaw =
                readFirstString(row, ['updated_at'])
                ?? readFirstString(row, ['start_time'])
                ?? new Date().toISOString();

            entries.set(slug, {
                slug,
                lastModified: new Date(lastModifiedRaw),
            });
        }

        return Array.from(entries.values()).sort((a, b) => a.slug.localeCompare(b.slug));
    } catch {
        return staticEntries;
    }
}

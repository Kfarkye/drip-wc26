import { notFound } from 'next/navigation';
import { ALL_MATCHES, type MatchSeed } from '../src/data/all-matches';
import { allGroups, type GroupInfo, type MatchInfo } from '../src/data/groups';

type MatchStatus = 'scheduled' | 'live' | 'finished';

interface LocatedMatch {
    seed: MatchSeed;
    match: MatchInfo;
    group: GroupInfo;
}

interface SimulatedScore {
    away: number;
    home: number;
}

interface StatRow {
    key: string;
    label: string;
    away: number;
    home: number;
    decimals: number;
    isPercent?: boolean;
}

interface TimelineEvent {
    id: string;
    minute: string;
    text: string;
    type: 'goal' | 'card' | 'sub' | 'info';
    key: boolean;
}

interface StandingRow {
    code: string;
    name: string;
    played: number;
    diff: number;
    pts: number;
}

export interface EdgePageData {
    slug: string;
    title: string;
    description: string;
    canonicalUrl: string;
    groupLetter: string;
    awayTeam: string;
    awayCode: string;
    homeTeam: string;
    homeCode: string;
    kickoff: string;
    kickoffLabel: string;
    venueLine: string;
    status: MatchStatus;
    statusLabel: string;
    eventLabel: string;
    score: SimulatedScore;
    edgeTeam: string;
    edgeSize: number;
    confidence: string;
    xgGap: number;
    shotGap: number;
    possession: StatRow;
    xg: StatRow;
    shots: StatRow;
    stats: StatRow[];
    timeline: TimelineEvent[];
    keyTimeline: TimelineEvent[];
    standings: StandingRow[];
    relatedMatches: MatchSeed[];
}

const EDGE_PAGE_COUNT = 44;
const SITE_URL = 'https://thedrip.to';

export function getEdgeStaticMatches(): MatchSeed[] {
    return ALL_MATCHES
        .filter((seed) => seed.phase === 'group')
        .sort((a, b) => a.matchNumber - b.matchNumber)
        .slice(0, EDGE_PAGE_COUNT);
}

function createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function getMatchStatus(kickoff: string): MatchStatus {
    const kickoffMs = new Date(kickoff).getTime();
    const nowMs = Date.now();
    if (nowMs < kickoffMs - 5 * 60 * 1000) return 'scheduled';
    if (nowMs <= kickoffMs + 2 * 60 * 60 * 1000) return 'live';
    return 'finished';
}

function statusLabel(status: MatchStatus): string {
    if (status === 'scheduled') return 'Not started';
    if (status === 'live') return 'Live';
    return 'Finished';
}

function kickoffChip(kickoff: string): string {
    return new Date(kickoff)
        .toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
        })
        .replace(',', ' •');
}

function hoursToKickoff(kickoff: string): number {
    const diff = new Date(kickoff).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
}

function simulateScore(seed: number, status: MatchStatus): SimulatedScore {
    if (status === 'scheduled') return { away: 0, home: 0 };
    const rand = createSeededRandom(seed + 11);
    return {
        away: Math.floor(rand() * 4),
        home: Math.floor(rand() * 4),
    };
}

function buildBaseStats(seed: number): StatRow[] {
    const rand = createSeededRandom(seed + 31);
    const awayPoss = Math.round(39 + rand() * 22);
    const homePoss = 100 - awayPoss;

    const awayXg = Number((0.55 + rand() * 2.2).toFixed(2));
    const homeXg = Number((0.55 + rand() * 2.2).toFixed(2));

    const awayShots = Math.max(4, Math.round(awayXg * 4 + rand() * 5));
    const homeShots = Math.max(4, Math.round(homeXg * 4 + rand() * 5));

    const awayBig = Math.max(0, Math.round(awayXg * 1.4 + rand() * 2));
    const homeBig = Math.max(0, Math.round(homeXg * 1.4 + rand() * 2));

    const awayCorners = Math.max(1, Math.round((awayShots / 2) + rand() * 2));
    const homeCorners = Math.max(1, Math.round((homeShots / 2) + rand() * 2));

    const awayFouls = 7 + Math.round(rand() * 7);
    const homeFouls = 7 + Math.round(rand() * 7);

    const awayPasses = Math.round((awayPoss * 9) + rand() * 90);
    const homePasses = Math.round((homePoss * 9) + rand() * 90);

    const awayTackles = 7 + Math.round(rand() * 12);
    const homeTackles = 7 + Math.round(rand() * 12);

    const awaySaves = Math.max(1, Math.round(homeShots * 0.25 + rand() * 2));
    const homeSaves = Math.max(1, Math.round(awayShots * 0.25 + rand() * 2));

    const awayFree = awayFouls - 1 + Math.round(rand() * 2);
    const homeFree = homeFouls - 1 + Math.round(rand() * 2);

    return [
        { key: 'possession', label: 'Ball possession', away: awayPoss, home: homePoss, decimals: 0, isPercent: true },
        { key: 'xg', label: 'Expected goals (xG)', away: awayXg, home: homeXg, decimals: 2 },
        { key: 'big', label: 'Big chances', away: awayBig, home: homeBig, decimals: 0 },
        { key: 'shots', label: 'Total shots', away: awayShots, home: homeShots, decimals: 0 },
        { key: 'saves', label: 'Goalkeeper saves', away: awaySaves, home: homeSaves, decimals: 0 },
        { key: 'corners', label: 'Corner kicks', away: awayCorners, home: homeCorners, decimals: 0 },
        { key: 'fouls', label: 'Fouls', away: awayFouls, home: homeFouls, decimals: 0 },
        { key: 'passes', label: 'Passes', away: awayPasses, home: homePasses, decimals: 0 },
        { key: 'tackles', label: 'Tackles', away: awayTackles, home: homeTackles, decimals: 0 },
        { key: 'free', label: 'Free kicks', away: awayFree, home: homeFree, decimals: 0 },
    ];
}

function findStat(stats: StatRow[], key: string): StatRow {
    return stats.find((row) => row.key === key) ?? { key, label: key, away: 0, home: 0, decimals: 0 };
}

export function formatStatValue(row: StatRow, value: number): string {
    const formatted = row.decimals > 0 ? value.toFixed(row.decimals) : String(Math.round(value));
    return row.isPercent ? `${formatted}%` : formatted;
}

export function statShares(row: StatRow): { away: number; home: number } {
    const total = row.away + row.home;
    if (total <= 0) return { away: 50, home: 50 };
    return {
        away: (row.away / total) * 100,
        home: (row.home / total) * 100,
    };
}

function buildTimelineEvents(match: MatchInfo, status: MatchStatus, score: SimulatedScore, seed: number): TimelineEvent[] {
    const rand = createSeededRandom(seed + 89);

    if (status === 'scheduled') {
        return [
            {
                id: 'pre-1',
                minute: 'T-90',
                text: `Projected lineups for ${match.homeTeam.name} and ${match.awayTeam.name} publish 90 minutes before kickoff.`,
                type: 'info',
                key: true,
            },
            {
                id: 'pre-2',
                minute: 'T-60',
                text: 'Warmups begin and the AI pressure model refresh is expected.',
                type: 'info',
                key: false,
            },
            {
                id: 'pre-3',
                minute: 'T-15',
                text: 'Final pace projection window opens with lineup-confirmed priors.',
                type: 'info',
                key: true,
            },
        ];
    }

    const awayLead = score.away > score.home;
    const winner = awayLead ? match.awayTeam.name : match.homeTeam.name;
    const goalMinute = 58 + Math.round(rand() * 28);

    return [
        {
            id: 'ft',
            minute: 'FT',
            text: `Match ends, ${match.awayTeam.name} ${score.away} - ${score.home} ${match.homeTeam.name}.`,
            type: 'info',
            key: true,
        },
        {
            id: 'goal',
            minute: `${goalMinute}'`,
            text: `${winner} produce the decisive attacking sequence and convert.`,
            type: 'goal',
            key: true,
        },
        {
            id: 'sub-home',
            minute: `${goalMinute - 3}'`,
            text: `${match.homeTeam.name} make an attacking substitution to change the tempo.`,
            type: 'sub',
            key: false,
        },
        {
            id: 'card-away',
            minute: `${goalMinute - 12}'`,
            text: `${match.awayTeam.name} pick up a yellow card in transition defense.`,
            type: 'card',
            key: true,
        },
    ];
}

function standingProjection(group: GroupInfo, seed: number): StandingRow[] {
    const rand = createSeededRandom(seed + 277);
    const rows = group.teams.map((team, idx) => {
        const pts = 2 + Math.round(rand() * 8) + (idx % 2 === 0 ? 1 : 0);
        const diff = -1 + Math.round(rand() * 8);
        return {
            code: team.code,
            name: team.name,
            played: 3,
            diff,
            pts,
        };
    });

    rows.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        return b.diff - a.diff;
    });

    return rows;
}

function findLocatedMatch(slug: string): LocatedMatch | null {
    const seed = getEdgeStaticMatches().find((item) => item.slug === slug);
    if (!seed || !seed.group) return null;

    const group = allGroups[seed.group];
    if (!group) return null;

    const match = group.matches.find((item) => item.matchNumber === seed.matchNumber);
    if (!match) return null;

    return { seed, match, group };
}

export function getEdgePageData(slug: string): EdgePageData {
    const located = findLocatedMatch(slug);
    if (!located) notFound();

    const seedValue = (located.match.matchNumber * 97)
        + located.match.homeTeam.code.charCodeAt(0)
        + located.match.awayTeam.code.charCodeAt(0);

    const status = getMatchStatus(located.match.kickoff);
    const score = simulateScore(seedValue, status);
    const stats = buildBaseStats(seedValue);
    const xg = findStat(stats, 'xg');
    const shots = findStat(stats, 'shots');
    const possession = findStat(stats, 'possession');
    const timeline = buildTimelineEvents(located.match, status, score, seedValue);
    const standings = standingProjection(located.group, seedValue);

    const xgGap = xg.home - xg.away;
    const shotGap = shots.home - shots.away;
    const edgeTeam = xgGap >= 0 ? located.match.homeTeam.name : located.match.awayTeam.name;
    const edgeSize = Math.round((Math.abs(xgGap) * 7) + (Math.abs(shotGap) * 0.6));
    const confidence = edgeSize >= 12 ? 'High' : edgeSize >= 7 ? 'Medium' : 'Watch';

    const eventLabel = status === 'scheduled'
        ? `Kickoff in ${hoursToKickoff(located.match.kickoff)}h`
        : `${edgeTeam} pressure sequence highlighted by AI`;

    const title = `${located.match.awayTeam.name} vs ${located.match.homeTeam.name} AI Betting Edge`;
    const description = `${located.match.awayTeam.name} vs ${located.match.homeTeam.name} match intelligence for Group ${located.group.letter}, including simulated pressure stats, edge signals, and group context.`;

    return {
        slug,
        title,
        description,
        canonicalUrl: `${SITE_URL}/edges/${slug}`,
        groupLetter: located.group.letter,
        awayTeam: located.match.awayTeam.name,
        awayCode: located.match.awayTeam.code,
        homeTeam: located.match.homeTeam.name,
        homeCode: located.match.homeTeam.code,
        kickoff: located.match.kickoff,
        kickoffLabel: kickoffChip(located.match.kickoff),
        venueLine: `${located.match.venue.name} • ${located.match.venue.city}`,
        status,
        statusLabel: statusLabel(status),
        eventLabel,
        score,
        edgeTeam,
        edgeSize,
        confidence,
        xgGap,
        shotGap,
        possession,
        xg,
        shots,
        stats,
        timeline,
        keyTimeline: timeline.filter((event) => event.key),
        standings,
        relatedMatches: ALL_MATCHES
            .filter((item) => item.group === located.group.letter)
            .sort((a, b) => a.kickoff.localeCompare(b.kickoff)),
    };
}

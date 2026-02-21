/**
 * All 104 FIFA World Cup 2026 match seeds.
 * 72 group stage + 16 R32 + 8 R16 + 4 QF + 2 SF + 1 third-place + 1 final
 *
 * Group stage matches derive from groups.ts.
 * Knockout matches use placeholder teams (winner/runner-up references).
 */

import { groups, type MatchInfo } from './groups';

export interface MatchSeed {
    id: number;
    slug: string;
    phase: 'group' | 'round-of-32' | 'round-of-16' | 'quarterfinal' | 'semifinal' | 'third-place' | 'final';
    group?: string;
    matchNumber: number;
    homeTeam: string;
    homeCode: string;
    awayTeam: string;
    awayCode: string;
    venue: string;
    venueCity: string;
    kickoff: string;
}

function slugify(input: string): string {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function dateFromKickoff(kickoff: string): string {
    return kickoff.slice(0, 10);
}

function makeGroupMatch(m: MatchInfo, group: string): MatchSeed {
    const date = dateFromKickoff(m.kickoff);
    return {
        id: m.matchNumber,
        slug: `${slugify(m.awayTeam.code)}-vs-${slugify(m.homeTeam.code)}-${date}`,
        phase: 'group',
        group,
        matchNumber: m.matchNumber,
        homeTeam: m.homeTeam.name,
        homeCode: m.homeTeam.code,
        awayTeam: m.awayTeam.name,
        awayCode: m.awayTeam.code,
        venue: m.venue.name,
        venueCity: m.venue.city,
        kickoff: m.kickoff,
    };
}

// ═══ GROUP STAGE (72 matches) ═══
const groupStageMatches: MatchSeed[] = groups.flatMap(g =>
    g.matches.map(m => makeGroupMatch(m, g.letter))
);

// ═══ KNOCKOUT STAGE (32 matches) ═══
// Teams TBD until group stage completes. Using positional references.

const knockoutMatches: MatchSeed[] = [
    // Round of 32 (16 matches) — June 28 - July 3
    { id: 73, slug: 'r32-match-1-2026-06-28', phase: 'round-of-32', matchNumber: 73, homeTeam: '1A', homeCode: '1A', awayTeam: '3C/D/E', awayCode: '3CDE', venue: 'AT&T Stadium', venueCity: 'Arlington', kickoff: '2026-06-28T13:00:00-04:00' },
    { id: 74, slug: 'r32-match-2-2026-06-28', phase: 'round-of-32', matchNumber: 74, homeTeam: '2C', homeCode: '2C', awayTeam: '2D', awayCode: '2D', venue: 'MetLife Stadium', venueCity: 'East Rutherford', kickoff: '2026-06-28T16:00:00-04:00' },
    { id: 75, slug: 'r32-match-3-2026-06-28', phase: 'round-of-32', matchNumber: 75, homeTeam: '1B', homeCode: '1B', awayTeam: '3A/B/F', awayCode: '3ABF', venue: 'Gillette Stadium', venueCity: 'Foxborough', kickoff: '2026-06-28T19:00:00-04:00' },
    { id: 76, slug: 'r32-match-4-2026-06-29', phase: 'round-of-32', matchNumber: 76, homeTeam: '1C', homeCode: '1C', awayTeam: '3A/D/F', awayCode: '3ADF', venue: 'Hard Rock Stadium', venueCity: 'Miami Gardens', kickoff: '2026-06-29T13:00:00-04:00' },
    { id: 77, slug: 'r32-match-5-2026-06-29', phase: 'round-of-32', matchNumber: 77, homeTeam: '2A', homeCode: '2A', awayTeam: '2B', awayCode: '2B', venue: 'NRG Stadium', venueCity: 'Houston', kickoff: '2026-06-29T16:00:00-04:00' },
    { id: 78, slug: 'r32-match-6-2026-06-29', phase: 'round-of-32', matchNumber: 78, homeTeam: '1D', homeCode: '1D', awayTeam: '3B/E/F', awayCode: '3BEF', venue: 'SoFi Stadium', venueCity: 'Inglewood', kickoff: '2026-06-29T19:00:00-04:00' },
    { id: 79, slug: 'r32-match-7-2026-06-30', phase: 'round-of-32', matchNumber: 79, homeTeam: '1E', homeCode: '1E', awayTeam: '3A/B/C', awayCode: '3ABC', venue: 'Lincoln Financial Field', venueCity: 'Philadelphia', kickoff: '2026-06-30T13:00:00-04:00' },
    { id: 80, slug: 'r32-match-8-2026-06-30', phase: 'round-of-32', matchNumber: 80, homeTeam: '2G', homeCode: '2G', awayTeam: '2H', awayCode: '2H', venue: 'GEHA Field at Arrowhead Stadium', venueCity: 'Kansas City', kickoff: '2026-06-30T16:00:00-04:00' },
    { id: 81, slug: 'r32-match-9-2026-06-30', phase: 'round-of-32', matchNumber: 81, homeTeam: '1F', homeCode: '1F', awayTeam: '3C/D/E', awayCode: '3CDE2', venue: "Levi's Stadium", venueCity: 'Santa Clara', kickoff: '2026-06-30T19:00:00-04:00' },
    { id: 82, slug: 'r32-match-10-2026-07-01', phase: 'round-of-32', matchNumber: 82, homeTeam: '2E', homeCode: '2E', awayTeam: '2F', awayCode: '2F', venue: 'AT&T Stadium', venueCity: 'Arlington', kickoff: '2026-07-01T13:00:00-04:00' },
    { id: 83, slug: 'r32-match-11-2026-07-01', phase: 'round-of-32', matchNumber: 83, homeTeam: '1G', homeCode: '1G', awayTeam: '3I/J/K', awayCode: '3IJK', venue: 'Lumen Field', venueCity: 'Seattle', kickoff: '2026-07-01T16:00:00-04:00' },
    { id: 84, slug: 'r32-match-12-2026-07-01', phase: 'round-of-32', matchNumber: 84, homeTeam: '1H', homeCode: '1H', awayTeam: '3G/H/L', awayCode: '3GHL', venue: 'Mercedes-Benz Stadium', venueCity: 'Atlanta', kickoff: '2026-07-01T19:00:00-04:00' },
    { id: 85, slug: 'r32-match-13-2026-07-02', phase: 'round-of-32', matchNumber: 85, homeTeam: '2I', homeCode: '2I', awayTeam: '2J', awayCode: '2J', venue: 'MetLife Stadium', venueCity: 'East Rutherford', kickoff: '2026-07-02T13:00:00-04:00' },
    { id: 86, slug: 'r32-match-14-2026-07-02', phase: 'round-of-32', matchNumber: 86, homeTeam: '1I', homeCode: '1I', awayTeam: '3G/H/I', awayCode: '3GHI', venue: 'Hard Rock Stadium', venueCity: 'Miami Gardens', kickoff: '2026-07-02T16:00:00-04:00' },
    { id: 87, slug: 'r32-match-15-2026-07-03', phase: 'round-of-32', matchNumber: 87, homeTeam: '1J', homeCode: '1J', awayTeam: '3I/K/L', awayCode: '3IKL', venue: 'NRG Stadium', venueCity: 'Houston', kickoff: '2026-07-03T13:00:00-04:00' },
    { id: 88, slug: 'r32-match-16-2026-07-03', phase: 'round-of-32', matchNumber: 88, homeTeam: '1K', homeCode: '1K', awayTeam: '3J/K/L', awayCode: '3JKL', venue: 'SoFi Stadium', venueCity: 'Inglewood', kickoff: '2026-07-03T16:00:00-04:00' },

    // Round of 16 (8 matches) — July 4-7
    { id: 89, slug: 'r16-match-1-2026-07-04', phase: 'round-of-16', matchNumber: 89, homeTeam: 'W73', homeCode: 'W73', awayTeam: 'W74', awayCode: 'W74', venue: 'AT&T Stadium', venueCity: 'Arlington', kickoff: '2026-07-04T13:00:00-04:00' },
    { id: 90, slug: 'r16-match-2-2026-07-04', phase: 'round-of-16', matchNumber: 90, homeTeam: 'W75', homeCode: 'W75', awayTeam: 'W76', awayCode: 'W76', venue: 'MetLife Stadium', venueCity: 'East Rutherford', kickoff: '2026-07-04T16:00:00-04:00' },
    { id: 91, slug: 'r16-match-3-2026-07-05', phase: 'round-of-16', matchNumber: 91, homeTeam: 'W77', homeCode: 'W77', awayTeam: 'W78', awayCode: 'W78', venue: 'SoFi Stadium', venueCity: 'Inglewood', kickoff: '2026-07-05T13:00:00-04:00' },
    { id: 92, slug: 'r16-match-4-2026-07-05', phase: 'round-of-16', matchNumber: 92, homeTeam: 'W79', homeCode: 'W79', awayTeam: 'W80', awayCode: 'W80', venue: 'Hard Rock Stadium', venueCity: 'Miami Gardens', kickoff: '2026-07-05T16:00:00-04:00' },
    { id: 93, slug: 'r16-match-5-2026-07-06', phase: 'round-of-16', matchNumber: 93, homeTeam: 'W81', homeCode: 'W81', awayTeam: 'W82', awayCode: 'W82', venue: 'NRG Stadium', venueCity: 'Houston', kickoff: '2026-07-06T13:00:00-04:00' },
    { id: 94, slug: 'r16-match-6-2026-07-06', phase: 'round-of-16', matchNumber: 94, homeTeam: 'W83', homeCode: 'W83', awayTeam: 'W84', awayCode: 'W84', venue: 'Gillette Stadium', venueCity: 'Foxborough', kickoff: '2026-07-06T16:00:00-04:00' },
    { id: 95, slug: 'r16-match-7-2026-07-07', phase: 'round-of-16', matchNumber: 95, homeTeam: 'W85', homeCode: 'W85', awayTeam: 'W86', awayCode: 'W86', venue: 'Mercedes-Benz Stadium', venueCity: 'Atlanta', kickoff: '2026-07-07T13:00:00-04:00' },
    { id: 96, slug: 'r16-match-8-2026-07-07', phase: 'round-of-16', matchNumber: 96, homeTeam: 'W87', homeCode: 'W87', awayTeam: 'W88', awayCode: 'W88', venue: 'Lincoln Financial Field', venueCity: 'Philadelphia', kickoff: '2026-07-07T16:00:00-04:00' },

    // Quarterfinals (4 matches) — July 9-11
    { id: 97, slug: 'qf-1-2026-07-09', phase: 'quarterfinal', matchNumber: 97, homeTeam: 'W89', homeCode: 'W89', awayTeam: 'W90', awayCode: 'W90', venue: 'SoFi Stadium', venueCity: 'Inglewood', kickoff: '2026-07-09T15:00:00-04:00' },
    { id: 98, slug: 'qf-2-2026-07-10', phase: 'quarterfinal', matchNumber: 98, homeTeam: 'W91', homeCode: 'W91', awayTeam: 'W92', awayCode: 'W92', venue: 'AT&T Stadium', venueCity: 'Arlington', kickoff: '2026-07-10T15:00:00-04:00' },
    { id: 99, slug: 'qf-3-2026-07-10', phase: 'quarterfinal', matchNumber: 99, homeTeam: 'W93', homeCode: 'W93', awayTeam: 'W94', awayCode: 'W94', venue: 'NRG Stadium', venueCity: 'Houston', kickoff: '2026-07-10T19:00:00-04:00' },
    { id: 100, slug: 'qf-4-2026-07-11', phase: 'quarterfinal', matchNumber: 100, homeTeam: 'W95', homeCode: 'W95', awayTeam: 'W96', awayCode: 'W96', venue: 'Hard Rock Stadium', venueCity: 'Miami Gardens', kickoff: '2026-07-11T15:00:00-04:00' },

    // Semifinals (2 matches) — July 14-15
    { id: 101, slug: 'sf-1-2026-07-14', phase: 'semifinal', matchNumber: 101, homeTeam: 'W97', homeCode: 'W97', awayTeam: 'W98', awayCode: 'W98', venue: 'AT&T Stadium', venueCity: 'Arlington', kickoff: '2026-07-14T15:00:00-04:00' },
    { id: 102, slug: 'sf-2-2026-07-15', phase: 'semifinal', matchNumber: 102, homeTeam: 'W99', homeCode: 'W99', awayTeam: 'W100', awayCode: 'W100', venue: 'MetLife Stadium', venueCity: 'East Rutherford', kickoff: '2026-07-15T15:00:00-04:00' },

    // Third-place match — July 18
    { id: 103, slug: 'third-place-2026-07-18', phase: 'third-place', matchNumber: 103, homeTeam: 'L101', homeCode: 'L101', awayTeam: 'L102', awayCode: 'L102', venue: 'Hard Rock Stadium', venueCity: 'Miami Gardens', kickoff: '2026-07-18T15:00:00-04:00' },

    // Final — July 19
    { id: 104, slug: 'final-2026-07-19', phase: 'final', matchNumber: 104, homeTeam: 'W101', homeCode: 'W101', awayTeam: 'W102', awayCode: 'W102', venue: 'MetLife Stadium', venueCity: 'East Rutherford', kickoff: '2026-07-19T15:00:00-04:00' },
];

/** All 104 World Cup 2026 matches */
export const ALL_MATCHES: MatchSeed[] = [
    ...groupStageMatches,
    ...knockoutMatches,
].sort((a, b) => a.id - b.id);

/** Get matches for a specific group */
export function getGroupMatches(letter: string): MatchSeed[] {
    return ALL_MATCHES.filter(m => m.group === letter);
}

/** Get matches for a specific phase */
export function getPhaseMatches(phase: MatchSeed['phase']): MatchSeed[] {
    return ALL_MATCHES.filter(m => m.phase === phase);
}

/** Get a single match by slug */
export function getMatchBySlug(slug: string): MatchSeed | undefined {
    return ALL_MATCHES.find(m => m.slug === slug);
}

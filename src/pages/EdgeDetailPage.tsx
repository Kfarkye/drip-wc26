import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MatchShell, type MatchShellTab } from '../components/match/MatchShell';
import { allGroups, type GroupInfo, type MatchInfo } from '../data/groups';

type MatchStatus = 'scheduled' | 'live' | 'finished';
type TabKey = 'details' | 'ai' | 'lineups' | 'statistics' | 'play' | 'standings';
type StatsPeriod = 'all' | '1st' | '2nd';
type EventFilter = 'all' | 'key';

interface LocatedMatch {
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

const MATCH_TABS: MatchShellTab[] = [
    { key: 'details', label: 'Details' },
    { key: 'ai', label: 'AI Insights' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'statistics', label: 'Statistics' },
    { key: 'play', label: 'Play-by-play' },
    { key: 'standings', label: 'Standings' },
];

function findMatchBySlug(slug: string): LocatedMatch | null {
    const parts = slug.match(/^([a-z0-9]+)-vs-([a-z0-9]+)-(\d{4}-\d{2}-\d{2})$/);
    if (!parts) return null;

    const [, awayCode, homeCode, dateStr] = parts;

    for (const group of Object.values(allGroups)) {
        for (const match of group.matches) {
            const hCode = match.homeTeam.code.toLowerCase();
            const aCode = match.awayTeam.code.toLowerCase();
            const matchDate = match.kickoff.split('T')[0];

            if (
                ((hCode === homeCode && aCode === awayCode) ||
                    (hCode === awayCode && aCode === homeCode)) &&
                matchDate === dateStr
            ) {
                return { match, group: group as GroupInfo };
            }
        }
    }

    return null;
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

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
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

function applyStatsPeriod(stats: StatRow[], period: StatsPeriod, seed: number): StatRow[] {
    if (period === 'all') return stats;

    return stats.map((row, idx) => {
        if (row.key === 'possession') {
            const swing = ((seed + idx * 5 + (period === '1st' ? 3 : 8)) % 9) - 4;
            const away = clamp(Math.round(row.away + swing), 30, 70);
            return { ...row, away, home: 100 - away };
        }

        const ratioBase = period === '1st' ? 0.47 : 0.53;
        const wobble = (((seed + idx * 11) % 7) - 3) * 0.01;
        const ratio = clamp(ratioBase + wobble, 0.35, 0.65);
        return {
            ...row,
            away: Number((row.away * ratio).toFixed(row.decimals)),
            home: Number((row.home * ratio).toFixed(row.decimals)),
        };
    });
}

function findStat(stats: StatRow[], key: string): StatRow {
    return stats.find((row) => row.key === key) ?? { key, label: key, away: 0, home: 0, decimals: 0 };
}

function formatStatValue(row: StatRow, value: number): string {
    const formatted = row.decimals > 0 ? value.toFixed(row.decimals) : String(Math.round(value));
    return row.isPercent ? `${formatted}%` : formatted;
}

function statShares(row: StatRow): { away: number; home: number } {
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
                text: 'Warmups begin and AI pressure model refresh is expected.',
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

function standingProjection(group: GroupInfo, seed: number) {
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

export const EdgeDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    if (!slug) return null;

    const matchResult = findMatchBySlug(slug);
    const [activeTab, setActiveTab] = useState<TabKey>('details');
    const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('all');
    const [eventFilter, setEventFilter] = useState<EventFilter>('all');

    const displayTitle = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/ Vs /, ' vs ')
        .replace(/\d{4} \d{2} \d{2}$/, '')
        .trim();

    if (!matchResult) {
        return (
            <div className="min-h-screen bg-[#f4f4f5] px-5 py-16">
                <div className="max-w-[760px] mx-auto">
                    <div className="rounded-2xl border border-[#d4d4d8] bg-white p-8">
                        <h1 className="text-2xl mb-3" style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}>
                            {displayTitle}
                        </h1>
                        <p className="text-sm mb-4" style={{ color: '#71717a' }}>
                            Match shell is ready, but this slug is not yet mapped to a group stage fixture.
                        </p>
                        <Link to="/" className="inline-flex items-center gap-1 text-sm" style={{ fontWeight: 700, color: '#18181b' }}>
                            ← Back to hub
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const seed = (matchResult.match.matchNumber * 97)
        + matchResult.match.homeTeam.code.charCodeAt(0)
        + matchResult.match.awayTeam.code.charCodeAt(0);

    const status = getMatchStatus(matchResult.match.kickoff);
    const simulated = simulateScore(seed, status);
    const statsAll = useMemo(() => buildBaseStats(seed), [seed]);
    const statsVisible = useMemo(() => applyStatsPeriod(statsAll, statsPeriod, seed), [statsAll, statsPeriod, seed]);
    const timeline = useMemo(() => buildTimelineEvents(matchResult.match, status, simulated, seed), [matchResult.match, status, simulated, seed]);
    const timelineVisible = useMemo(() => (eventFilter === 'key' ? timeline.filter((event) => event.key) : timeline), [eventFilter, timeline]);
    const standings = useMemo(() => standingProjection(matchResult.group, seed), [matchResult.group, seed]);

    const xg = findStat(statsAll, 'xg');
    const shots = findStat(statsAll, 'shots');
    const possession = findStat(statsAll, 'possession');

    const xgGap = xg.home - xg.away;
    const shotGap = shots.home - shots.away;
    const edgeTeam = xgGap >= 0 ? matchResult.match.homeTeam.name : matchResult.match.awayTeam.name;
    const edgeSize = Math.round((Math.abs(xgGap) * 7) + (Math.abs(shotGap) * 0.6));
    const confidence = edgeSize >= 12 ? 'High' : edgeSize >= 7 ? 'Medium' : 'Watch';

    const eventText = status === 'scheduled'
        ? `Kickoff in ${hoursToKickoff(matchResult.match.kickoff)}h`
        : `${edgeTeam} pressure sequence highlighted by AI`;

    const periodButtons: Array<{ id: StatsPeriod; label: string }> = [
        { id: 'all', label: 'ALL' },
        { id: '1st', label: '1ST' },
        { id: '2nd', label: '2ND' },
    ];

    return (
        <MatchShell
            backHref={`/group/${matchResult.group.letter.toLowerCase()}`}
            backLabel={`Group ${matchResult.group.letter}`}
            awayTeam={matchResult.match.awayTeam.name}
            awayCode={matchResult.match.awayTeam.code}
            homeTeam={matchResult.match.homeTeam.name}
            homeCode={matchResult.match.homeTeam.code}
            kickoffLabel={kickoffChip(matchResult.match.kickoff)}
            awayScoreLabel={status === 'scheduled' ? '-' : String(simulated.away)}
            homeScoreLabel={status === 'scheduled' ? '-' : String(simulated.home)}
            statusLabel={statusLabel(status)}
            eventLabel={eventText}
            tabs={MATCH_TABS}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as TabKey)}
        >
            {activeTab === 'details' ? (
                <div className="space-y-4 animate-in">
                    <section className="rounded-[18px] border border-[#d4d4d8] bg-[#f5f5f5] p-4">
                        <h2 className="text-[16px] mb-3" style={{ fontWeight: 800, color: '#18181b' }}>
                            Match overview
                        </h2>
                        {[findStat(statsAll, 'possession'), findStat(statsAll, 'xg'), findStat(statsAll, 'shots')].map((row) => {
                            const shares = statShares(row);
                            return (
                                <div key={row.key} className="mb-4 last:mb-0">
                                    <div className="flex items-center justify-between text-[17px]">
                                        <span style={{ fontWeight: 700 }}>{formatStatValue(row, row.away)}</span>
                                        <span style={{ color: '#3f3f46', fontWeight: 700 }}>{row.label}</span>
                                        <span style={{ fontWeight: 700 }}>{formatStatValue(row, row.home)}</span>
                                    </div>
                                    <div className="mt-2 h-2.5 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
                                        <div className="h-full flex">
                                            <div style={{ width: `${shares.away}%`, background: '#22c55e' }} />
                                            <div style={{ width: `${shares.home}%`, background: '#3b82f6' }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    <section className="rounded-[18px] border border-[#d4d4d8] bg-[#f5f5f5] p-4">
                        <h2 className="text-[16px] mb-3" style={{ fontWeight: 800, color: '#18181b' }}>
                            Quick actions
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="rounded-full border px-4 py-2 text-left" style={{ borderColor: '#d4d4d8', background: '#ffffff', fontWeight: 700 }}>Discuss</button>
                            <button type="button" className="rounded-full border px-4 py-2 text-left" style={{ borderColor: '#d4d4d8', background: '#ffffff', fontWeight: 700 }}>Alerts</button>
                        </div>
                    </section>
                </div>
            ) : null}

            {activeTab === 'ai' ? (
                <div className="space-y-4 animate-in">
                    <section className="rounded-[18px] border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                        <p className="text-[11px] uppercase tracking-[0.08em]" style={{ fontWeight: 800, color: '#166534' }}>Live Edge Signal</p>
                        <h2 className="text-[24px] mt-1" style={{ fontWeight: 800, color: '#14532d' }}>{edgeTeam} edge: {edgeSize}%</h2>
                        <p className="text-sm mt-2" style={{ color: '#166534' }}>
                            Confidence {confidence}. xG gap {xgGap >= 0 ? '+' : ''}{xgGap.toFixed(2)} and shot gap {shotGap >= 0 ? '+' : ''}{shotGap} support the active pressure profile.
                        </p>
                    </section>

                    <section className="rounded-[18px] border border-[#d4d4d8] bg-white p-4">
                        <h3 className="text-[15px] mb-2" style={{ fontWeight: 800 }}>AI read</h3>
                        <p className="text-sm" style={{ color: '#3f3f46' }}>
                            Possession split is {Math.round(possession.home)}% {matchResult.match.homeTeam.name} to {Math.round(possession.away)}% {matchResult.match.awayTeam.name}. The model expects transition volume to rise in the final 25 minutes.
                        </p>
                    </section>
                </div>
            ) : null}

            {activeTab === 'lineups' ? (
                <div className="space-y-4 animate-in">
                    <section className="rounded-[18px] border border-[#d4d4d8] bg-white p-4">
                        <h2 className="text-[16px] mb-3" style={{ fontWeight: 800 }}>Lineups</h2>
                        <p className="text-sm mb-4" style={{ color: '#71717a' }}>
                            Confirmed lineups publish near kickoff. Structure stays stable so users can scan instantly when feeds land.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[matchResult.match.awayTeam, matchResult.match.homeTeam].map((team) => (
                                <div key={team.code} className="rounded-[14px] border border-[#e4e4e7] bg-[#fafafa] p-3">
                                    <h3 className="text-[15px] mb-2" style={{ fontWeight: 800 }}>{team.name} · 4-2-3-1</h3>
                                    {['GK', 'RB', 'CB', 'CB', 'LB', 'DM', 'DM', 'RW', 'AM', 'LW', 'ST'].map((slot, idx) => (
                                        <div key={`${team.code}-${slot}-${idx}`} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0" style={{ borderColor: '#ededed' }}>
                                            <span style={{ color: '#52525b' }}>{slot}</span>
                                            <span style={{ fontWeight: 600, color: '#27272a' }}>{team.code} {idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : null}

            {activeTab === 'statistics' ? (
                <div className="space-y-4 animate-in">
                    <div className="rounded-[18px] border border-[#d4d4d8] bg-[#eef0f4] p-2 flex items-center gap-2">
                        {periodButtons.map((period) => (
                            <button
                                key={period.id}
                                type="button"
                                onClick={() => setStatsPeriod(period.id)}
                                className="rounded-full px-4 py-2 text-[13px] min-w-[74px]"
                                style={{
                                    background: statsPeriod === period.id ? '#18181b' : '#e4e4e7',
                                    color: statsPeriod === period.id ? '#fafafa' : '#27272a',
                                    fontWeight: 800,
                                }}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>

                    <section className="rounded-[18px] border border-[#d4d4d8] bg-[#f5f5f5] p-4">
                        <h2 className="text-[16px] mb-4" style={{ fontWeight: 800 }}>Match overview</h2>
                        {statsVisible.map((row) => {
                            const shares = statShares(row);
                            return (
                                <div key={row.key} className="mb-5 last:mb-0">
                                    <div className="flex items-center justify-between text-[18px] mb-1">
                                        <span style={{ fontWeight: 700 }}>{formatStatValue(row, row.away)}</span>
                                        <span style={{ color: '#3f3f46', fontWeight: 700 }}>{row.label}</span>
                                        <span style={{ fontWeight: 700 }}>{formatStatValue(row, row.home)}</span>
                                    </div>
                                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e5e7eb' }}>
                                        <div className="h-full flex">
                                            <div style={{ width: `${shares.away}%`, background: '#22c55e' }} />
                                            <div style={{ width: `${shares.home}%`, background: '#3b82f6' }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </div>
            ) : null}

            {activeTab === 'play' ? (
                <div className="space-y-4 animate-in">
                    <div className="rounded-[18px] border border-[#d4d4d8] bg-[#eef0f4] p-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setEventFilter('all')}
                            className="rounded-full px-4 py-2 text-[13px]"
                            style={{ background: eventFilter === 'all' ? '#18181b' : '#e4e4e7', color: eventFilter === 'all' ? '#fafafa' : '#27272a', fontWeight: 800 }}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setEventFilter('key')}
                            className="rounded-full px-4 py-2 text-[13px]"
                            style={{ background: eventFilter === 'key' ? '#18181b' : '#e4e4e7', color: eventFilter === 'key' ? '#fafafa' : '#27272a', fontWeight: 800 }}
                        >
                            Key events
                        </button>
                    </div>

                    <section className="space-y-3">
                        {timelineVisible.map((event) => (
                            <article key={event.id} className="rounded-[16px] border border-[#d4d4d8] bg-white p-4 flex gap-3 items-start">
                                <div className="text-[18px] min-w-[54px]" style={{ fontWeight: 800, color: '#71717a' }}>{event.minute}</div>
                                <div className="flex-1">
                                    <p className="text-[18px] leading-snug" style={{ color: '#1f2937' }}>{event.text}</p>
                                    <p className="text-[12px] mt-1 uppercase tracking-[0.06em]" style={{ color: '#71717a', fontWeight: 700 }}>{event.type}</p>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            ) : null}

            {activeTab === 'standings' ? (
                <div className="space-y-4 animate-in">
                    <section className="rounded-[18px] border border-[#d4d4d8] bg-white p-4 overflow-x-auto">
                        <h2 className="text-[16px] mb-1" style={{ fontWeight: 800 }}>Group {matchResult.group.letter} standings</h2>
                        <p className="text-[12px] mb-3" style={{ color: '#71717a' }}>Model projection layer until official table feed sync.</p>
                        <table className="w-full min-w-[520px]">
                            <thead>
                                <tr className="text-left text-[12px] uppercase" style={{ color: '#71717a', fontWeight: 800 }}>
                                    <th className="py-2 pr-3">#</th>
                                    <th className="py-2 pr-3">Team</th>
                                    <th className="py-2 pr-3 text-right">P</th>
                                    <th className="py-2 pr-3 text-right">Diff</th>
                                    <th className="py-2 text-right">PTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row, idx) => (
                                    <tr key={row.code} className="border-t" style={{ borderColor: '#ececec' }}>
                                        <td className="py-3 pr-3 text-[16px]" style={{ fontWeight: 700 }}>{idx + 1}</td>
                                        <td className="py-3 pr-3 text-[16px]" style={{ fontWeight: 700 }}>{row.name}</td>
                                        <td className="py-3 pr-3 text-right text-[16px]" style={{ color: '#3f3f46' }}>{row.played}</td>
                                        <td className="py-3 pr-3 text-right text-[16px]" style={{ color: '#3f3f46' }}>{row.diff >= 0 ? `+${row.diff}` : row.diff}</td>
                                        <td className="py-3 text-right text-[18px]" style={{ fontWeight: 800 }}>{row.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            ) : null}
        </MatchShell>
    );
};

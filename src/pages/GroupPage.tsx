import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { GroupHeader } from '../components/GroupHeader';
import { EdgeCard } from '../components/EdgeCard';
import { MatchRow } from '../components/MatchRow';
import { SchemaScript } from '../components/SchemaScript';
import { generateGroupSchema } from '../lib/schema';
import { allGroups } from '../data/groups';
import { getFlagUrl } from '../lib/flags';
import { getStaticTeamOdds, useGroupEdges, useGroupOdds } from '../hooks/useLiveData';

/* ── Group metadata for editorial treatments ── */
const GROUP_META: Record<string, {
    badge?: string;
    badgeType?: 'host' | 'death';
    analysis: string;
    edges?: Array<{
        market: string;
        sbName: string;
        sbOdds: string;
        pmName: string;
        pmPrice: string;
        edge: number;
        confidence: 'high' | 'medium' | 'low';
        volume: number;
        link: string;
    }>;
}> = {
    A: {
        badge: 'Host Nation', badgeType: 'host',
        analysis: 'Mexico\'s high-altitude advantage at the Azteca is the strongest of any host, heavily favoring progression. The South Korea matchup in Monterrey is the group\'s swing fixture.',
    },
    B: {
        badge: 'Host Nation', badgeType: 'host',
        analysis: 'If Italy wins their playoff bracket to enter this group, the math drastically changes against the Canadian hosts. Switzerland profiles as the most reliable group-stage nation in recent tournament history.',
    },
    C: {
        badge: 'Group of Death', badgeType: 'death',
        analysis: 'Brazil vs Morocco at MetLife Stadium (Jun 13) is the undisputed heavyweight fixture of the group stage. Morocco\'s 2022 semifinal run proved their defensive structure is real.',
    },
    D: {
        badge: 'Host Nation', badgeType: 'host',
        analysis: 'Highly favorable draw for the USMNT. Pochettino avoids elite European squads while playing securely on home soil. The opening match against Paraguay at SoFi sets the tournament tone.',
        edges: [
            { market: 'USA to Win Group D', sbName: 'DraftKings', sbOdds: '+125', pmName: 'Kalshi', pmPrice: '45¢', edge: 0.6, confidence: 'low', volume: 124000, link: '/edges/usa-to-win-group-d' },
            { market: 'Paraguay to Win Group D', sbName: 'DraftKings', sbOdds: '+800', pmName: 'Kalshi', pmPrice: '10¢', edge: 1.1, confidence: 'low', volume: 12000, link: '/edges/paraguay-to-win-group-d' },
            { market: 'Australia to Win Group D', sbName: 'DraftKings', sbOdds: '+600', pmName: 'Kalshi', pmPrice: '14¢', edge: 2.4, confidence: 'low', volume: 8500, link: '/edges/australia-to-win-group-d' },
        ],
    },
    E: {
        analysis: 'Germany desperately seeks redemption after back-to-back group stage exits in 2018 and 2022. Curaçao makes a historic World Cup debut as the smallest nation (pop. 150K) in the field.',
    },
    F: {
        badge: 'Dangerous', badgeType: 'death',
        analysis: 'Japan stunned both Germany and Spain in 2022 groups, making this an extremely uncomfortable draw for the Netherlands. The UEFA Playoff B winner could add Austria or Ukraine to the mix.',
    },
    G: {
        analysis: 'Belgium\'s golden generation core is running on fumes, making this one of the most wide-open groups. Egypt\'s Salah is likely playing his final World Cup.',
    },
    H: {
        analysis: 'Spain holds 18.5% of the total betting handle. Lamine Yamal will be 18 years old during the tournament. Uruguay brings legitimate knockout-stage pedigree with Núñez and Valverde.',
    },
    I: {
        badge: 'Group of Death', badgeType: 'death',
        analysis: 'Mbappé vs. Haaland. This generational collision — France vs Norway — is projected to be the most-watched match of the group stage. Senegal adds genuine dark-horse quality.',
    },
    J: {
        analysis: 'Messi turns 39 during the tournament. If he plays, every Argentina match is the hottest ticket on the continent. Austria showed strong form at Euro 2024.',
    },
    K: {
        badge: 'Dangerous', badgeType: 'death',
        analysis: 'Aside from Ronaldo\'s swan song, Colombia represents legitimate, battle-tested knockout-stage quality after their 2024 Copa América final run.',
    },
    L: {
        badge: 'Group of Death', badgeType: 'death',
        analysis: 'England vs Croatia in Dallas acts as a brutal opening act. Croatia reached the 2018 final and 2022 semifinal. The consensus Group of Death.',
    },
};

/* ── Outright winner odds per team (for the group table) ── */
const TEAM_ODDS: Record<string, { odds: string; implied: string; pct: number; isLongshot?: boolean }> = {
    MEX: { odds: '+6600', implied: '1.5%', pct: 10 },
    KOR: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    RSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    SUI: { odds: '+10000', implied: '1.0%', pct: 7 },
    CAN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    QAT: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    BRA: { odds: '+750', implied: '10.5%', pct: 70 },
    MAR: { odds: '+5000', implied: '2.0%', pct: 13 },
    SCO: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    HAI: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    USA: { odds: '+2500', implied: '3.8%', pct: 25 },
    PAR: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    AUS: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    GER: { odds: '+1000', implied: '7.1%', pct: 47 },
    CIV: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    ECU: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    CUW: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    NED: { odds: '+1400', implied: '5.3%', pct: 35 },
    JPN: { odds: '+8000', implied: '1.2%', pct: 8 },
    TUN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    BEL: { odds: '+3000', implied: '2.5%', pct: 17 },
    EGY: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    IRN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    NZL: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    ESP: { odds: '+450', implied: '15.0%', pct: 100 },
    URU: { odds: '+4000', implied: '2.4%', pct: 16 },
    KSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    CPV: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    FRA: { odds: '+750', implied: '10.5%', pct: 70 },
    NOR: { odds: '+10000', implied: '1.0%', pct: 7 },
    SEN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    ARG: { odds: '+800', implied: '12.3%', pct: 82 },
    AUT: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    ALG: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    JOR: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    POR: { odds: '+1200', implied: '6.3%', pct: 42 },
    COL: { odds: '+5000', implied: '2.0%', pct: 13 },
    UZB: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    ENG: { odds: '+550', implied: '13.2%', pct: 88 },
    CRO: { odds: '+5000', implied: '2.0%', pct: 13 },
    GHA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    PAN: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
};

export const GroupPage: React.FC = () => {
    const { letter } = useParams<{ letter: string }>();
    const upperLetter = letter?.toUpperCase() ?? '';
    const group = allGroups[upperLetter];

    if (!group) return <Navigate to="/" replace />;

    const meta = GROUP_META[upperLetter] || { analysis: '' };

    // Live edges from DB — falls back to static edges in GROUP_META
    const { data: liveEdgeResult } = useGroupEdges(upperLetter);
    const liveEdges = liveEdgeResult?.data ?? [];
    const hasLiveEdges = liveEdgeResult?.isLive && liveEdges.length > 0;

    // Live team odds from DB — falls back to static TEAM_ODDS
    const { data: liveOdds } = useGroupOdds(upperLetter);
    const getOdds = (code: string) => {
        const live = liveOdds?.[code];
        if (live?.isLive) return live;
        const fallback = TEAM_ODDS[code];
        return fallback ? { ...fallback, isLive: false, isLongshot: fallback.isLongshot ?? false } : null;
    };

    // Merge: live edges take priority, static edges as fallback
    const displayEdges = hasLiveEdges
        ? liveEdges.map(e => ({
            market: e.market,
            sbName: e.sbName,
            sbOdds: e.sbOdds,
            pmName: e.pmName,
            pmPrice: e.pmPrice,
            edge: e.edge,
            confidence: e.confidence,
            volume: e.volume,
            link: e.link,
        }))
        : (meta.edges || []);

    const faqs = [
        {
            question: `Who will win World Cup 2026 Group ${upperLetter}?`,
            answer: `${group.teams[0].name} is the group favorite based on current sportsbook odds. See the odds table above for full probabilities across all four teams.`,
        },
        {
            question: `Where is World Cup 2026 Group ${upperLetter} being played?`,
            answer: group.matches.length > 0
                ? `Group ${upperLetter} matches are hosted at ${[...new Set(group.matches.map(m => `${m.venue.name}, ${m.venue.city}`))].join('; ')}.`
                : `Venue information will be confirmed closer to the tournament.`,
        },
    ];

    const groupSchema = generateGroupSchema(group, faqs);

    // Adjacent group nav
    const letters = 'ABCDEFGHIJKL'.split('');
    const currentIdx = letters.indexOf(upperLetter);
    const prevLetter = currentIdx > 0 ? letters[currentIdx - 1] : null;
    const nextLetter = currentIdx < letters.length - 1 ? letters[currentIdx + 1] : null;

    return (
        <Layout>
            <SchemaScript schema={groupSchema} />

            <div className="px-5 pt-12 pb-20">
                <div className="max-w-[660px] mx-auto">

                    {/* Breadcrumb */}
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="text-[13px] hover:underline inline-flex items-center gap-1"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-500)' }}
                        >
                            ← Markets Hub
                        </Link>
                    </div>

                    <GroupHeader
                        groupLetter={upperLetter}
                        teams={group.teams}
                        badge={meta.badge}
                        badgeType={meta.badgeType}
                    />

                    {/* ═══ Analysis ═══ */}
                    <section className="mb-14 prose-editorial">
                        <p>{meta.analysis}</p>
                    </section>

                    {/* ═══ Edge Cards (if available) ═══ */}
                    {displayEdges.length > 0 && (
                        <section className="mb-14">
                            <div
                                className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                                style={{ borderColor: 'var(--gray-900)' }}
                            >
                                <h3
                                    className="text-xl uppercase tracking-[-0.02em]"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                                >
                                    Edge Detection
                                </h3>
                                <span
                                    className="text-[13px] uppercase"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: hasLiveEdges ? 'var(--brand-red)' : 'var(--gray-500)' }}
                                >
                                    {hasLiveEdges ? 'Live' : 'Book vs Market'}
                                </span>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                                {displayEdges.map((edge) => (
                                    <EdgeCard
                                        key={edge.market}
                                        marketName={edge.market}
                                        sportsbookName={edge.sbName}
                                        sportsbookOdds={edge.sbOdds}
                                        sportsbookLink="https://www.draftkings.com"
                                        predictionName={edge.pmName}
                                        predictionPrice={edge.pmPrice}
                                        predictionLink="https://www.kalshi.com"
                                        edgePercentage={edge.edge}
                                        confidence={edge.confidence}
                                        volume={edge.volume}
                                        link={edge.link}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══ Outright Odds Table ═══ */}
                    <section className="mb-14">
                        <div
                            className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                            style={{ borderColor: 'var(--gray-900)' }}
                        >
                            <h3
                                className="text-xl uppercase tracking-[-0.02em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                            >
                                Outright Winner Odds
                            </h3>
                            <span
                                className="text-[13px] uppercase"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                            >
                                Tournament
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="sports-table" style={{ minWidth: '440px' }}>
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th className="text-right">Odds</th>
                                        <th className="text-right">Implied Win Prob</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.teams.map((team, i) => {
                                        const odds = getOdds(team.code);
                                        const flagUrl = getFlagUrl(team.code);
                                        const isTop = i === 0;

                                        return (
                                            <tr key={team.code} className={isTop ? 'top-seed' : ''}>
                                                <td>
                                                    <div className="flex items-center gap-3" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        {flagUrl ? (
                                                            <img
                                                                src={flagUrl}
                                                                alt={team.name}
                                                                className="w-6 h-4 object-cover"
                                                                style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-6 h-4 flex items-center justify-center text-[8px]"
                                                                style={{ background: 'var(--gray-100)', border: '1px dashed var(--gray-300)', color: 'var(--gray-500)' }}
                                                            >
                                                                ?
                                                            </div>
                                                        )}
                                                        <span style={{ fontWeight: isTop ? 800 : 600 }}>{team.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    {odds ? (
                                                        <span
                                                            className="text-lg"
                                                            style={{
                                                                fontFamily: 'var(--font-data)',
                                                                fontWeight: isTop ? 800 : 600,
                                                                fontVariantNumeric: 'tabular-nums',
                                                                color: isTop ? 'var(--brand-red)' : 'var(--gray-900)',
                                                            }}
                                                        >
                                                            {odds.odds}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--gray-500)' }}>TBD</span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    {odds ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span
                                                                className="text-base w-14 text-right"
                                                                style={{
                                                                    fontFamily: 'var(--font-data)',
                                                                    fontWeight: 600,
                                                                    fontVariantNumeric: 'tabular-nums',
                                                                    color: odds.isLongshot ? 'var(--gray-500)' : 'var(--gray-800)',
                                                                }}
                                                            >
                                                                {odds.implied}
                                                            </span>
                                                            {odds.pct > 0 && (
                                                                <div className="w-[90px] h-1.5 flex-shrink-0" style={{ background: 'var(--gray-200)' }}>
                                                                    <div
                                                                        className="h-full"
                                                                        style={{
                                                                            width: `${odds.pct}%`,
                                                                            background: isTop ? 'var(--gray-900)' : 'var(--gray-800)',
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--gray-500)' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ═══ Match Schedule ═══ */}
                    <section className="mb-14">
                        <div
                            className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                            style={{ borderColor: 'var(--gray-900)' }}
                        >
                            <h3
                                className="text-xl uppercase tracking-[-0.02em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                            >
                                Match Schedule
                            </h3>
                            <span
                                className="text-[13px] uppercase"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                            >
                                {group.matches.length} Matches
                            </span>
                        </div>

                        <div>
                            {group.matches.map((match, i) => (
                                <MatchRow
                                    key={i}
                                    homeTeam={match.homeTeam.name}
                                    homeCode={match.homeTeam.code}
                                    awayTeam={match.awayTeam.name}
                                    awayCode={match.awayTeam.code}
                                    kickoff={match.kickoff}
                                    venue={`${match.venue.name}, ${match.venue.city}`}
                                    matchNumber={match.matchNumber}
                                />
                            ))}
                        </div>
                    </section>

                    {/* ═══ FAQ ═══ */}
                    <section className="mb-14 pt-10 border-t" style={{ borderColor: 'var(--gray-300)' }}>
                        <div
                            className="text-sm uppercase tracking-[0.04em] mb-8"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                        >
                            Frequently Asked
                        </div>
                        <div className="space-y-8">
                            {faqs.map((faq, i) => (
                                <div key={i}>
                                    <h3
                                        className="text-sm mb-2 leading-snug"
                                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-900)' }}
                                    >
                                        {faq.question}
                                    </h3>
                                    <p
                                        className="text-[15px] leading-relaxed"
                                        style={{ fontFamily: 'var(--font-prose)', color: 'var(--gray-800)' }}
                                    >
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ═══ Prev / Next Group Nav ═══ */}
                    <nav
                        className="flex items-center justify-between pt-6 border-t"
                        style={{ borderColor: 'var(--gray-300)' }}
                    >
                        {prevLetter ? (
                            <Link
                                to={`/group/${prevLetter.toLowerCase()}`}
                                className="text-sm hover:underline"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-900)' }}
                            >
                                ← Group {prevLetter}
                            </Link>
                        ) : <span />}
                        <Link
                            to="/"
                            className="text-xs uppercase tracking-[0.04em] hover:underline"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                        >
                            All Groups
                        </Link>
                        {nextLetter ? (
                            <Link
                                to={`/group/${nextLetter.toLowerCase()}`}
                                className="text-sm hover:underline"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-900)' }}
                            >
                                Group {nextLetter} →
                            </Link>
                        ) : <span />}
                    </nav>

                </div>
            </div>
        </Layout>
    );
};

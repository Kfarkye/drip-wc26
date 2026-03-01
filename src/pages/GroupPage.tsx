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
import { useGroupEdges, useGroupOdds } from '../hooks/useLiveData';

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
        bookBreakdown?: Array<{
            name: string;
            price: string;
            type: 'sportsbook' | 'market';
            link?: string;
        }>;
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
            {
                market: 'USA to Win Group D',
                sbName: 'BetMGM',
                sbOdds: '+125',
                pmName: 'Polymarket',
                pmPrice: '45¢',
                bookBreakdown: [
                    { name: 'BetMGM', price: '+125', type: 'sportsbook', link: 'https://sports.betmgm.com' },
                    { name: 'FanDuel', price: '+130', type: 'sportsbook', link: 'https://www.fanduel.com' },
                    { name: 'Polymarket', price: '45¢', type: 'market', link: 'https://polymarket.com' },
                ],
                edge: 0.6,
                confidence: 'low',
                volume: 124000,
                link: '/edges/usa-to-win-group-d',
            },
            {
                market: 'Paraguay to Win Group D',
                sbName: 'BetMGM',
                sbOdds: '+775',
                pmName: 'Polymarket',
                pmPrice: '10¢',
                bookBreakdown: [
                    { name: 'BetMGM', price: '+775', type: 'sportsbook', link: 'https://sports.betmgm.com' },
                    { name: 'FanDuel', price: '+800', type: 'sportsbook', link: 'https://www.fanduel.com' },
                    { name: 'Polymarket', price: '10¢', type: 'market', link: 'https://polymarket.com' },
                ],
                edge: 1.1,
                confidence: 'low',
                volume: 12000,
                link: '/edges/paraguay-to-win-group-d',
            },
            {
                market: 'Australia to Win Group D',
                sbName: 'BetMGM',
                sbOdds: '+600',
                pmName: 'Polymarket',
                pmPrice: '14¢',
                bookBreakdown: [
                    { name: 'BetMGM', price: '+600', type: 'sportsbook', link: 'https://sports.betmgm.com' },
                    { name: 'FanDuel', price: '+650', type: 'sportsbook', link: 'https://www.fanduel.com' },
                    { name: 'Polymarket', price: '14¢', type: 'market', link: 'https://polymarket.com' },
                ],
                edge: 2.4,
                confidence: 'low',
                volume: 8500,
                link: '/edges/australia-to-win-group-d',
            },
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

type DeepDiveBlock = {
    standfirst: string;
    marketAngle: string;
    tacticalAngle: string;
    quote: string;
    watchlist: [string, string, string];
};

const GROUP_DEEP_DIVE: Record<string, DeepDiveBlock> = {
    A: {
        standfirst: 'Mexico owns altitude, but Group A still turns on one tactical hinge: who controls midfield tempo in Monterrey.',
        marketAngle: 'The market prices Mexico as the probable table-setter, yet the gap to second remains narrow enough that one early upset can reset qualification math before Matchday 2.',
        tacticalAngle: 'South Korea and South Africa both profile as transition-heavy sides; if Mexico slows matches into set-piece territory, Group A tilts toward favorite-first outcomes.',
        quote: 'In a four-team group, one broken game-state can rewrite the table in 90 minutes.',
        watchlist: [
            'Press resistance: can Mexico escape first-wave pressure without conceding transition shots?',
            'Set-piece volume: dead-ball chances should account for an outsized share of xG here.',
            'Third-match leverage: qualification incentives may diverge sharply by Matchday 3.'
        ],
    },
    B: {
        standfirst: 'Group B is less about star power and more about floor: the side that avoids a single low-probability collapse likely tops the group.',
        marketAngle: 'Pricing clusters tightly behind the front-runner, signaling a market that expects variance and values depth over headline upside.',
        tacticalAngle: 'Expect compact blocks, low shot quality, and thin margins decided by rest-defense rather than open-play creativity.',
        quote: 'Balanced groups are won by error minimization, not highlight reels.',
        watchlist: [
            'Defensive spacing when fullbacks push high in possession.',
            'Shot suppression from central zones in first halves.',
            'Late-game substitutions and fresh-leg counterattacks.'
        ],
    },
    C: {
        standfirst: 'Group C carries knockout-round quality from day one, and every early result distorts bracket expectations.',
        marketAngle: 'The favorite has weight, but market respect for the chaser remains meaningful, keeping group-winner pricing sensitive to one marquee matchup.',
        tacticalAngle: 'Possession control versus direct wide attacks is the defining clash profile; whichever side dictates field tilt wins territory and game state.',
        quote: 'This is a quarterfinal-level matchup disguised as group-stage scheduling.',
        watchlist: [
            'Wing isolation success against elite fullbacks.',
            'Counter-press recoveries in the first five seconds after turnovers.',
            'Set-piece conversion in high-leverage matches.'
        ],
    },
    D: {
        standfirst: 'Host leverage helps the U.S., but Group D remains a sequencing problem: opening points decide whether Matchday 3 is control or chaos.',
        marketAngle: 'Sportsbook and market pricing agree on hierarchy but disagree in pockets on ceiling, which is where edge opportunities still appear.',
        tacticalAngle: 'If the U.S. turns territorial dominance into early goals, they can rotate later; if not, transition defense becomes a recurring pressure point.',
        quote: 'The difference between calm qualification and late-table panic is often one first-match goal.',
        watchlist: [
            'U.S. chance creation from half-space entries versus low blocks.',
            'Paraguay efficiency on first-pass counters after regain.',
            'Matchday-3 incentive splits when qualification is partially settled.'
        ],
    },
    E: {
        standfirst: 'Group E is a credibility test for a giant and an opportunity set for everyone else.',
        marketAngle: 'Favorite pricing is strong, but tail outcomes remain alive enough that underdog derivatives can move materially after one result.',
        tacticalAngle: 'Germany should control possession volume; the question is whether final-third efficiency matches territorial dominance.',
        quote: 'When pressure rises, conversion rate matters more than possession share.',
        watchlist: [
            'Final-third shot quality versus packed central blocks.',
            'Turnover exposure when center-backs carry into midfield.',
            'Goalkeeper shot-stopping variance in one-goal games.'
        ],
    },
    F: {
        standfirst: 'Group F is classic upset terrain: structured favorite, dangerous spoiler, and a route to volatility.',
        marketAngle: 'Markets acknowledge top-end quality but price enough uncertainty to keep live re-pricing aggressive after every slate.',
        tacticalAngle: 'Japan-style pressing traps and vertical transitions can punish slow buildup teams that overcommit in phase one.',
        quote: 'Trap groups punish hesitation and reward tactical clarity.',
        watchlist: [
            'Press-break success rate in the middle third.',
            'Defensive line depth after loss of possession.',
            'Bench impact from minute 60 onward.'
        ],
    },
    G: {
        standfirst: 'Group G reads like a succession story: proven names versus teams peaking at the right cycle moment.',
        marketAngle: 'The board leans toward pedigree, but confidence intervals are wider than reputation suggests.',
        tacticalAngle: 'Compact defensive blocks and selective pressing should force low-event matches where one finishing sequence decides outcomes.',
        quote: 'In low-event groups, the first goal often becomes the whole script.',
        watchlist: [
            'Direct-ball effectiveness into second-ball recoveries.',
            'Cross volume versus central penetration tradeoffs.',
            'Discipline profile under high officiating pressure.'
        ],
    },
    H: {
        standfirst: 'Group H is where public-handle gravity collides with genuine knockout-caliber opposition.',
        marketAngle: 'Heavier money on the headline side can create asymmetric value if challengers stay within one result entering Matchday 3.',
        tacticalAngle: 'Midfield duel control and set-piece defense should be decisive against physically robust challengers.',
        quote: 'Handle tells you where attention is; structure tells you where risk lives.',
        watchlist: [
            'Ball progression under coordinated midfield pressure.',
            'Set-piece concession rates in defensive restarts.',
            'Fatigue indicators in high-minute core players.'
        ],
    },
    I: {
        standfirst: 'Group I is a ratings machine and a tactical stress test, with elite attacking talent on both sides of the bracket line.',
        marketAngle: 'Top-end prices are strong, but the market still leaves room for sharp intragroup swings after head-to-head outcomes.',
        tacticalAngle: 'Defensive line management against world-class runners will decide whether control teams can keep match tempo stable.',
        quote: 'Elite forwards don’t need many touches; they need one bad step from you.',
        watchlist: [
            'Recovery speed against vertical runs in transition.',
            'Chance quality conceded after set-piece second phases.',
            'Press-trigger timing against elite ball carriers.'
        ],
    },
    J: {
        standfirst: 'Group J blends legacy narratives with modern efficiency: emotional weight meets cold probability math.',
        marketAngle: 'Public sentiment can compress one side’s price, increasing value sensitivity on disciplined opposition outcomes.',
        tacticalAngle: 'Game management after scoring first should separate contenders from volatility candidates.',
        quote: 'In tournament football, composure is a statistical edge.',
        watchlist: [
            'Shot volume allowed after opening-goal states.',
            'Progressive passing chains into zone-14 entries.',
            'Set-piece expected-threat share by team.'
        ],
    },
    K: {
        standfirst: 'Group K has star gravity but enough mature challengers to punish any overconfident projection.',
        marketAngle: 'The favorite remains justified, yet market depth indicates credible resistance from teams with proven tournament floor.',
        tacticalAngle: 'Defensive compactness versus wide overloads should drive chance creation volume in key fixtures.',
        quote: 'Name recognition wins headlines; spacing wins matches.',
        watchlist: [
            'Wide-channel duel win rates and cutback prevention.',
            'Counter-control after attacking fullback overlaps.',
            'Bench shot creation from late tactical shifts.'
        ],
    },
    L: {
        standfirst: 'Group L is the most punishment-heavy path: experienced powers, physical contests, and little room for slow starts.',
        marketAngle: 'Consensus calls it the hardest group, and live prices should be the most reactive of any section after each slate.',
        tacticalAngle: 'Aerial control, duel win rate, and set-piece execution project as match-deciding levers more than pure possession share.',
        quote: 'In a true group of death, every point has knockout-round value.',
        watchlist: [
            'Box-entry prevention and second-ball clearances.',
            'Expected threat from corners and indirect free kicks.',
            'Card accumulation risk in high-contact fixtures.'
        ],
    },
};

const normalizeBookName = (name: string): string => name.toLowerCase().replace(/\s+/g, '');

const buildBookBreakdown = (
    sbName: string,
    sbOdds: string,
    pmPrice: string,
    preset?: Array<{ name: string; price: string; type: 'sportsbook' | 'market'; link?: string }>
) => {
    if (preset && preset.length > 0) return preset;

    const normalized = normalizeBookName(sbName);
    const betMgmPrice = normalized.includes('betmgm') ? sbOdds : '—';
    const fanDuelPrice = normalized.includes('fanduel') ? sbOdds : '—';

    return [
        { name: 'BetMGM', price: betMgmPrice, type: 'sportsbook' as const, link: 'https://sports.betmgm.com' },
        { name: 'FanDuel', price: fanDuelPrice, type: 'sportsbook' as const, link: 'https://www.fanduel.com' },
        { name: 'Polymarket', price: pmPrice, type: 'market' as const, link: 'https://polymarket.com' },
    ];
};

const parseImpliedPercent = (implied: string): number | null => {
    if (!implied || implied === '—') return null;
    const clean = implied.trim();
    if (clean.startsWith('<')) {
        const value = Number(clean.replace(/[<%]/g, ''));
        return Number.isFinite(value) ? value : null;
    }
    const value = Number(clean.replace('%', ''));
    return Number.isFinite(value) ? value : null;
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
            bookBreakdown: buildBookBreakdown(e.sbName, e.sbOdds, e.pmPrice),
            edge: e.edge,
            confidence: e.confidence,
            volume: e.volume,
            link: e.link,
        }))
        : (meta.edges || []);

    const deepDive = GROUP_DEEP_DIVE[upperLetter];

    const teamMarketView = group.teams
        .map((team) => {
            const odds = getOdds(team.code);
            const impliedPct = odds ? parseImpliedPercent(odds.implied) : null;
            return { team, odds, impliedPct };
        })
        .sort((a, b) => (b.impliedPct ?? -1) - (a.impliedPct ?? -1));

    const favoriteTeam = teamMarketView[0];
    const secondTeam = teamMarketView[1];
    const favoriteGap = (favoriteTeam?.impliedPct != null && secondTeam?.impliedPct != null)
        ? Math.max(favoriteTeam.impliedPct - secondTeam.impliedPct, 0)
        : null;

    const parityLabel =
        favoriteGap == null ? 'n/a' :
            favoriteGap < 4 ? 'wide-open' :
                favoriteGap < 10 ? 'competitive' : 'top-heavy';

    const kickoffTimes = group.matches
        .map((match) => new Date(match.kickoff).getTime())
        .filter((time) => Number.isFinite(time));

    const scheduleWindowDays = kickoffTimes.length > 1
        ? Math.round((Math.max(...kickoffTimes) - Math.min(...kickoffTimes)) / (1000 * 60 * 60 * 24))
        : 0;

    const venueCount = new Set(group.matches.map((m) => `${m.venue.name}|${m.venue.city}`)).size;
    const impliedLookup = new Map<string, number>(
        teamMarketView.map((entry): [string, number] => [entry.team.code, entry.impliedPct ?? 0])
    );

    const fixtureFocus = group.matches.reduce<{
        score: number;
        match: (typeof group.matches)[number] | null;
    }>((best, match) => {
        const score = (impliedLookup.get(match.homeTeam.code) ?? 0) + (impliedLookup.get(match.awayTeam.code) ?? 0);
        if (score > best.score) return { score, match };
        return best;
    }, { score: -1, match: null }).match;

    const faqs = [
        {
            question: `Who will win World Cup 2026 Group ${upperLetter}?`,
            answer: `${group.teams[0].name} is the group favorite based on current sportsbook and Polymarket pricing. See the odds table above for full probabilities across all four teams.`,
        },
        {
            question: `Where is World Cup 2026 Group ${upperLetter} being played?`,
            answer: group.matches.length > 0
                ? `Group ${upperLetter} matches are hosted at ${[...new Set(group.matches.map(m => `${m.venue.name}, ${m.venue.city}`))].join('; ')}.`
                : `Venue information will be confirmed closer to the tournament.`,
        },
        {
            question: `How should I read Group ${upperLetter} edge cards?`,
            answer: `Each card compares BetMGM, FanDuel, and Polymarket side by side. Use the directional marker to see whether sportsbook pricing or market pricing is currently more aggressive.`,
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

                    {/* ═══ Editorial Deep Dive ═══ */}
                    {deepDive && (
                        <section className="mb-14">
                            <div
                                className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                                style={{ borderColor: 'var(--gray-900)' }}
                            >
                                <h3
                                    className="text-xl uppercase tracking-[-0.02em]"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                                >
                                    How To Read This Group
                                </h3>
                                <span
                                    className="text-[13px] uppercase"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                                >
                                    Betting Context
                                </span>
                            </div>

                            <h2
                                className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em] leading-[1.12] mb-7"
                                style={{ fontFamily: 'var(--font-prose)', fontWeight: 700, color: 'var(--gray-900)' }}
                            >
                                {deepDive.standfirst}
                            </h2>

                            <div className="grid lg:grid-cols-[230px_1fr] gap-8 items-start">
                                <aside className="space-y-3">
                                    <div className="border p-3" style={{ borderColor: 'var(--gray-300)', background: 'var(--gray-50)' }}>
                                        <div
                                            className="text-[10px] uppercase tracking-[0.08em] mb-1"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                        >
                                            Favorite
                                        </div>
                                        <div
                                            className="text-base leading-tight"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-900)' }}
                                        >
                                            {favoriteTeam?.team.name ?? group.teams[0].name}
                                        </div>
                                        <div
                                            className="text-[12px]"
                                            style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--brand-red)' }}
                                        >
                                            {favoriteTeam?.odds?.implied ?? '—'} implied
                                        </div>
                                    </div>

                                    <div className="border p-3" style={{ borderColor: 'var(--gray-300)' }}>
                                        <div
                                            className="text-[10px] uppercase tracking-[0.08em] mb-1"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                        >
                                            Gap To No. 2
                                        </div>
                                        <div
                                            className="text-base"
                                            style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-900)' }}
                                        >
                                            {favoriteGap != null ? `${favoriteGap.toFixed(1)} pts` : 'n/a'}
                                        </div>
                                        <div
                                            className="text-[12px] uppercase"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                                        >
                                            {parityLabel}
                                        </div>
                                    </div>

                                    <div className="border p-3" style={{ borderColor: 'var(--gray-300)' }}>
                                        <div
                                            className="text-[10px] uppercase tracking-[0.08em] mb-1"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                        >
                                            Schedule Load
                                        </div>
                                        <div
                                            className="text-base"
                                            style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-900)' }}
                                        >
                                            {venueCount} venues
                                        </div>
                                        <div
                                            className="text-[12px] uppercase"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                                        >
                                            {scheduleWindowDays} day window
                                        </div>
                                    </div>
                                </aside>

                                <div>
                                    <div className="prose-editorial">
                                        <p>{deepDive.marketAngle}</p>
                                        <p>{deepDive.tacticalAngle}</p>
                                    </div>

                                    <blockquote
                                        className="my-8 py-6 pl-6 pr-3"
                                        style={{
                                            borderLeft: '5px solid var(--brand-red)',
                                            background: 'linear-gradient(90deg, var(--gray-50), transparent)',
                                        }}
                                    >
                                        <p
                                            className="!text-[24px] !leading-[1.35] !tracking-[-0.01em] !mb-0 italic"
                                            style={{ fontFamily: 'var(--font-prose)', fontWeight: 500, color: 'var(--gray-900)' }}
                                        >
                                            "{deepDive.quote}"
                                        </p>
                                    </blockquote>

                                    <div
                                        className="border p-4 mb-3"
                                        style={{ borderColor: 'var(--gray-300)', background: 'var(--gray-50)' }}
                                    >
                                        <div
                                            className="text-[10px] uppercase tracking-[0.08em] mb-2"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                        >
                                            Match To Watch
                                        </div>
                                        <div
                                            className="text-[17px] tracking-tight"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-900)' }}
                                        >
                                            {fixtureFocus ? `${fixtureFocus.homeTeam.name} vs ${fixtureFocus.awayTeam.name}` : 'TBD'}
                                        </div>
                                        {fixtureFocus && (
                                            <div
                                                className="text-[12px] uppercase"
                                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                                            >
                                                {new Date(fixtureFocus.kickoff).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {fixtureFocus.venue.city}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mt-7 stagger">
                                {deepDive.watchlist.map((note, index) => (
                                    <div
                                        key={note}
                                        className="border p-4"
                                        style={{ borderColor: 'var(--gray-300)' }}
                                    >
                                        <div
                                            className="text-[10px] uppercase tracking-[0.08em] mb-2"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                        >
                                            Angle {index + 1}
                                        </div>
                                        <p
                                            className="text-[15px] leading-relaxed m-0"
                                            style={{ fontFamily: 'var(--font-prose)', color: 'var(--gray-800)' }}
                                        >
                                            {note}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

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
                                    {hasLiveEdges ? 'Live Multi-book' : 'Book Breakdown'}
                                </span>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                                {displayEdges.map((edge) => (
                                    <EdgeCard
                                        key={edge.market}
                                        marketName={edge.market}
                                        sportsbookName={edge.sbName}
                                        sportsbookOdds={edge.sbOdds}
                                        sportsbookLink="https://sports.betmgm.com"
                                        predictionName={edge.pmName}
                                        predictionPrice={edge.pmPrice}
                                        predictionLink="https://polymarket.com"
                                        bookBreakdown={buildBookBreakdown(edge.sbName, edge.sbOdds, edge.pmPrice, edge.bookBreakdown)}
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

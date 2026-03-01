import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { allGroups } from '../data/groups';
import { getFlagUrl } from '../lib/flags';
import { useFavorites, useMarketDepth } from '../hooks/useLiveData';

/* ── Editorial data pulled from hooks with static fallback ── */

const GROUP_META: Record<string, { badge?: string; badgeType?: string; tagline: string }> = {
    A: { badge: 'Host Nation', badgeType: 'host', tagline: 'Mexico opener at Azteca' },
    B: { badge: 'Host Nation', badgeType: 'host', tagline: 'Canada · Italy playoff swing' },
    C: { badge: 'Group of Death', badgeType: 'death', tagline: 'Brazil vs Morocco marquee' },
    D: { badge: 'Host Nation', badgeType: 'host', tagline: 'USA home advantage' },
    E: { tagline: 'Germany redemption · Curaçao debut' },
    F: { badge: 'Dangerous', badgeType: 'death', tagline: 'Japan trap · Netherlands beware' },
    G: { tagline: 'Belgium fading · Egypt\'s Salah' },
    H: { tagline: 'Spain 18.5% of handle · Yamal turns 18' },
    I: { badge: 'Group of Death', badgeType: 'death', tagline: 'Mbappé vs Haaland' },
    J: { tagline: 'Messi\'s farewell · Defending champs' },
    K: { badge: 'Dangerous', badgeType: 'death', tagline: 'Ronaldo swan song · Colombia dark horse' },
    L: { badge: 'Group of Death', badgeType: 'death', tagline: 'England vs Croatia opener' },
};

const BRACKET_STEPS = [
    { num: '48', label: 'Group Stage' },
    { num: '32', label: 'Knockouts' },
    { num: '16', label: 'Round of 16' },
    { num: '8', label: 'Quarters' },
    { num: '4', label: 'Semis' },
    { num: '1', label: 'Champion', isFinal: true },
];

/* ── Components ── */

const Arrow: React.FC = () => (
    <div className="flex-shrink-0" style={{ color: 'var(--gray-300)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="square" />
        </svg>
    </div>
);

export const Home: React.FC = () => {
    const { data: favResult } = useFavorites();
    const { data: depthResult } = useMarketDepth();

    const FAVORITES = favResult?.data ?? [];
    const MARKET_DEPTH = depthResult?.data ?? [];
    const totalVolume = depthResult?.totalVolume ?? '$223.3M';
    const isLive = favResult?.isLive || depthResult?.isLive || false;

    return (
        <Layout>
            <div className="px-5 pt-12 pb-20">

                {/* ═══ ARTICLE HEADER ═══ */}
                <header className="max-w-[660px] mx-auto mb-14 animate-in">
                    <div
                        className="text-[13px] uppercase tracking-[0.05em] mb-4"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--brand-red)' }}
                    >
                        World Cup 2026 Prediction Markets
                    </div>

                    <h1
                        className="mb-5 leading-[1.08] tracking-[-0.02em]"
                        style={{
                            fontFamily: 'var(--font-prose)',
                            fontSize: 'clamp(36px, 6vw, 56px)',
                            fontWeight: 700,
                            color: 'var(--gray-900)',
                        }}
                    >
                        The Expanded Field: Odds and Probabilities for all 48 Teams
                    </h1>

                    <p
                        className="text-[22px] leading-[1.45] mb-8"
                        style={{ fontFamily: 'var(--font-prose)', fontWeight: 400, color: 'var(--gray-800)' }}
                    >
                        With the tournament expanding and the US betting market fully regulated,
                        oddsmakers are pricing the most complex World Cup group stage in history.
                    </p>

                    <div
                        className="flex flex-wrap items-center gap-3 py-4 border-t border-b uppercase tracking-[0.04em]"
                        style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--gray-500)',
                            borderColor: 'var(--gray-300)',
                        }}
                    >
                        <span>By <strong style={{ color: 'var(--gray-900)', fontWeight: 800 }}>The Data Desk</strong></span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span>February 28, 2026</span>
                        <span style={{ color: 'var(--gray-300)' }}>|</span>
                        <span>Vol: {totalVolume}{isLive ? ' · Live' : ''}</span>
                    </div>
                </header>

                {/* ═══ PROSE + MARKET DEPTH ═══ */}
                <div className="max-w-[660px] mx-auto prose-editorial mb-14">
                    <p className="dropcap">
                        The 2026 FIFA World Cup represents a seismic shift for international football.
                        For the first time since the jump to 32 teams in 1998, the field has expanded,
                        ballooning to 48 nations. This introduces a fundamentally new format—12 groups
                        of four—where pathing and bracket luck matter just as much as raw talent.
                    </p>

                    <p>
                        It also marks the first World Cup during the era of fully legalized, regulated
                        sports betting in the United States. Across global prediction markets like
                        Polymarket and regulated sportsbooks like DraftKings, over $223 million has
                        already been traded on outright winners before a single ball has been kicked.
                    </p>

                    {/* ── Market Depth Chart ── */}
                    <div className="my-14 py-8 border-t-2 border-b-2 border-[var(--gray-900)]">
                        <div className="flex justify-between items-baseline mb-7">
                            <div
                                className="text-xl uppercase tracking-[-0.02em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                            >
                                Market Handle Distribution
                            </div>
                            <div className="text-right">
                                <div
                                    className="text-base uppercase"
                                    style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--gray-500)' }}
                                >
                                    {totalVolume} Total
                                </div>
                                <a
                                    href="https://polymarket.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] uppercase tracking-[0.08em] hover:underline"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--brand-red)' }}
                                >
                                    Powered by Polymarket
                                </a>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {MARKET_DEPTH.map((row) => (
                                <div key={row.code} className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-[72px] flex-shrink-0">
                                        {getFlagUrl(row.code) && (
                                            <img
                                                src={getFlagUrl(row.code)!}
                                                alt={row.name}
                                                className="w-5 h-3.5 object-cover"
                                                style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                            />
                                        )}
                                        <span
                                            className="text-base"
                                            style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}
                                        >
                                            {row.code}
                                        </span>
                                    </div>
                                    <div
                                        className="flex-1 h-6 flex items-center"
                                        style={{ background: 'var(--gray-100)', borderLeft: '1px solid var(--gray-300)' }}
                                    >
                                        <div
                                            className="h-full flex items-center pl-2"
                                            style={{
                                                width: `${row.width}%`,
                                                background: row.isLeader ? 'var(--brand-red)' : 'var(--gray-800)',
                                            }}
                                        >
                                            <span
                                                className="text-white text-sm whitespace-nowrap"
                                                style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}
                                            >
                                                {row.amount}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="w-12 text-right flex-shrink-0 text-base"
                                        style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--gray-500)' }}
                                    >
                                        {row.pct}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p>
                        Because the top two teams from every group automatically advance—along with
                        the eight best third-place finishers—a staggering two-thirds of the field
                        will survive the group stage. This severely truncates the value of traditional
                        advancement props, forcing sharp money entirely toward group winner markets
                        and outright futures.
                    </p>

                    {/* ── Pull Quote ── */}
                    <blockquote
                        className="my-16 pl-8 mr-0 md:-mr-16 py-8"
                        style={{
                            borderLeft: '6px solid var(--brand-red)',
                            background: 'linear-gradient(90deg, var(--gray-50), transparent)',
                        }}
                    >
                        <p
                            className="!text-[28px] !leading-[1.35] !tracking-[-0.01em] !mb-0 italic"
                            style={{
                                fontFamily: 'var(--font-prose)',
                                fontWeight: 500,
                                color: 'var(--gray-900)',
                            }}
                        >
                            "With 67% of the field advancing, the value shifts entirely. The question
                            is no longer 'will they get out?' but rather 'how deep can they go?'"
                        </p>
                    </blockquote>
                </div>

                {/* ═══ BRACKET FUNNEL ═══ */}
                <div className="max-w-[1040px] mx-auto my-14">
                    <div
                        className="flex items-center justify-between overflow-x-auto gap-4 py-10 border-t border-b"
                        style={{ borderColor: 'var(--gray-300)' }}
                    >
                        {BRACKET_STEPS.map((step, i) => (
                            <React.Fragment key={step.label}>
                                {i > 0 && <Arrow />}
                                <div className="flex flex-col items-center text-center min-w-[80px]">
                                    <div
                                        className="text-5xl leading-none mb-2"
                                        style={{
                                            fontFamily: 'var(--font-data)',
                                            fontWeight: 800,
                                            color: step.isFinal ? 'var(--brand-red)' : 'var(--gray-900)',
                                        }}
                                    >
                                        {step.num}
                                    </div>
                                    <div
                                        className="text-[11px] uppercase tracking-[0.05em] leading-tight"
                                        style={{
                                            fontFamily: 'var(--font-ui)',
                                            fontWeight: 800,
                                            color: step.isFinal ? 'var(--gray-900)' : 'var(--gray-500)',
                                        }}
                                    >
                                        {step.label}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ═══ FAVORITES TABLE ═══ */}
                <div className="max-w-[660px] mx-auto mb-14">
                    <div
                        className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                        style={{ borderColor: 'var(--gray-900)' }}
                    >
                        <h3
                            className="text-2xl uppercase tracking-[-0.02em]"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                        >
                            Tournament Favorites
                        </h3>
                        <span
                            className="text-[13px] uppercase"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                        >
                            Outright Winner
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="sports-table" style={{ minWidth: '480px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>Rk</th>
                                    <th>Team</th>
                                    <th>Group</th>
                                    <th className="text-right">Odds</th>
                                    <th className="text-right">Implied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {FAVORITES.map((team, i) => (
                                    <tr key={team.code} className={i === 0 ? 'top-seed' : ''}>
                                        <td>{i === 0 ? '1' : i < 3 ? `${i + 1}` : i === 3 ? 'T4' : i === 4 ? 'T4' : '6'}</td>
                                        <td>
                                            <div className="flex items-start gap-3" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                {getFlagUrl(team.code) && (
                                                    <img
                                                        src={getFlagUrl(team.code)!}
                                                        alt={team.name}
                                                        className="w-6 h-4 object-cover mt-0.5"
                                                        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                                    />
                                                )}
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: i === 0 ? 800 : 600 }}>{team.name}</span>
                                                    <span
                                                        className="text-xs mt-0.5"
                                                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                                                    >
                                                        {team.desc}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                                Group {team.group}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <span
                                                className="text-lg"
                                                style={{
                                                    fontFamily: 'var(--font-data)',
                                                    fontWeight: i === 0 ? 800 : 600,
                                                    fontVariantNumeric: 'tabular-nums',
                                                    color: i === 0 ? 'var(--brand-red)' : 'var(--gray-900)',
                                                }}
                                            >
                                                {team.odds}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span
                                                    className="text-base w-11 text-right"
                                                    style={{
                                                        fontFamily: 'var(--font-data)',
                                                        fontWeight: 600,
                                                        fontVariantNumeric: 'tabular-nums',
                                                        color: 'var(--gray-800)',
                                                    }}
                                                >
                                                    {team.implied}
                                                </span>
                                                <div
                                                    className="w-[90px] h-1.5 flex-shrink-0"
                                                    style={{ background: 'var(--gray-200)' }}
                                                >
                                                    <div
                                                        className="h-full"
                                                        style={{
                                                            width: `${team.pct}%`,
                                                            background: i === 0 ? 'var(--brand-red)' : 'var(--gray-800)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ═══ PROSE TRANSITION ═══ */}
                <div className="max-w-[660px] mx-auto prose-editorial mb-4">
                    <h2
                        className="!text-[26px] !uppercase !tracking-[-0.02em] !pb-2 !mb-5 !mt-14 border-b-2"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, borderColor: 'var(--gray-900)' }}
                    >
                        Group-by-Group Breakdown
                    </h2>
                    <p>
                        FIFA's seeding mechanics ensure massive collisions are delayed. Spain and
                        Argentina are mathematically insulated from each other until the July 19th
                        final at MetLife Stadium. Below, outright tournament winner odds mapped to
                        all 12 groups.
                    </p>
                </div>

                {/* ═══ GROUP GRID ═══ */}
                <div className="max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 mb-14 stagger">
                    {Object.entries(allGroups).map(([letter, group]) => {
                        const meta = GROUP_META[letter] || { tagline: '' };
                        const isDeath = meta.badgeType === 'death';
                        const isHost = meta.badgeType === 'host';

                        return (
                            <Link
                                key={letter}
                                to={`/group/${letter.toLowerCase()}`}
                                className="block transition-shadow hover:shadow-lg"
                            >
                                <div
                                    className="border overflow-hidden"
                                    style={{
                                        borderColor: 'var(--gray-300)',
                                        borderTopWidth: '4px',
                                        borderTopColor: isDeath ? 'var(--brand-red-dark)' : 'var(--gray-800)',
                                        boxShadow: isDeath ? '4px 4px 0 var(--gray-100)' : 'none',
                                    }}
                                >
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between px-4 py-3 border-b"
                                        style={{
                                            background: isDeath ? 'var(--brand-red-dark)' : 'var(--gray-50)',
                                            borderColor: isDeath ? 'transparent' : 'var(--gray-200)',
                                        }}
                                    >
                                        <h4
                                            className="text-xl uppercase tracking-[-0.01em]"
                                            style={{
                                                fontFamily: 'var(--font-data)',
                                                fontWeight: 800,
                                                color: isDeath ? '#fff' : 'var(--gray-900)',
                                            }}
                                        >
                                            Group {letter}
                                        </h4>
                                        {meta.badge && (
                                            <span
                                                className="text-[10px] uppercase tracking-[0.05em] px-1.5 py-0.5"
                                                style={{
                                                    fontWeight: 800,
                                                    background: isDeath ? '#fff' : isHost ? 'var(--host-bg)' : '#fff',
                                                    border: isDeath ? 'none' : isHost ? `1px solid var(--host-border)` : '1px solid var(--gray-300)',
                                                    color: isDeath ? 'var(--brand-red-dark)' : isHost ? 'var(--host-text)' : 'var(--gray-800)',
                                                }}
                                            >
                                                {meta.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Teams */}
                                    <div className="px-4 py-3">
                                        {group.teams.map((team) => {
                                            const flagUrl = getFlagUrl(team.code);
                                            const isPlaceholder = team.code.length <= 2;
                                            return (
                                                <div key={team.code} className="flex items-center gap-3 py-2">
                                                    {flagUrl ? (
                                                        <img
                                                            src={flagUrl}
                                                            alt={team.name}
                                                            className="w-5 h-3.5 object-cover flex-shrink-0"
                                                            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-5 h-3.5 flex items-center justify-center flex-shrink-0 text-[8px]"
                                                            style={{
                                                                background: 'var(--gray-100)',
                                                                border: '1px dashed var(--gray-300)',
                                                                color: 'var(--gray-500)',
                                                            }}
                                                        >
                                                            ?
                                                        </div>
                                                    )}
                                                    <span
                                                        className="text-sm"
                                                        style={{
                                                            fontFamily: 'var(--font-ui)',
                                                            fontWeight: 500,
                                                            color: isPlaceholder ? 'var(--gray-500)' : 'var(--gray-900)',
                                                        }}
                                                    >
                                                        {team.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Tagline */}
                                    <div
                                        className="px-4 py-3 text-[15px] leading-snug border-t"
                                        style={{
                                            fontFamily: 'var(--font-prose)',
                                            color: 'var(--gray-800)',
                                            background: 'var(--gray-50)',
                                            borderColor: 'var(--gray-200)',
                                        }}
                                    >
                                        {meta.tagline}
                                        <span
                                            className="ml-2 text-xs uppercase"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--brand-red)' }}
                                        >
                                            View →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* ═══ FACT BOX ═══ */}
                <div className="max-w-[660px] mx-auto mb-14">
                    <div
                        className="p-8"
                        style={{
                            background: 'var(--gray-50)',
                            borderTop: '4px solid var(--gray-900)',
                            borderBottom: '1px solid var(--gray-300)',
                        }}
                    >
                        <h4
                            className="text-lg uppercase mb-6 tracking-[-0.01em]"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 900 }}
                        >
                            The Mathematical Impact of Expansion
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { num: '48', label: 'Total Teams', desc: 'First expansion since 1998.' },
                                { num: '104', label: 'Matches', desc: '39 days across 3 host nations.' },
                                { num: '67%', label: 'Advancement', desc: 'Up from 50%. 32 of 48 advance.' },
                                { num: '8', label: 'Wins to Title', desc: 'Up from 7. Fatigue factor.' },
                            ].map((fact) => (
                                <div key={fact.label}>
                                    <div
                                        className="text-6xl leading-none mb-2"
                                        style={{ fontFamily: 'var(--font-data)', fontWeight: 800, color: 'var(--gray-900)' }}
                                    >
                                        {fact.num}
                                    </div>
                                    <div
                                        className="text-sm uppercase mb-1"
                                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                                    >
                                        {fact.label}
                                    </div>
                                    <div
                                        className="text-[15px] leading-snug"
                                        style={{ fontFamily: 'var(--font-prose)', color: 'var(--gray-800)' }}
                                    >
                                        {fact.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

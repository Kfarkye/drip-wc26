import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { allGroups } from '../data/groups';
import { getFlagUrl } from '../lib/flags';
import { TrendsBoard } from '../components/boards/TrendsBoard';
import { PicksBoard } from '../components/boards/PicksBoard';
import { PropsBoard } from '../components/boards/PropsBoard';

/* ── Editorial data ── */

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

type TabId = 'trends' | 'picks' | 'props';

const TABS: { id: TabId; label: string }[] = [
    { id: 'trends', label: 'Trends' },
    { id: 'picks', label: "Today's Picks" },
    { id: 'props', label: 'Props Edge' },
];

export const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('trends');

    return (
        <Layout>
            <div className="px-5 pt-12 pb-20">

                {/* ═══ ARTICLE HEADER ═══ */}
                <header className="max-w-[960px] mx-auto mb-10 animate-in">
                    <div
                        className="text-[13px] uppercase tracking-[0.05em] mb-4"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--brand-red)' }}
                    >
                        World Cup 2026 Edge Analysis
                    </div>

                    <h1
                        className="mb-5 leading-[1.08] tracking-[-0.02em]"
                        style={{
                            fontFamily: 'var(--font-prose)',
                            fontSize: 'clamp(32px, 5vw, 48px)',
                            fontWeight: 700,
                            color: 'var(--gray-900)',
                        }}
                    >
                        The Drip
                    </h1>

                    <p
                        className="text-lg leading-relaxed mb-6"
                        style={{ fontFamily: 'var(--font-prose)', fontWeight: 400, color: 'var(--gray-800)', maxWidth: '600px' }}
                    >
                        Trends, picks, and prop edges — updated daily.
                    </p>
                </header>

                {/* ═══ TAB BAR ═══ */}
                <div className="max-w-[960px] mx-auto mb-8">
                    <div
                        className="flex gap-0 border-b-2"
                        style={{ borderColor: 'var(--gray-900)' }}
                    >
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="px-5 py-3 text-sm uppercase tracking-wider transition-colors relative"
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontWeight: 800,
                                    color: activeTab === tab.id ? 'var(--gray-900)' : 'var(--gray-500)',
                                    background: activeTab === tab.id ? 'var(--gray-50)' : 'transparent',
                                    borderBottom: activeTab === tab.id ? '3px solid var(--brand-red)' : '3px solid transparent',
                                    marginBottom: '-2px',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══ TAB CONTENT ═══ */}
                <div className="max-w-[960px] mx-auto mb-20">
                    {activeTab === 'trends' && <TrendsBoard />}
                    {activeTab === 'picks' && <PicksBoard />}
                    {activeTab === 'props' && <PropsBoard />}
                </div>

                {/* ═══ GROUP GRID ═══ */}
                <div className="max-w-[960px] mx-auto">
                    <h2
                        className="text-xl uppercase tracking-[-0.02em] pb-2 mb-8 border-b-[3px]"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, borderColor: 'var(--gray-900)' }}
                    >
                        Group-by-Group Breakdown
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 mb-14 stagger">
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
                </div>

            </div>
        </Layout>
    );
};

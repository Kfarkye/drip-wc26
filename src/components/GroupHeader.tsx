import React from 'react';
import type { TeamInfo } from '../data/groups';
import { getFlagUrl } from '../lib/flags';

interface GroupHeaderProps {
    groupLetter: string;
    teams: TeamInfo[];
    badge?: string;
    badgeType?: 'host' | 'death';
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ groupLetter, teams, badge, badgeType }) => {
    const isDeath = badgeType === 'death';

    return (
        <header className="mb-14 animate-in">
            <div
                className="text-[13px] uppercase tracking-[0.05em] mb-4"
                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--brand-red)' }}
            >
                World Cup 2026 · Group Stage
            </div>

            <div className="flex items-baseline gap-4 mb-3">
                <h1
                    className="leading-[1.08] tracking-[-0.02em]"
                    style={{
                        fontFamily: 'var(--font-prose)',
                        fontSize: 'clamp(36px, 6vw, 56px)',
                        fontWeight: 700,
                        color: 'var(--gray-900)',
                    }}
                >
                    Group {groupLetter}
                </h1>
                {badge && (
                    <span
                        className="text-[11px] uppercase tracking-[0.05em] px-2 py-1"
                        style={{
                            fontWeight: 800,
                            background: isDeath ? 'var(--brand-red-dark)' : 'var(--host-bg)',
                            border: isDeath ? 'none' : '1px solid var(--host-border)',
                            color: isDeath ? '#fff' : 'var(--host-text)',
                        }}
                    >
                        {badge}
                    </span>
                )}
            </div>

            {/* Team list inline */}
            <div className="flex flex-wrap items-center gap-5 mb-8">
                {teams.map((team) => {
                    const flagUrl = getFlagUrl(team.code);
                    return (
                        <div key={team.code} className="flex items-center gap-2">
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
                                className="text-base"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-900)' }}
                            >
                                {team.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div
                className="py-4 border-t border-b flex flex-wrap items-center gap-3"
                style={{
                    borderColor: 'var(--gray-300)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                }}
            >
                <span>By <strong style={{ color: 'var(--gray-900)', fontWeight: 800 }}>The Data Desk</strong></span>
                <span style={{ color: 'var(--gray-300)' }}>|</span>
                <span>February 28, 2026</span>
            </div>
        </header>
    );
};

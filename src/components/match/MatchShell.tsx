import React from 'react';
import { Link } from 'react-router-dom';
import { getFlagUrl } from '../../lib/flags';

export interface MatchShellTab {
    key: string;
    label: string;
}

interface MatchShellProps {
    backHref: string;
    backLabel: string;
    awayTeam: string;
    awayCode: string;
    homeTeam: string;
    homeCode: string;
    kickoffLabel: string;
    awayScoreLabel: string;
    homeScoreLabel: string;
    statusLabel: string;
    eventLabel?: string;
    tabs: MatchShellTab[];
    activeTab: string;
    onTabChange: (tabKey: string) => void;
    children: React.ReactNode;
}

export const MatchShell: React.FC<MatchShellProps> = ({
    backHref,
    backLabel,
    awayTeam,
    awayCode,
    homeTeam,
    homeCode,
    kickoffLabel,
    awayScoreLabel,
    homeScoreLabel,
    statusLabel,
    eventLabel,
    tabs,
    activeTab,
    onTabChange,
    children,
}) => {
    const awayFlag = getFlagUrl(awayCode);
    const homeFlag = getFlagUrl(homeCode);

    return (
        <div
            className="min-h-screen"
            style={{
                background: '#d4d6db',
                color: '#171717',
            }}
        >
            <header
                style={{
                    background:
                        'radial-gradient(120% 100% at 90% 80%, rgba(239,68,68,0.25), rgba(9,9,11,0) 42%), radial-gradient(120% 100% at 10% 80%, rgba(34,197,94,0.2), rgba(9,9,11,0) 40%), linear-gradient(180deg, #111827 0%, #09090b 100%)',
                    color: '#f4f4f5',
                    paddingTop: 'max(16px, env(safe-area-inset-top))',
                }}
            >
                <div className="max-w-[820px] mx-auto px-4 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            to={backHref}
                            className="text-sm inline-flex items-center gap-1"
                            style={{ color: '#d4d4d8', fontWeight: 600 }}
                        >
                            ← {backLabel}
                        </Link>
                        <div className="flex items-center gap-3 text-[22px]" style={{ color: '#f4f4f5' }}>
                            <span aria-hidden>⇪</span>
                            <span aria-hidden>☆</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-3">
                        <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[12px]"
                            style={{
                                fontFamily: 'var(--font-data)',
                                color: '#d4d4d8',
                                background: 'rgba(255,255,255,0.08)',
                            }}
                        >
                            {kickoffLabel}
                        </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <div className="text-center">
                            {awayFlag ? (
                                <img
                                    src={awayFlag}
                                    alt=""
                                    className="w-14 h-14 object-cover mx-auto mb-2"
                                    style={{ borderRadius: 12, boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset' }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-[12px] mx-auto mb-2" style={{ background: '#27272a' }} />
                            )}
                            <div className="text-[17px]" style={{ fontWeight: 600 }}>
                                {awayTeam}
                            </div>
                        </div>

                        <div className="text-center">
                            <div
                                className="text-[52px] leading-none tracking-[-0.04em]"
                                style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}
                            >
                                {awayScoreLabel}
                            </div>
                            <div className="text-[34px] leading-none mt-[-2px]" style={{ color: '#71717a' }}>
                                -
                            </div>
                            <div className="text-[36px] leading-none mt-[-8px]" style={{ color: '#f4f4f5', fontFamily: 'var(--font-data)', fontWeight: 700 }}>
                                {homeScoreLabel}
                            </div>
                            <div className="text-[16px]" style={{ color: '#d4d4d8' }}>
                                {statusLabel}
                            </div>
                        </div>

                        <div className="text-center">
                            {homeFlag ? (
                                <img
                                    src={homeFlag}
                                    alt=""
                                    className="w-14 h-14 object-cover mx-auto mb-2"
                                    style={{ borderRadius: 12, boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset' }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-[12px] mx-auto mb-2" style={{ background: '#27272a' }} />
                            )}
                            <div className="text-[17px]" style={{ fontWeight: 600 }}>
                                {homeTeam}
                            </div>
                        </div>
                    </div>

                    {eventLabel ? (
                        <p className="text-center text-[14px] mt-3" style={{ color: '#a1a1aa' }}>
                            {eventLabel}
                        </p>
                    ) : null}
                </div>

                <div className="border-t border-[#27272a]/70">
                    <div className="max-w-[820px] mx-auto overflow-x-auto px-2">
                        <nav className="min-w-max flex items-center">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => onTabChange(tab.key)}
                                        className="px-4 py-3 border-b-4 text-[17px] whitespace-nowrap"
                                        style={{
                                            borderColor: isActive ? '#f4f4f5' : 'transparent',
                                            color: isActive ? '#f4f4f5' : '#a1a1aa',
                                            fontWeight: isActive ? 700 : 600,
                                            transition: 'color 120ms ease',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-[820px] mx-auto px-4 py-4 pb-14">{children}</main>
        </div>
    );
};

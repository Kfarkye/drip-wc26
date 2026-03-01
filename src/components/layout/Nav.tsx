import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataStatus } from '../../hooks/useLiveData';

export const Nav: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { data: status } = useDataStatus();
    const hasLiveData = status?.configured && ((status?.oddsCount ?? 0) > 0 || (status?.polyCount ?? 0) > 0);

    return (
        <nav className="border-t-[6px] border-t-[var(--gray-900)] border-b border-b-[var(--gray-200)] bg-white sticky top-0 z-50">
            <div className="max-w-[1040px] mx-auto px-5 h-14 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-baseline gap-2">
                        <span
                            className="text-xl tracking-[-0.01em] uppercase"
                            style={{ fontFamily: 'var(--font-data)', fontWeight: 800, color: 'var(--gray-900)' }}
                        >
                            The Drip
                        </span>
                        <span
                            className="text-sm tracking-[-0.01em]"
                            style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--brand-red)' }}
                        >
                            // Edge Intel
                        </span>
                    </Link>

                    <div className="hidden md:flex gap-6">
                        <Link
                            to="/"
                            className="text-[13px] transition-colors"
                            style={{
                                fontFamily: 'var(--font-ui)',
                                fontWeight: isHome ? 700 : 500,
                                color: isHome ? 'var(--gray-900)' : 'var(--gray-500)',
                            }}
                        >
                            Markets
                        </Link>
                        {['A','B','C','D','E','F','G','H','I','J','K','L'].map(letter => {
                            const isActive = location.pathname === `/group/${letter.toLowerCase()}`;
                            return (
                                <Link
                                    key={letter}
                                    to={`/group/${letter.toLowerCase()}`}
                                    className="text-[13px] transition-colors hover:text-[var(--gray-900)]"
                                    style={{
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? 'var(--gray-900)' : 'var(--gray-500)',
                                    }}
                                >
                                    {letter}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasLiveData && (
                        <span className="flex items-center gap-1.5">
                            <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: 'var(--brand-red)', animation: 'pulse 2s ease-in-out infinite' }}
                            />
                            <span
                                className="text-[10px] uppercase tracking-[0.08em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--brand-red)' }}
                            >
                                Live
                            </span>
                        </span>
                    )}
                    <span
                        className="text-[11px] uppercase tracking-[0.06em]"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                    >
                        Feb 28, 2026
                    </span>
                </div>
            </div>
        </nav>
    );
};

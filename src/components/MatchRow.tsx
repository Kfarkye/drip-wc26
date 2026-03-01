import React from 'react';
import { getFlagUrl } from '../lib/flags';

interface MatchRowProps {
    homeTeam: string;
    homeCode?: string;
    awayTeam: string;
    awayCode?: string;
    kickoff: string;
    venue: string;
    matchNumber?: number;
}

function formatMatchDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMatchTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export const MatchRow: React.FC<MatchRowProps> = ({
    homeTeam,
    homeCode,
    awayTeam,
    awayCode,
    kickoff,
    venue,
    matchNumber,
}) => {
    const homeFlag = homeCode ? getFlagUrl(homeCode) : null;
    const awayFlag = awayCode ? getFlagUrl(awayCode) : null;

    return (
        <div
            className="flex items-center justify-between py-4 transition-colors hover:bg-[var(--gray-50)]"
            style={{ borderBottom: '1px solid var(--gray-200)' }}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {matchNumber != null && (
                    <span
                        className="text-xs w-6 text-center flex-shrink-0"
                        style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-500)' }}
                    >
                        M{matchNumber}
                    </span>
                )}
                <div className="flex items-center gap-2 min-w-0">
                    {homeFlag && (
                        <img src={homeFlag} alt="" className="w-5 h-3.5 object-cover flex-shrink-0"
                            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }} />
                    )}
                    <span
                        className="text-sm truncate"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-900)' }}
                    >
                        {homeTeam}
                    </span>
                    <span
                        className="text-xs mx-1"
                        style={{ color: 'var(--gray-500)' }}
                    >
                        v
                    </span>
                    {awayFlag && (
                        <img src={awayFlag} alt="" className="w-5 h-3.5 object-cover flex-shrink-0"
                            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }} />
                    )}
                    <span
                        className="text-sm truncate"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-900)' }}
                    >
                        {awayTeam}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 text-right">
                <div className="hidden sm:block">
                    <span
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                    >
                        {venue}
                    </span>
                </div>
                <div className="text-right">
                    <div
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--gray-900)' }}
                    >
                        {formatMatchDate(kickoff)}
                    </div>
                    <div
                        className="text-[11px]"
                        style={{ fontFamily: 'var(--font-data)', fontWeight: 500, color: 'var(--gray-500)' }}
                    >
                        {formatMatchTime(kickoff)}
                    </div>
                </div>
            </div>
        </div>
    );
};

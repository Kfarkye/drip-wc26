import React from 'react';

interface MatchRowProps {
    homeTeam: string;
    awayTeam: string;
    kickoff: string;
    venue: string;
}

export const MatchRow: React.FC<MatchRowProps> = ({ homeTeam, awayTeam, kickoff, venue }) => {
    const date = new Date(kickoff);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

    return (
        <div className="flex items-center gap-4 py-4 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.01] -mx-4 px-4 rounded-lg transition-colors">
            <div className="w-20 shrink-0">
                <div className="text-[11px] text-[var(--mist)] font-sans">{dayName}, {monthDay}</div>
                <div className="text-[11px] font-mono text-[var(--silver)]">{time}</div>
            </div>
            <div className="flex-1 flex items-center gap-3">
                <span className="text-[14px] font-sans font-[450] text-[var(--ivory)]">{homeTeam}</span>
                <span className="text-[var(--iron)] text-[10px] uppercase font-[600] tracking-[0.15em] font-sans">v</span>
                <span className="text-[14px] font-sans font-[450] text-[var(--ivory)]">{awayTeam}</span>
            </div>
            <div className="hidden sm:block text-right">
                <div className="text-[11px] text-[var(--silver)] font-sans">{venue}</div>
            </div>
        </div>
    );
};

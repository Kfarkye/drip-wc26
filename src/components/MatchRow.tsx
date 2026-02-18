import React from 'react';

interface MatchRowProps {
    homeTeam: string;
    awayTeam: string;
    kickoff: string;
    venue: string;
}

export const MatchRow: React.FC<MatchRowProps> = ({ homeTeam, awayTeam, kickoff, venue }) => {
    const date = new Date(kickoff);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <div className="flex items-center gap-6 py-4 border-b border-white/[0.05] group">
            <div className="w-24 shrink-0">
                <div className="text-xs text-silver uppercase tracking-widest">{formattedDate}</div>
                <div className="text-sm font-mono text-white/60">{formattedTime}</div>
            </div>
            <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-sans font-medium text-white">{homeTeam}</span>
                    <span className="text-silver/40 text-[10px] uppercase font-bold tracking-widest">VS</span>
                    <span className="font-sans font-medium text-white">{awayTeam}</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-silver/60 font-sans">{venue}</div>
                </div>
            </div>
        </div>
    );
};

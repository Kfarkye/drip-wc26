import React from 'react';

interface Team {
    name: string;
    code: string;
    flag: string;
}

interface GroupHeaderProps {
    groupLetter: string;
    teams: Team[];
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ groupLetter, teams }) => {
    return (
        <div className="mb-16 animate-breathe-in">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-[0.3em] text-[var(--emerald)] uppercase font-[500] font-sans">Group Stage</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--emerald)]/20 to-transparent" />
            </div>
            <h1 className="text-[clamp(48px,10vw,80px)] font-sans font-[200] leading-[0.9] mb-10 tracking-tight">
                Group <span className="text-[var(--emerald)]">{groupLetter}</span>
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
                {teams.map((team) => (
                    <div
                        key={team.code}
                        className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                    >
                        <span className="text-2xl leading-none">{team.flag}</span>
                        <div>
                            <div className="text-[10px] text-[var(--silver)] uppercase tracking-[0.15em] leading-none mb-0.5 font-mono">{team.code}</div>
                            <div className="text-[13px] font-[450] text-[var(--ivory)] font-sans">{team.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

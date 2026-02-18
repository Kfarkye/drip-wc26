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
        <div className="mb-16">
            <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] tracking-[0.4em] text-emerald uppercase font-bold">Tournament Tier 01</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald/20 to-transparent" />
            </div>
            <h1 className="text-[clamp(40px,8vw,72px)] font-sans font-[200] leading-none mb-8">
                Group <span className="text-emerald">{groupLetter}</span>
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((team) => (
                    <div key={team.code} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-3xl">{team.flag}</span>
                        <div>
                            <div className="text-xs text-silver uppercase tracking-widest leading-none mb-1">{team.code}</div>
                            <div className="text-sm font-medium text-white">{team.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

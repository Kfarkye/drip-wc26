import React from 'react';

export const Nav: React.FC = () => {
    return (
        <nav className="border-b border-[var(--card-border)] bg-[var(--void)]/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <a href="/" className="flex items-baseline gap-0.5">
                        <span className="text-[11px] font-sans lowercase text-[#aaaaaa]">the</span>
                        <span className="text-[28px] font-serif italic font-[300] text-[#aaaaaa] leading-none">Drip</span>
                    </a>
                    <div className="hidden md:flex gap-6">
                        <a href="/" className="text-sm text-[var(--silver)] hover:text-[var(--ivory)] transition-colors font-sans">Hub</a>
                        <a href="/group/d" className="text-sm text-[var(--ivory)] font-[500] font-sans">Group D</a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-mono">Live Edge Data</span>
                </div>
            </div>
        </nav>
    );
};

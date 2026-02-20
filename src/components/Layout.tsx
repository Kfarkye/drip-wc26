import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--void)] selection:bg-emerald/30 grain-overlay vignette">
            <nav className="border-b border-[var(--card-border)] bg-[var(--void)]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="flex items-baseline gap-0.5">
                            <span className="text-[11px] font-sans lowercase text-[#aaaaaa]">the</span>
                            <span className="text-[28px] font-serif italic font-[300] text-[#aaaaaa] leading-none">Drip</span>
                        </span>
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
            <main className="max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>
            <footer className="border-t border-[var(--card-border)] bg-[var(--void)]/80 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-[var(--silver)] text-sm font-sans">
                        &copy; 2026 The Drip. All rights reserved. Not financial advice.
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">Twitter</a>
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">Discord</a>
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">API</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

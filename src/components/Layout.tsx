import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-void selection:bg-emerald/30">
            <nav className="border-b border-white/[0.05] bg-obsidian/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-bold tracking-tighter text-white font-sans uppercase">
                            The Drip <span className="text-silver font-light">WC26</span>
                        </span>
                        <div className="hidden md:flex gap-6">
                            <a href="/" className="text-sm text-silver hover:text-white transition-colors">Hub</a>
                            <a href="/group/d" className="text-sm text-white font-medium">Group D</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                        <span className="text-[10px] tracking-[0.2em] text-silver uppercase font-mono">Live Edge Data</span>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>
            <footer className="border-t border-white/[0.05] bg-obsidian/50 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-silver text-sm">
                        © 2026 The Drip. All rights reserved. Not financial advice.
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-silver hover:text-white transition-colors text-xs uppercase tracking-widest">Twitter</a>
                        <a href="#" className="text-silver hover:text-white transition-colors text-xs uppercase tracking-widest">Discord</a>
                        <a href="#" className="text-silver hover:text-white transition-colors text-xs uppercase tracking-widest">API</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

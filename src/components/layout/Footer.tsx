import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-[var(--card-border)] bg-[var(--void)]/80 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    <div className="text-[var(--silver)] text-sm font-sans">
                        &copy; 2026 The Drip. All rights reserved. Not financial advice.
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">Twitter</a>
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">Discord</a>
                        <a href="#" className="text-[var(--silver)] hover:text-[var(--ivory)] transition-colors text-xs uppercase tracking-widest font-sans">API</a>
                    </div>
                </div>
                <div className="border-t border-[var(--card-border)] pt-6">
                    <p className="text-[var(--silver)]/50 text-[11px] leading-relaxed max-w-3xl">
                        The Drip may earn a commission if you sign up through links on this page.
                        Odds and prices are informational only. Gambling involves risk.
                        Confirm legality in your jurisdiction before placing wagers.
                        Past performance does not guarantee future results. Gap calculations are mathematical,
                        not predictive.
                    </p>
                </div>
            </div>
        </footer>
    );
};

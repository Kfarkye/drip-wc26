import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-[var(--card-border)] mt-24">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-[10px] font-sans lowercase text-[var(--iron)]">the</span>
                        <span className="text-[20px] font-serif italic font-[300] text-[var(--iron)] leading-none">Drip</span>
                    </div>
                    <div className="text-[var(--silver)] text-xs font-sans">
                        &copy; 2026 The Drip. Not financial advice.
                    </div>
                </div>
                <div className="border-t border-[var(--card-border)] pt-6">
                    <p className="text-[var(--iron)] text-[11px] leading-relaxed max-w-3xl font-sans">
                        The Drip compares odds across sportsbooks and prediction markets for informational purposes only.
                        Gambling involves risk. Confirm legality in your jurisdiction before placing wagers.
                        Past performance does not guarantee future results. Gap calculations are mathematical, not predictive.
                    </p>
                </div>
            </div>
        </footer>
    );
};

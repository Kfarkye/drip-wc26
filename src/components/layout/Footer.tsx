import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="max-w-[660px] mx-auto px-5">
            <div
                className="border-t border-[var(--gray-900)] pt-6 pb-12 text-[12px] leading-relaxed"
                style={{ fontFamily: 'var(--font-ui)', color: 'var(--gray-500)' }}
            >
                <p>
                    <strong style={{ color: 'var(--gray-900)', fontWeight: 700 }}>Sources & Methodology:</strong>{' '}
                    Data compiled February 28, 2026. Outright winner odds sourced from major US sportsbooks
                    (DraftKings, BetMGM). Prediction market volume ($223.3M) aggregated from Polymarket and
                    Kalshi. Group draw via FIFA Official Draw (Dec 5, 2025). Implied probabilities do not sum
                    to 100% due to sportsbook vigorish (overround).
                </p>
            </div>
        </footer>
    );
};

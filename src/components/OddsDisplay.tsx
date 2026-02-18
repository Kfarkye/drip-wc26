import React from 'react';
import { formatOdds } from '../lib/odds';

interface OddsDisplayProps {
    odds: number;
    label: string;
}

export const OddsDisplay: React.FC<OddsDisplayProps> = ({ odds, label }) => {
    return (
        <div className="flex items-baseline justify-between py-2 border-b border-white/[0.05]">
            <span className="text-xs text-silver uppercase tracking-widest">{label}</span>
            <span className="font-mono text-ivory">{formatOdds(odds)}</span>
        </div>
    );
};

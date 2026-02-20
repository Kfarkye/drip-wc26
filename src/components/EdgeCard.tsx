import React from 'react';
import { Link } from 'react-router-dom';

interface EdgeCardProps {
    marketName: string;
    sportsbookName: string;
    sportsbookOdds: string;
    sportsbookLink?: string;
    predictionName: string;
    predictionPrice: string;
    predictionLink?: string;
    edgePercentage: number;
    confidence?: 'high' | 'medium' | 'low';
    volume?: number;
    link?: string;
}

export const EdgeCard: React.FC<EdgeCardProps> = ({
    marketName,
    sportsbookName,
    sportsbookOdds,
    sportsbookLink,
    predictionName,
    predictionPrice,
    predictionLink,
    edgePercentage,
    confidence,
    volume,
    link,
}) => {
    const card = (
        <div className="relative overflow-hidden rounded-[14px] bg-[var(--card-bg)] border border-[var(--card-border)] p-8 animate-breathe-in">
            <div className="flex justify-between items-start mb-6">
                <div className="text-[18px] font-[300] tracking-tight font-sans text-ivory/80">
                    {marketName}
                </div>
                {confidence && (
                    <div className="px-2 py-0.5 rounded-full text-[8px] font-[500] tracking-widest uppercase border border-white/[0.06] text-[var(--silver)] bg-white/[0.03]">
                        {confidence}
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <div className="font-sans text-[var(--mist)]">
                        {sportsbookLink ? (
                            <a href={sportsbookLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ivory)] transition-colors underline decoration-white/[0.1] underline-offset-2">
                                {sportsbookName}
                            </a>
                        ) : sportsbookName}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-[400] tracking-widest uppercase border border-white/[0.06] text-[var(--silver)] bg-white/[0.02]">
                            YES
                        </span>
                        <span className="font-mono text-ivory">{sportsbookOdds}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div className="font-sans text-[var(--mist)]">
                        {predictionLink ? (
                            <a href={predictionLink} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ivory)] transition-colors underline decoration-white/[0.1] underline-offset-2">
                                {predictionName}
                            </a>
                        ) : predictionName}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-[400] tracking-widest uppercase border border-white/[0.06] text-[var(--silver)] bg-white/[0.02]">
                            NO
                        </span>
                        <span className="font-mono text-ivory">{predictionPrice}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-baseline gap-1">
                    <span className="font-mono font-[400] leading-none text-[clamp(44px,9vw,58px)] text-[var(--emerald)] animate-blur-reveal">
                        {edgePercentage.toFixed(1)}
                    </span>
                    <span className="text-2xl font-mono font-[300] text-[var(--emerald)]">%</span>
                </div>
                <div className="mt-2 text-[9px] tracking-[0.2em] text-[var(--silver)] uppercase font-sans flex items-center gap-2">
                    gap
                    {volume && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[var(--iron)]">${(volume / 1000).toFixed(1)}k Vol</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (link) {
        return <Link to={link} className="block hover:scale-[1.02] transition-transform">{card}</Link>;
    }

    return card;
};

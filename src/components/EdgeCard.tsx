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

const confidenceColor: Record<string, string> = {
    high: 'text-[var(--emerald)] border-[var(--emerald)]/20 bg-[var(--emerald)]/[0.06]',
    medium: 'text-[var(--bone)] border-[var(--bone)]/15 bg-white/[0.03]',
    low: 'text-[var(--silver)] border-white/[0.06] bg-white/[0.02]',
};

export const EdgeCard: React.FC<EdgeCardProps> = ({
    marketName,
    sportsbookName,
    sportsbookOdds,
    sportsbookLink,
    predictionName,
    predictionPrice,
    predictionLink,
    edgePercentage,
    confidence = 'medium',
    volume,
    link,
}) => {
    const card = (
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--card-bg)] border border-[var(--card-border)] p-6 transition-all duration-300 hover:border-white/[0.08] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] group">
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
                <div className="text-[15px] font-[400] tracking-tight font-sans text-[var(--ivory)]">
                    {marketName}
                </div>
                {confidence && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-[500] tracking-[0.12em] uppercase border ${confidenceColor[confidence]}`}>
                        {confidence}
                    </span>
                )}
            </div>

            {/* Odds comparison */}
            <div className="space-y-0 mb-6">
                {/* Sportsbook row */}
                <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                        <span className="w-[3px] h-3 rounded-full bg-[var(--emerald)]/40" />
                        <span className="text-[13px] font-sans text-[var(--mist)]">
                            {sportsbookLink ? (
                                <a
                                    href={sportsbookLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[var(--ivory)] transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {sportsbookName}
                                </a>
                            ) : sportsbookName}
                        </span>
                    </div>
                    <span className="font-mono text-[14px] text-[var(--ivory)] tracking-tight">{sportsbookOdds}</span>
                </div>

                {/* Prediction market row */}
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <span className="w-[3px] h-3 rounded-full bg-white/10" />
                        <span className="text-[13px] font-sans text-[var(--mist)]">
                            {predictionLink ? (
                                <a
                                    href={predictionLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[var(--ivory)] transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {predictionName}
                                </a>
                            ) : predictionName}
                        </span>
                    </div>
                    <span className="font-mono text-[14px] text-[var(--ivory)] tracking-tight">{predictionPrice}</span>
                </div>
            </div>

            {/* Edge value — the hero number */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1">
                <div className="flex items-baseline gap-0.5">
                    <span className={`font-mono font-[400] leading-none text-[clamp(36px,8vw,48px)] tracking-tight ${
                        edgePercentage >= 3 ? 'text-[var(--emerald)]' : 'text-[var(--bone)]'
                    }`}>
                        {edgePercentage.toFixed(1)}
                    </span>
                    <span className={`text-xl font-mono font-[300] ${
                        edgePercentage >= 3 ? 'text-[var(--emerald)]/60' : 'text-[var(--bone)]/40'
                    }`}>%</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[9px] tracking-[0.15em] text-[var(--silver)] uppercase font-sans">
                    <span>gap</span>
                    {volume != null && volume > 0 && (
                        <>
                            <span className="w-[3px] h-[3px] rounded-full bg-white/10" />
                            <span className="text-[var(--iron)]">${(volume / 1000).toFixed(0)}k vol</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (link) {
        return (
            <Link to={link} className="block">
                {card}
            </Link>
        );
    }

    return card;
};

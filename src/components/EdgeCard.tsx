import React from 'react';

interface EdgeCardProps {
    marketName: string;
    sportsbookName: string;
    sportsbookOdds: string;
    predictionName: string;
    predictionPrice: string;
    edgePercentage: number;
    confidence?: 'high' | 'medium' | 'low';
    volume?: number;
}

export const EdgeCard: React.FC<EdgeCardProps> = ({
    marketName,
    sportsbookName,
    sportsbookOdds,
    predictionName,
    predictionPrice,
    edgePercentage,
    confidence,
    volume,
}) => {
    return (
        <div className="relative overflow-hidden rounded-[18px] bg-white/[0.02] border border-white/[0.02] backdrop-blur-[12px] shadow-[0_28px_100px_rgba(0,0,0,0.4)] p-8 animate-breathe-in">
            <div className="flex justify-between items-start mb-6">
                <div className="text-[18px] font-[300] tracking-tight font-sans text-ivory/80">
                    {marketName}
                </div>
                {confidence && (
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase border ${confidence === 'high' ? 'bg-emerald/10 text-emerald border-emerald/20' :
                            confidence === 'medium' ? 'bg-white/10 text-silver border-white/20' :
                                'bg-red-soft/10 text-red-soft border-red-soft/20'
                        }`}>
                        {confidence} Confidence
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
                    <div className="text-silver font-sans">{sportsbookName}</div>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest bg-[var(--emerald-deep)] text-[var(--emerald)] border border-[var(--emerald-border)]">
                            YES
                        </span>
                        <span className="font-mono text-ivory">{sportsbookOdds}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div className="text-silver font-sans">{predictionName}</div>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest bg-[var(--red-bg)] text-[var(--red-soft)] border border-[var(--red-border)]">
                            NO
                        </span>
                        <span className="font-mono text-ivory">{predictionPrice}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <div className="flex items-baseline gap-1 group">
                    <span className="font-sans font-[200] leading-none text-[clamp(44px,9vw,58px)] text-white animate-blur-reveal">
                        {edgePercentage.toFixed(1)}
                    </span>
                    <span className="text-2xl font-[200] text-silver">%</span>
                </div>
                <div className="mt-2 text-[10px] tracking-[0.2em] text-silver/40 uppercase font-sans flex items-center gap-2">
                    The Oracle Edge
                    {volume && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-silver/20">${(volume / 1000).toFixed(1)}k Vol</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

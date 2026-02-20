import React from 'react';

interface AuditMetric {
    label: string;
    value: string;
    trend: number;
    status: 'optimal' | 'warning' | 'critical';
}

export const TechnicalAuditHub: React.FC = () => {
    const metrics: AuditMetric[] = [
        { label: 'Oracle Latency', value: '42ms', trend: -4, status: 'optimal' },
        { label: 'Devig Precision', value: '99.98%', trend: 0.1, status: 'optimal' },
        { label: 'Market Liquidity (Avg)', value: '$12.4k', trend: 12, status: 'optimal' },
        { label: 'Identity Resolution', value: '100%', trend: 0, status: 'optimal' },
    ];

    return (
        <div className="p-8 rounded-[24px] bg-obsidian border border-white/[0.05] backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-2xl font-sans font-light text-white mb-1 uppercase tracking-widest">Technical Audit Hub</h2>
                    <p className="text-xs text-silver/60 uppercase tracking-[0.2em] font-mono">System Integrity • Oracle Moat v7.4</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald uppercase tracking-widest">All Systems Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {metrics.map((metric) => (
                    <div key={metric.label} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] group hover:border-white/10 transition-colors">
                        <div className="text-[10px] text-silver uppercase tracking-[0.2em] mb-4 font-sans">{metric.label}</div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-sans font-light text-white">{metric.value}</span>
                            <span className={`text-[10px] font-mono ${metric.trend >= 0 ? 'text-emerald' : 'text-red-soft'}`}>
                                {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald text-xs font-bold">1</div>
                        <div className="text-sm text-ivory font-sans">Identity Resolution: Sportsbook vs Prediction Markets</div>
                    </div>
                    <div className="text-[10px] text-emerald uppercase font-bold tracking-widest">Verified</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald text-xs font-bold">2</div>
                        <div className="text-sm text-ivory font-sans">Hole 6: Power-Method Devigging Algorithm</div>
                    </div>
                    <div className="text-[10px] text-emerald uppercase font-bold tracking-widest">Active</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-silver text-xs font-bold">3</div>
                        <div className="text-sm text-ivory font-sans">Liquidity Thresholds: Min $5k USD Depth</div>
                    </div>
                    <div className="text-[10px] text-silver uppercase font-bold tracking-widest">Enforced</div>
                </div>
            </div>
        </div>
    );
};

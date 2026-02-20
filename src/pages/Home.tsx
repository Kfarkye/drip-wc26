import React from 'react';
import { Layout } from '../components/Layout';

export const Home: React.FC = () => {
    return (
        <Layout>
            <div className="py-20 text-center">
                <h1 className="text-6xl font-sans font-[200] mb-6 tracking-tight text-[var(--ivory)]">World Cup 2026 <span className="text-[var(--emerald)]">Endpoints</span></h1>
                <p className="text-xl text-[var(--silver)] font-serif italic mb-12">The Oracle of probabilities for the beautiful game's return to North America.</p>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <a href="/group/d" className="group p-8 rounded-[14px] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--emerald)]/40 transition-all">
                        <div className="text-[var(--emerald)] text-xs uppercase tracking-[0.3em] font-[500] mb-4 font-sans">LIVE DATA</div>
                        <div className="text-2xl font-sans font-[300] text-[var(--ivory)] mb-2">Group D</div>
                        <div className="text-[var(--silver)] text-sm font-sans">USA &bull; Chile &bull; Ecuador &bull; Peru</div>
                    </a>

                    <div className="p-8 rounded-[14px] bg-[var(--card-bg)]/50 border border-[var(--card-border)]/50 opacity-40 cursor-not-allowed">
                        <div className="text-[var(--silver)] text-xs uppercase tracking-[0.3em] font-[500] mb-4 font-sans">COMING SOON</div>
                        <div className="text-2xl font-sans font-[300] text-[var(--ivory)] mb-2">Group A</div>
                        <div className="text-[var(--silver)] text-sm font-sans">Mexico &bull; TBD &bull; TBD &bull; TBD</div>
                    </div>

                    <div className="p-8 rounded-[14px] bg-[var(--card-bg)]/50 border border-[var(--card-border)]/50 opacity-40 cursor-not-allowed">
                        <div className="text-[var(--silver)] text-xs uppercase tracking-[0.3em] font-[500] mb-4 font-sans">COMING SOON</div>
                        <div className="text-2xl font-sans font-[300] text-[var(--ivory)] mb-2">Group B</div>
                        <div className="text-[var(--silver)] text-sm font-sans">Canada &bull; TBD &bull; TBD &bull; TBD</div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

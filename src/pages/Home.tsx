import React from 'react';
import { Layout } from '../components/Layout';

export const Home: React.FC = () => {
    return (
        <Layout>
            <div className="py-20 text-center">
                <h1 className="text-6xl font-sans font-[200] mb-6 tracking-tight">World Cup 2026 <span className="text-emerald">Endpoints</span></h1>
                <p className="text-xl text-silver font-serif italic mb-12">The Oracle of probabilities for the beautiful game's return to North America.</p>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <a href="/group/d" className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald/40 transition-all">
                        <div className="text-emerald text-xs uppercase tracking-[0.3em] font-bold mb-4">LIVE DATA</div>
                        <div className="text-2xl font-sans font-light text-white mb-2">Group D</div>
                        <div className="text-silver text-sm">USA • Chile • Ecuador • Peru</div>
                    </a>

                    <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-40 cursor-not-allowed">
                        <div className="text-silver text-xs uppercase tracking-[0.3em] font-bold mb-4">COMING SOON</div>
                        <div className="text-2xl font-sans font-light text-white mb-2">Group A</div>
                        <div className="text-silver text-sm">Mexico • TBD • TBD • TBD</div>
                    </div>

                    <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-40 cursor-not-allowed">
                        <div className="text-silver text-xs uppercase tracking-[0.3em] font-bold mb-4">COMING SOON</div>
                        <div className="text-2xl font-sans font-light text-white mb-2">Group B</div>
                        <div className="text-silver text-sm">Canada • TBD • TBD • TBD</div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

interface GroupCardProps {
    letter: string;
    teams: string;
    badge?: string;
    to: string;
    disabled?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ letter, teams, badge, to, disabled }) => {
    const content = (
        <div className={`relative p-6 rounded-[var(--radius-lg)] border transition-all duration-300 ${
            disabled
                ? 'bg-white/[0.01] border-white/[0.03] opacity-30 cursor-default'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-white/[0.08] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]'
        }`}>
            {badge && (
                <span className="text-[9px] tracking-[0.2em] text-[var(--emerald)] uppercase font-[500] font-sans mb-3 block">
                    {badge}
                </span>
            )}
            <div className="text-xl font-sans font-[300] text-[var(--ivory)] mb-1">
                Group {letter}
            </div>
            <div className="text-[var(--silver)] text-[13px] font-sans leading-relaxed">
                {teams}
            </div>
        </div>
    );

    if (disabled) return content;
    return <Link to={to} className="block">{content}</Link>;
};

export const Home: React.FC = () => {
    return (
        <Layout>
            {/* Hero */}
            <div className="pt-16 pb-20 animate-breathe-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-[var(--emerald)]/40" />
                    <span className="text-[10px] tracking-[0.3em] text-[var(--emerald)] uppercase font-[500] font-sans">
                        World Cup 2026
                    </span>
                </div>

                <h1 className="text-[clamp(36px,6vw,56px)] font-sans font-[200] leading-[1.1] tracking-tight text-[var(--ivory)] mb-4 max-w-3xl">
                    World Cup 2026
                    <br />
                    <span className="text-[var(--emerald)]">odds compared</span>
                </h1>

                <p className="text-[17px] text-[var(--mist)] font-sans leading-relaxed max-w-xl mb-12">
                    Sportsbook lines and prediction market prices for all 104
                    matches. See where DraftKings, FanDuel, Kalshi, and
                    Polymarket disagree — and by how much.
                </p>

                {/* Featured edge — USA Group D */}
                <Link
                    to="/group/d"
                    className="block max-w-xl p-6 rounded-[var(--radius-lg)] bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--emerald)]/30 transition-all duration-300 group mb-16"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] tracking-[0.2em] text-[var(--emerald)] uppercase font-[500] font-sans">
                            USA Group D Odds
                        </span>
                        <span className="text-[11px] text-[var(--silver)] font-sans group-hover:text-[var(--bone)] transition-colors">
                            View analysis &rarr;
                        </span>
                    </div>
                    <div className="text-xl font-sans font-[300] text-[var(--ivory)] mb-2">
                        USA to Win Group D
                    </div>
                    <div className="flex items-baseline gap-4 mb-3">
                        <div>
                            <span className="text-[11px] text-[var(--silver)] font-sans block mb-0.5">DraftKings</span>
                            <span className="font-mono text-[var(--ivory)]">+125</span>
                        </div>
                        <div className="text-[var(--iron)]">/</div>
                        <div>
                            <span className="text-[11px] text-[var(--silver)] font-sans block mb-0.5">Kalshi</span>
                            <span className="font-mono text-[var(--ivory)]">45¢</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-[500] bg-[var(--emerald)]/[0.06] text-[var(--emerald)] border border-[var(--emerald)]/12">
                            0.6% gap
                        </span>
                        <span className="text-[11px] text-[var(--iron)] font-sans">$124k volume</span>
                    </div>
                </Link>
            </div>

            {/* Group grid */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        All Groups
                    </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
                    <GroupCard letter="A" teams="Mexico · S. Korea · S. Africa · Playoff D" to="/group/a" disabled />
                    <GroupCard letter="B" teams="Canada · Switzerland · Qatar · Playoff A" to="/group/b" disabled />
                    <GroupCard letter="C" teams="Brazil · Morocco · Scotland · Haiti" to="/group/c" disabled />
                    <GroupCard letter="D" teams="USA · Paraguay · Australia · Playoff C" badge="Live Data" to="/group/d" />
                    <GroupCard letter="E" teams="Germany · Ecuador · Ivory Coast · Curaçao" to="/group/e" disabled />
                    <GroupCard letter="F" teams="Netherlands · Japan · Tunisia · Playoff B" to="/group/f" disabled />
                    <GroupCard letter="G" teams="Belgium · Egypt · Iran · New Zealand" to="/group/g" disabled />
                    <GroupCard letter="H" teams="Spain · Uruguay · Saudi Arabia · Cape Verde" to="/group/h" disabled />
                    <GroupCard letter="I" teams="France · Senegal · Norway · Playoff 2" to="/group/i" disabled />
                    <GroupCard letter="J" teams="Argentina · Austria · Algeria · Jordan" to="/group/j" disabled />
                    <GroupCard letter="K" teams="Portugal · Colombia · Uzbekistan · Playoff 1" to="/group/k" disabled />
                    <GroupCard letter="L" teams="England · Croatia · Ghana · Panama" to="/group/l" disabled />
                </div>
            </section>

            {/* How it works — brief */}
            <section className="mb-20 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        How It Works
                    </span>
                </div>
                <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed">
                    Sportsbooks like DraftKings and FanDuel set odds based on how much money
                    comes in on each side. Prediction markets like Kalshi and Polymarket set
                    prices through open order books where traders buy and sell contracts.
                    When these two systems price the same World Cup outcome differently,
                    the gap tells you something. The Drip tracks those gaps across every match.
                </p>
            </section>
        </Layout>
    );
};

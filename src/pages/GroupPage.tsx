import React from 'react';
import { Layout } from '../components/Layout';
import { GroupHeader } from '../components/GroupHeader';
import { EdgeCard } from '../components/EdgeCard';
import { MatchRow } from '../components/MatchRow';
import { SchemaScript } from '../components/SchemaScript';
import { generateGroupSchema } from '../lib/schema';
import { groupD } from '../data/groups';

export const GroupPage: React.FC = () => {
    const faqs = [
        {
            question: "Who will win World Cup 2026 Group D?",
            answer: "The United States is favored to win Group D at +125 odds (44.4% implied probability) on major sportsbooks. Prediction markets price USA at 45%, suggesting alignment between books and markets. Paraguay, Australia, and the UEFA Playoff C winner round out the group."
        },
        {
            question: "What are the odds for USA vs Paraguay at the 2026 World Cup?",
            answer: "USA vs Paraguay is scheduled for June 12, 2026 at SoFi Stadium in Inglewood, California. DraftKings lists USA at approximately -160, Paraguay at +380, and the draw at +280. Prediction markets suggest USA has a 58% chance of winning the opening match."
        },
        {
            question: "Where is World Cup 2026 Group D being played?",
            answer: "Group D matches are hosted across four American venues: SoFi Stadium in Inglewood, California; Lumen Field in Seattle, Washington; Mercedes-Benz Stadium in Atlanta, Georgia; and Lincoln Financial Field in Philadelphia, Pennsylvania."
        },
        {
            question: "What is a cross-ecosystem edge?",
            answer: "A cross-ecosystem edge is the mathematical gap between what a sportsbook implies a team's probability is and what an independent pricing source like a prediction market implies. The gap represents a measurable discrepancy between two pricing mechanisms for the same outcome."
        }
    ];

    const groupSchema = generateGroupSchema(groupD, faqs);

    return (
        <Layout>
            <SchemaScript schema={groupSchema} />

            <GroupHeader groupLetter={groupD.letter} teams={groupD.teams} />

            {/* Overview */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-[var(--emerald)]/30" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--emerald)] uppercase font-[500] font-sans">
                        Group Winner Markets
                    </span>
                </div>

                <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed mb-10 max-w-2xl">
                    The United States enters as Group D favorites at +125 on DraftKings, implying 44.4% win probability.
                    Kalshi prices USA group winners at 45¢, implying 45%. The narrow gap reflects tight consensus between
                    sportsbook and prediction market pricing on the host nation.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                    <EdgeCard
                        marketName="USA to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+125"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="45¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={0.6}
                        confidence="low"
                        volume={124000}
                        link="/edges/usa-to-win-group-d"
                    />
                    <EdgeCard
                        marketName="Paraguay to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+800"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="10¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={1.1}
                        confidence="low"
                        volume={12000}
                        link="/edges/paraguay-to-win-group-d"
                    />
                    <EdgeCard
                        marketName="Australia to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+600"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="14¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={2.4}
                        confidence="low"
                        volume={8500}
                        link="/edges/australia-to-win-group-d"
                    />
                </div>
            </section>

            {/* USA Opener */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        Opening Match
                    </span>
                </div>

                <h2 className="text-2xl font-sans font-[200] text-[var(--ivory)] mb-3">
                    USA vs Paraguay
                </h2>
                <p className="text-[13px] text-[var(--silver)] font-sans mb-1">
                    Friday, June 12 · 9:00 PM ET · SoFi Stadium, Inglewood
                </p>
                <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed mb-8 max-w-2xl">
                    DraftKings lists USA at -160 (61.5% implied). Kalshi prices USA to win this match
                    at 58¢ (58% implied). The 3.5% discrepancy suggests marginal sportsbook overconfidence
                    in the hosts for the opening fixture.
                </p>

                <div className="max-w-sm">
                    <EdgeCard
                        marketName="USA to Beat Paraguay"
                        sportsbookName="DraftKings"
                        sportsbookOdds="-160"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="58¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={3.5}
                        confidence="medium"
                        volume={32000}
                        link="/edges/par-vs-usa-2026-06-12"
                    />
                </div>
            </section>

            {/* Edge Analysis */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        Edge Analysis
                    </span>
                </div>

                <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed max-w-2xl">
                    Group D contains a notable host-nation pricing dynamic. The USA group winner market
                    shows narrow alignment between sportsbook consensus and prediction market pricing,
                    suggesting the home-crowd betting effect is already priced in. The larger edges in this
                    group sit on match-level moneylines rather than futures, where sportsbook liability
                    management creates wider gaps against prediction market order books.
                </p>
            </section>

            {/* Match Schedule */}
            <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        Match Schedule
                    </span>
                </div>

                <div className="rounded-[var(--radius-lg)] bg-[var(--card-bg)] border border-[var(--card-border)] p-4">
                    {groupD.matches.map((match, i) => (
                        <MatchRow
                            key={i}
                            homeTeam={match.homeTeam.name}
                            awayTeam={match.awayTeam.name}
                            kickoff={match.kickoff}
                            venue={`${match.venue.name}, ${match.venue.city}`}
                        />
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="mb-12 border-t border-[var(--card-border)] pt-16">
                <div className="flex items-center gap-3 mb-10">
                    <div className="h-[1px] w-8 bg-white/10" />
                    <span className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans">
                        FAQ
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <h3 className="text-[14px] text-[var(--ivory)] font-[500] mb-3 font-sans leading-snug">
                                {faq.question}
                            </h3>
                            <p className="text-[13px] text-[var(--mist)] leading-relaxed font-sans">
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
};

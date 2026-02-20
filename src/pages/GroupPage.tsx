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
            answer: "The United States is favored to win Group D at +150 odds (40% implied probability) on major sportsbooks. Prediction markets price USA at 45%, suggesting the hosts have a slightly higher chance than sportsbooks reflect. Chile, Ecuador, and Peru are viable challengers with combined implied probability of approximately 55%."
        },
        {
            question: "What are the odds for USA vs Chile at the 2026 World Cup?",
            answer: "USA vs Chile is scheduled for June 13, 2026 at SoFi Stadium. DraftKings lists USA at approximately -160, Chile at +380, and the draw at +280. Prediction markets suggest USA has a 58% chance of winning the match."
        },
        {
            question: "Where is World Cup 2026 Group D being played?",
            answer: "Group D matches are hosted across three American venues: SoFi Stadium in Inglewood, California; Q2 Stadium in Austin, Texas; and MetLife Stadium in East Rutherford, New Jersey. The USA plays their matches at SoFi Stadium and MetLife Stadium."
        },
        {
            question: "What is the edge in sports betting?",
            answer: "Edge is the mathematical gap between what a sportsbook implies a team's probability is (derived from their odds) and what an independent pricing source like a prediction market implies. A positive edge suggests the sportsbook line offers more value than the market-derived probability indicates."
        }
    ];

    const groupSchema = generateGroupSchema(groupD, faqs);

    return (
        <Layout>
            <SchemaScript schema={groupSchema} />

            <GroupHeader groupLetter={groupD.letter} teams={groupD.teams} />

            <section className="mb-20">
                <h2 className="text-2xl font-sans font-[300] mb-8 text-[var(--ivory)] flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-[var(--emerald)]/40" />
                    Group D Overview
                </h2>
                <p className="text-lg text-[var(--silver)] leading-relaxed mb-12 max-w-4xl italic font-serif">
                    "The United States enters World Cup 2026 Group D as favorites at +150 on DraftKings, implying 40% win probability. Prediction markets on Kalshi price USA group winners at 45 cents, implying 45%. The 5.0% gap suggests sportsbooks are undervaluing the host nation's advantage at SoFi Stadium and MetLife Stadium."
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <EdgeCard
                        marketName="USA to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+150"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="45¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={5.2}
                        confidence="high"
                        volume={124000}
                    />
                    <EdgeCard
                        marketName="Chile to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+350"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="22¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={3.2}
                        confidence="medium"
                        volume={48000}
                    />
                    <EdgeCard
                        marketName="Ecuador to Win Group D"
                        sportsbookName="DraftKings"
                        sportsbookOdds="+280"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="25¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={2.4}
                        confidence="low"
                        volume={8500}
                    />
                </div>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-sans font-[300] mb-8 text-[var(--ivory)] flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-[var(--emerald)]/40" />
                    USA vs Chile
                </h2>
                <p className="text-lg text-[var(--silver)] leading-relaxed mb-12 max-w-4xl italic font-serif">
                    "USA vs Chile kicks off June 13 at SoFi Stadium in Inglewood, California. DraftKings lists USA at -160 (61.5% implied). Kalshi prices USA to win this match at 58 cents (58% implied). The 3.5% discrepancy indicates marginal sportsbook overconfidence in the hosts for the opening fixture."
                </p>
                <div className="max-w-md">
                    <EdgeCard
                        marketName="USA to Win Match 1"
                        sportsbookName="DraftKings"
                        sportsbookOdds="-160"
                        sportsbookLink="https://www.draftkings.com"
                        predictionName="Kalshi"
                        predictionPrice="58¢"
                        predictionLink="https://www.kalshi.com"
                        edgePercentage={3.5}
                        confidence="medium"
                        volume={32000}
                    />
                </div>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-sans font-[300] mb-8 text-[var(--ivory)] flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-[var(--emerald)]/40" />
                    Edge Analysis
                </h2>
                <p className="text-lg text-[var(--silver)] leading-relaxed max-w-4xl italic font-serif">
                    "Group D contains the largest host-nation pricing gap in the 2026 World Cup. Across all 12 groups, the USA group winner market shows a 5.2% edge between sportsbook consensus and prediction market pricing. This gap is driven by emotional home-crowd betting inflating sportsbook liability, while prediction markets reflect sharper probability assessment." [1]
                </p>
            </section>

            <section className="mb-20">
                <h2 className="text-2xl font-sans font-[300] mb-8 text-[var(--ivory)] flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-[var(--emerald)]/40" />
                    Match Schedule
                </h2>
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6">
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

            <section className="mb-20 border-t border-[var(--card-border)] pt-16">
                <h2 className="text-xl font-sans font-[300] mb-12 text-[var(--silver)] uppercase tracking-[0.2em]">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                    {faqs.map((faq, i) => (
                        <div key={i} className="group">
                            <h3 className="text-[var(--ivory)] font-[500] mb-4 font-sans group-hover:text-[var(--emerald)] transition-colors">{faq.question}</h3>
                            <p className="text-[var(--silver)] text-sm leading-relaxed font-sans">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
};

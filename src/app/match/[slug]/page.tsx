import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LiveOddsClient from './LiveOddsClient';
import { ALL_MATCHES } from '../../../data/all-matches';
import { getMatchPageData } from '../../../../lib/match-page';

type MatchPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
    return ALL_MATCHES.map((match) => ({
        slug: match.slug,
    }));
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const matchPage = await getMatchPageData(resolvedParams.slug);

    if (!matchPage) {
        return {
            title: 'Match not found',
        };
    }

    return {
        title: matchPage.title,
        description: matchPage.description,
        alternates: {
            canonical: matchPage.url,
        },
        openGraph: {
            description: matchPage.description,
            siteName: 'The Drip',
            title: matchPage.title,
            type: 'website',
            url: matchPage.url,
        },
        twitter: {
            card: 'summary_large_image',
            description: matchPage.description,
            title: matchPage.title,
        },
    };
}

export default async function MatchPage({ params }: MatchPageProps) {
    const resolvedParams = await params;
    const matchPage = await getMatchPageData(resolvedParams.slug);

    if (!matchPage) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${matchPage.homeTeam} vs ${matchPage.awayTeam} ${matchPage.competitionLabel}`,
        sport: 'Soccer',
        url: matchPage.url,
        startDate: matchPage.kickoff,
        description: matchPage.description,
        location: {
            '@type': 'Place',
            name: matchPage.venue,
            address: {
                '@type': 'PostalAddress',
                addressLocality: matchPage.venueLine.replace(`${matchPage.venue} • `, ''),
            },
        },
        homeTeam: {
            '@type': 'SportsTeam',
            name: matchPage.homeTeam,
        },
        awayTeam: {
            '@type': 'SportsTeam',
            name: matchPage.awayTeam,
        },
        competitor: [
            {
                '@type': 'SportsTeam',
                name: matchPage.homeTeam,
            },
            {
                '@type': 'SportsTeam',
                name: matchPage.awayTeam,
            },
        ],
        offers: {
            '@type': 'AggregateOffer',
            category: 'Sports Betting Odds',
            offerCount: 1,
            url: matchPage.url,
        },
    };

    return (
        <main className="app-shell">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="match-shell">
                <header className="hero-card">
                    <p className="eyebrow">{matchPage.competitionLabel}</p>
                    <h1 className="hero-title">{matchPage.homeTeam} vs {matchPage.awayTeam}</h1>
                    <p className="hero-copy">
                        Server-rendered matchup metadata, indexable schema, and live odds hydration for high-intent search traffic.
                    </p>

                    <dl className="meta-grid">
                        <div>
                            <dt>Kickoff</dt>
                            <dd>{matchPage.kickoffLabel}</dd>
                        </div>
                        <div>
                            <dt>Venue</dt>
                            <dd>{matchPage.venueLine}</dd>
                        </div>
                        <div>
                            <dt>Round</dt>
                            <dd>{matchPage.phaseLabel}</dd>
                        </div>
                        <div>
                            <dt>SSR source</dt>
                            <dd>{matchPage.source === 'database' ? 'Supabase snapshot' : 'Schedule fallback'}</dd>
                        </div>
                    </dl>
                </header>

                <LiveOddsClient
                    slug={matchPage.slug}
                    homeTeam={matchPage.homeTeam}
                    awayTeam={matchPage.awayTeam}
                    initialHomeOdds={matchPage.homeOdds}
                    initialAwayOdds={matchPage.awayOdds}
                    initialDrawOdds={matchPage.drawOdds}
                    source={matchPage.source}
                />
            </div>
        </main>
    );
}

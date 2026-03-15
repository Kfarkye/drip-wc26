import type { Metadata } from 'next';
import Link from 'next/link';
import { getTodayPageData } from '../../../lib/today-page';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Today’s Match Slate & Betting Pulse',
    description: 'Server-rendered daily slate, pricing leaders, and fallback World Cup 2026 watchlist when the current board is quiet.',
    alternates: {
        canonical: 'https://thedrip.to/today',
    },
    openGraph: {
        title: 'Today’s Match Slate & Betting Pulse',
        description: 'See the daily slate, market leaders, and the next World Cup 2026 window in one crawlable route.',
        type: 'website',
        url: 'https://thedrip.to/today',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Today’s Match Slate & Betting Pulse',
        description: 'Daily slate, market leaders, and the next World Cup 2026 watch window.',
    },
};

function buildOpportunityCopy(params: {
    isFallbackDate: boolean;
    requestedDateLabel: string;
    windowDateLabel: string;
    sameLeader: boolean;
    topFavorite: string;
    topVolume: string;
}): string {
    if (params.isFallbackDate) {
        return `No matches are scheduled for ${params.requestedDateLabel}, so this page rolls forward to ${params.windowDateLabel} to keep the World Cup watchlist live.`;
    }

    if (params.sameLeader) {
        return `${params.topFavorite} leads both price and volume. Watch for momentum-driven overpricing as kickoff gets closer.`;
    }

    return `${params.topFavorite} leads outright pricing while ${params.topVolume} leads flow. Divergence like that is where the board gets interesting.`;
}

export default async function TodayPage() {
    const data = await getTodayPageData();
    const opportunityCopy = buildOpportunityCopy({
        isFallbackDate: data.isFallbackDate,
        requestedDateLabel: data.requestedDateLabel,
        windowDateLabel: data.windowDateLabel,
        sameLeader: data.sameLeader,
        topFavorite: data.topFavorite.name,
        topVolume: data.topVolume.name,
    });

    const intro = data.isFallbackDate
        ? `There are no scheduled matches on ${data.requestedDateLabel}, so this route is surfacing the next World Cup matchday on ${data.windowDateLabel}.`
        : `Server-rendered slate coverage for ${data.windowDateLabel}, with grouped fixtures and a fast market read before users hydrate into live odds.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Today’s Match Slate & Betting Pulse',
        url: 'https://thedrip.to/today',
        description: intro,
        hasPart: data.groups.flatMap((group) =>
            group.matches.map((match) => ({
                '@type': 'SportsEvent',
                name: `${match.homeTeam} vs ${match.awayTeam}`,
                sport: group.sportLabel,
                startDate: match.kickoff,
                location: {
                    '@type': 'Place',
                    name: match.venue,
                },
                ...(match.slug
                    ? { url: `https://thedrip.to/match/${match.slug}` }
                    : {}),
            })),
        ),
    };

    return (
        <main className="app-shell">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="match-shell">
                <header className="hero-card today-hero">
                    <div className="eyebrow-row">
                        <p className="eyebrow">Daily Slate</p>
                        <span className="status-pill status-snapshot">{data.sourceLabel}</span>
                    </div>
                    <h1 className="hero-title">Today</h1>
                    <p className="hero-copy">{intro}</p>

                    <dl className="meta-grid">
                        <div>
                            <dt>Requested Date</dt>
                            <dd>{data.requestedDateLabel}</dd>
                        </div>
                        <div>
                            <dt>Displayed Window</dt>
                            <dd>{data.windowDateLabel}</dd>
                        </div>
                        <div>
                            <dt>Tracked Matches</dt>
                            <dd>{data.totalMatches}</dd>
                        </div>
                    </dl>
                </header>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Daily Market Pulse</h2>
                        <p>Static server-side cards keep the route crawlable while the live market layer continues to hydrate on the client elsewhere.</p>
                    </div>
                    <div className="link-grid">
                        <article className="match-link-card">
                            <strong>{data.topFavorite.name} {data.topFavorite.odds}</strong>
                            <span>{data.topFavorite.implied} implied tournament win probability.</span>
                            <span className="today-card-foot">Favorite of the board</span>
                            <Link href={`/group/${data.topFavorite.group.toLowerCase()}`} className="today-inline-link">
                                Open Group {data.topFavorite.group}
                            </Link>
                        </article>

                        <article className="match-link-card">
                            <strong>{data.topVolume.name} {data.topVolume.amount}</strong>
                            <span>{data.topVolume.pct} of {data.volumeTotal} tracked market handle.</span>
                            <span className="today-card-foot">Volume leader</span>
                            <Link href="/" className="today-inline-link">
                                Open market hub
                            </Link>
                        </article>

                        <article className="match-link-card">
                            <strong>Opportunity signal</strong>
                            <span>{opportunityCopy}</span>
                            <span className="today-card-foot">What to watch</span>
                        </article>
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>{data.isFallbackDate ? 'Next-Up Match Schedule' : 'Match Schedule'}</h2>
                        <p>
                            {data.isFallbackDate
                                ? `Because the requested date is quiet, this list shows the next scheduled World Cup window on ${data.windowDateLabel}.`
                                : `Grouped fixtures for ${data.windowDateLabel}, ready to link into the migrated matchup routes where slugs are available.`}
                        </p>
                    </div>

                    {data.groups.length === 0 ? (
                        <div className="today-empty">
                            No matches were available for the requested window.
                        </div>
                    ) : (
                        <div className="today-group-stack">
                            {data.groups.map((group) => (
                                <section key={group.key} className="today-group-block">
                                    <div className="today-group-header">
                                        <div>
                                            <h3>{group.leagueLabel}</h3>
                                            <p>{group.sportLabel}</p>
                                        </div>
                                        <span>{group.matches.length} matches</span>
                                    </div>

                                    <div className="schedule-list">
                                        {group.matches.map((match) => {
                                            const content = (
                                                <>
                                                    <div className="schedule-meta">
                                                        <span>{match.matchNumber ? `Match ${match.matchNumber}` : group.leagueLabel}</span>
                                                        <span>{match.kickoffLabel}</span>
                                                    </div>
                                                    <strong>{match.homeTeam} vs {match.awayTeam}</strong>
                                                    <span>{match.venue}</span>
                                                    <span className="today-card-foot">
                                                        {match.slug ? 'Open matchup' : 'Schedule snapshot'}
                                                    </span>
                                                </>
                                            );

                                            return match.slug ? (
                                                <Link key={match.id} href={`/match/${match.slug}`} className="schedule-card">
                                                    {content}
                                                </Link>
                                            ) : (
                                                <article key={match.id} className="schedule-card schedule-card-muted">
                                                    {content}
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

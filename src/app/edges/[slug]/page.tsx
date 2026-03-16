import type { Metadata } from 'next';
import Link from 'next/link';
import { getFlagUrl } from '../../../lib/flags';
import {
    formatStatValue,
    getEdgePageData,
    getEdgeStaticMatches,
    statShares,
} from '../../../../lib/edge-page';

type EdgePageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export const revalidate = 300;

export function generateStaticParams() {
    return getEdgeStaticMatches().map((match) => ({ slug: match.slug }));
}

export async function generateMetadata({ params }: EdgePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const data = getEdgePageData(resolvedParams.slug);

    return {
        title: data.title,
        description: data.description,
        alternates: {
            canonical: data.canonicalUrl,
        },
        openGraph: {
            title: data.title,
            description: data.description,
            type: 'article',
            url: data.canonicalUrl,
        },
        twitter: {
            card: 'summary_large_image',
            title: data.title,
            description: data.description,
        },
    };
}

function eventClass(type: string): string {
    if (type === 'goal') return 'edge-event edge-event-goal';
    if (type === 'card') return 'edge-event edge-event-card';
    if (type === 'sub') return 'edge-event edge-event-sub';
    return 'edge-event';
}

export default async function EdgePage({ params }: EdgePageProps) {
    const resolvedParams = await params;
    const data = getEdgePageData(resolvedParams.slug);
    const awayFlag = getFlagUrl(data.awayCode);
    const homeFlag = getFlagUrl(data.homeCode);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: `${data.awayTeam} vs ${data.homeTeam}`,
        startDate: data.kickoff,
        url: data.canonicalUrl,
        location: {
            '@type': 'Place',
            name: data.venueLine,
        },
        competitor: [
            { '@type': 'SportsTeam', name: data.awayTeam },
            { '@type': 'SportsTeam', name: data.homeTeam },
        ],
        description: data.description,
    };

    return (
        <main className="app-shell">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="match-shell">
                <header className="hero-card edge-hero">
                    <div className="eyebrow-row">
                        <Link href={`/group/${data.groupLetter.toLowerCase()}`} className="today-inline-link">
                            Group {data.groupLetter}
                        </Link>
                        <span className="status-pill status-snapshot">{data.kickoffLabel}</span>
                    </div>

                    <div className="edge-scoreboard">
                        <div className="edge-team-col">
                            {awayFlag ? <img src={awayFlag} alt={data.awayTeam} className="edge-flag" /> : <div className="edge-flag-fallback" />}
                            <strong>{data.awayTeam}</strong>
                        </div>

                        <div className="edge-score-col">
                            <div className="edge-score-line">
                                <span>{data.status === 'scheduled' ? '-' : data.score.away}</span>
                                <span className="edge-score-divider">-</span>
                                <span>{data.status === 'scheduled' ? '-' : data.score.home}</span>
                            </div>
                            <p>{data.statusLabel}</p>
                            <small>{data.eventLabel}</small>
                        </div>

                        <div className="edge-team-col">
                            {homeFlag ? <img src={homeFlag} alt={data.homeTeam} className="edge-flag" /> : <div className="edge-flag-fallback" />}
                            <strong>{data.homeTeam}</strong>
                        </div>
                    </div>

                    <p className="hero-copy">{data.description}</p>

                    <dl className="meta-grid">
                        <div>
                            <dt>Venue</dt>
                            <dd>{data.venueLine}</dd>
                        </div>
                        <div>
                            <dt>AI Edge</dt>
                            <dd>{data.edgeTeam} {data.edgeSize}%</dd>
                        </div>
                        <div>
                            <dt>Confidence</dt>
                            <dd>{data.confidence}</dd>
                        </div>
                    </dl>
                </header>

                <section className="panel">
                    <div className="panel-header">
                        <h2>AI Edge Signal</h2>
                        <p>Server-rendered edge context so the old `/edges` footprint remains indexable while the richer data layer evolves.</p>
                    </div>
                    <div className="link-grid">
                        <article className="match-link-card">
                            <strong>{data.edgeTeam} edge: {data.edgeSize}%</strong>
                            <span>Confidence {data.confidence}. Expected goals gap {data.xgGap >= 0 ? '+' : ''}{data.xgGap.toFixed(2)}.</span>
                            <span className="today-card-foot">Pressure signal</span>
                        </article>
                        <article className="match-link-card">
                            <strong>Shot gap {data.shotGap >= 0 ? '+' : ''}{data.shotGap}</strong>
                            <span>{data.homeTeam} vs {data.awayTeam} shot volume split is part of the current edge profile.</span>
                            <span className="today-card-foot">Volume signal</span>
                        </article>
                        <article className="match-link-card">
                            <strong>Match page</strong>
                            <span>Open the migrated matchup route for odds hydration and kickoff metadata.</span>
                            <Link href={`/match/${data.slug}`} className="today-inline-link">
                                Open matchup
                            </Link>
                        </article>
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Match Overview</h2>
                        <p>Three key metrics are surfaced first so the read is fast on mobile and still rich enough for search indexing.</p>
                    </div>
                    <div className="edge-stat-stack">
                        {[data.possession, data.xg, data.shots].map((row) => {
                            const shares = statShares(row);
                            return (
                                <article key={row.key} className="edge-stat-card">
                                    <div className="edge-stat-values">
                                        <span>{formatStatValue(row, row.away)}</span>
                                        <strong>{row.label}</strong>
                                        <span>{formatStatValue(row, row.home)}</span>
                                    </div>
                                    <div className="edge-stat-bar">
                                        <div className="edge-stat-away" style={{ width: `${shares.away}%` }} />
                                        <div className="edge-stat-home" style={{ width: `${shares.home}%` }} />
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Key Moments</h2>
                        <p>Condensed match narrative based on the seeded event timeline from the original edge experience.</p>
                    </div>
                    <div className="edge-event-list">
                        {data.keyTimeline.map((event) => (
                            <article key={event.id} className={eventClass(event.type)}>
                                <span>{event.minute}</span>
                                <p>{event.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Projected Group Table</h2>
                        <p>Standing projection keeps the group stakes visible without requiring a client-only shell.</p>
                    </div>
                    <div className="favorites-table-wrap">
                        <table className="favorites-table edge-table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>P</th>
                                    <th>GD</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.standings.map((row) => (
                                    <tr key={row.code}>
                                        <td>{row.name}</td>
                                        <td>{row.played}</td>
                                        <td>{row.diff >= 0 ? `+${row.diff}` : row.diff}</td>
                                        <td>{row.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Group {data.groupLetter} Match Grid</h2>
                        <p>Cross-links preserve the old edge-cluster behavior and help search engines understand the group-level relationship graph.</p>
                    </div>
                    <div className="group-grid">
                        {data.relatedMatches.map((match) => {
                            const current = match.slug === data.slug;
                            return current ? (
                                <article key={match.slug} className="group-card edge-related-current">
                                    <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                                    <p className="group-tagline">{new Date(match.kickoff).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </article>
                            ) : (
                                <Link key={match.slug} href={`/edges/${match.slug}`} className="group-card">
                                    <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                                    <p className="group-tagline">{new Date(match.kickoff).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { allGroups } from '../data/groups';
import { getFlagUrl } from '../lib/flags';
import {
    HOME_BRACKET_STEPS,
    HOME_FACTS,
    HOME_FAVORITES,
    HOME_GROUP_META,
    HOME_MARKET_DEPTH,
} from '../../lib/home-page-data';

export const metadata: Metadata = {
    title: 'World Cup 2026 Betting Markets',
    description: 'Track World Cup 2026 prices, market handle, favorites, and group-by-group betting context in one server-rendered landing page.',
    alternates: {
        canonical: 'https://thedrip.to/',
    },
    openGraph: {
        title: 'World Cup 2026 Betting Markets',
        description: 'See sportsbook pricing, market depth, and group-by-group World Cup 2026 context without tab-hopping.',
        type: 'website',
        url: 'https://thedrip.to/',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'World Cup 2026 Betting Markets',
        description: 'Server-rendered World Cup 2026 favorites, market handle, and group-by-group pricing context.',
    },
};

const TOTAL_VOLUME = '$223.3M';

function bracketStepClass(isFinal?: boolean): string {
    return isFinal ? 'bracket-step bracket-step-final' : 'bracket-step';
}

export default function HomePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'World Cup 2026 Betting Markets',
        url: 'https://thedrip.to/',
        description: 'World Cup 2026 betting hub with favorites, market handle, and group-by-group pricing pages.',
        hasPart: Object.keys(allGroups).map((letter) => ({
            '@type': 'WebPage',
            name: `World Cup 2026 Group ${letter}`,
            url: `https://thedrip.to/group/${letter.toLowerCase()}`,
        })),
    };

    return (
        <main className="app-shell">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="hero-card home-hero">
                <p className="eyebrow">World Cup 2026 Betting Markets</p>
                <h1 className="hero-title">Find better World Cup prices before they move.</h1>
                <p className="hero-copy">
                    The Drip puts sportsbook numbers, market flow, and tournament context in one place so you can
                    see where the price is wrong before the market catches up.
                </p>

                <div className="home-summary-grid">
                    <article className="summary-card">
                        <span className="summary-label">Tracked Volume</span>
                        <strong>{TOTAL_VOLUME}</strong>
                        <span>Polymarket-led liquidity map across the outright board.</span>
                    </article>
                    <article className="summary-card">
                        <span className="summary-label">Top Favorite</span>
                        <strong>{HOME_FAVORITES[0].name} {HOME_FAVORITES[0].odds}</strong>
                        <span>{HOME_FAVORITES[0].implied} implied tournament win probability.</span>
                    </article>
                    <article className="summary-card">
                        <span className="summary-label">Best Entry Point</span>
                        <strong>Group pages</strong>
                        <span>Read every section with venue context, schedule links, and structured schema.</span>
                    </article>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>Market Handle Distribution</h2>
                    <p>Use volume concentration as a quick read on where public conviction is piling up before prices drift.</p>
                </div>
                <div className="market-depth-stack">
                    {HOME_MARKET_DEPTH.map((row) => (
                        <div key={row.code} className="market-depth-row">
                            <div className="market-depth-team">
                                {getFlagUrl(row.code) ? (
                                    <img
                                        src={getFlagUrl(row.code)!}
                                        alt={row.name}
                                        className="market-flag"
                                    />
                                ) : null}
                                <span>{row.code}</span>
                            </div>
                            <div className="market-depth-bar">
                                <div
                                    className={row.isLeader ? 'market-depth-fill market-depth-fill-leader' : 'market-depth-fill'}
                                    style={{ width: `${row.width}%` }}
                                >
                                    <span>{row.amount}</span>
                                </div>
                            </div>
                            <span className="market-depth-pct">{row.pct}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>Tournament Favorites</h2>
                    <p>Static server-rendered baseline for outright pricing while live pages continue to hydrate from the client.</p>
                </div>
                <div className="favorites-table-wrap">
                    <table className="favorites-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team</th>
                                <th>Group</th>
                                <th>Odds</th>
                                <th>Implied</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HOME_FAVORITES.map((team, index) => (
                                <tr key={team.code}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="favorite-team-cell">
                                            {getFlagUrl(team.code) ? (
                                                <img
                                                    src={getFlagUrl(team.code)!}
                                                    alt={team.name}
                                                    className="market-flag"
                                                />
                                            ) : null}
                                            <div>
                                                <strong>{team.name}</strong>
                                                <span>{team.desc}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Group {team.group}</td>
                                    <td className="favorite-odds">{team.odds}</td>
                                    <td>
                                        <div className="favorite-implied-cell">
                                            <span>{team.implied}</span>
                                            <div className="favorite-meter">
                                                <div className="favorite-meter-fill" style={{ width: `${team.pct}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>Format Funnel</h2>
                    <p>The expanded tournament changes the price landscape. More teams advance, but the winner still needs to survive more rounds.</p>
                </div>
                <div className="bracket-row">
                    {HOME_BRACKET_STEPS.map((step) => (
                        <div key={step.label} className={bracketStepClass(step.isFinal)}>
                            <strong>{step.num}</strong>
                            <span>{step.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>Group-By-Group Breakdown</h2>
                    <p>Jump from the landing page straight into crawlable group intel and then into individual match pages.</p>
                </div>
                <div className="group-grid">
                    {Object.entries(allGroups).map(([letter, group]) => {
                        const meta = HOME_GROUP_META[letter];

                        return (
                            <Link key={letter} href={`/group/${letter.toLowerCase()}`} className="group-card">
                                <div className="group-card-header">
                                    <h3>Group {letter}</h3>
                                    {meta?.badge ? (
                                        <span className={`group-badge badge-${meta.badgeType ?? 'host'}`}>{meta.badge}</span>
                                    ) : null}
                                </div>
                                <div className="group-team-list">
                                    {group.teams.map((team) => (
                                        <div key={team.code} className="group-team-row">
                                            <span className="group-team-flag" aria-hidden="true">{team.flag}</span>
                                            <span>{team.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="group-tagline">{meta?.tagline ?? 'Open group context'}</p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h2>Format Facts</h2>
                    <p>These are the structural reasons futures markets behave differently in the 48-team era.</p>
                </div>
                <div className="fact-grid">
                    {HOME_FACTS.map((fact) => (
                        <article key={fact.label} className="fact-card">
                            <strong>{fact.num}</strong>
                            <span>{fact.label}</span>
                            <p>{fact.desc}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

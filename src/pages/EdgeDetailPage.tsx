import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { allGroups } from '../data/groups';

/** Attempt to find a match in our data that corresponds to this slug */
function findMatchBySlug(slug: string) {
    // Match slugs like "par-vs-usa-2026-06-12"
    const parts = slug.match(/^([a-z0-9]+)-vs-([a-z0-9]+)-(\d{4}-\d{2}-\d{2})$/);
    if (!parts) return null;

    const [, awayCode, homeCode, dateStr] = parts;

    for (const group of Object.values(allGroups)) {
        for (const match of group.matches) {
            const hCode = match.homeTeam.code.toLowerCase();
            const aCode = match.awayTeam.code.toLowerCase();
            const matchDate = match.kickoff.split('T')[0];

            if (
                ((hCode === homeCode && aCode === awayCode) ||
                 (hCode === awayCode && aCode === homeCode)) &&
                matchDate === dateStr
            ) {
                return { match, group };
            }
        }
    }
    return null;
}

function formatDate(kickoff: string): string {
    const d = new Date(kickoff);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(kickoff: string): string {
    const d = new Date(kickoff);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

export const EdgeDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    if (!slug) return null;

    const result = findMatchBySlug(slug);

    // Readable title from slug
    const displayTitle = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/ Vs /, ' vs ')
        .replace(/\d{4} \d{2} \d{2}$/, '')
        .trim();

    return (
        <Layout>
            {/* Breadcrumb */}
            <div className="mb-8 animate-fade-in">
                <Link
                    to={result ? `/group/${result.group.letter.toLowerCase()}` : '/'}
                    className="text-[13px] text-[var(--silver)] hover:text-[var(--ivory)] transition-colors font-sans inline-flex items-center gap-1"
                >
                    <span>&larr;</span>
                    <span>{result ? `Group ${result.group.letter}` : 'Hub'}</span>
                </Link>
            </div>

            {result ? (
                <div className="animate-breathe-in">
                    {/* Match header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[1px] w-8 bg-[var(--emerald)]/30" />
                        <span className="text-[10px] tracking-[0.2em] text-[var(--emerald)] uppercase font-[500] font-sans">
                            Group {result.group.letter} · Match {result.match.matchNumber}
                        </span>
                    </div>

                    <h1 className="text-[clamp(28px,5vw,44px)] font-sans font-[200] tracking-tight text-[var(--ivory)] mb-2 leading-tight">
                        {result.match.homeTeam.name}
                        <span className="text-[var(--iron)] mx-3 text-[0.6em]">v</span>
                        {result.match.awayTeam.name}
                    </h1>

                    <p className="text-[14px] text-[var(--mist)] font-sans mb-2">
                        {formatDate(result.match.kickoff)} · {formatTime(result.match.kickoff)}
                    </p>
                    <p className="text-[13px] text-[var(--silver)] font-sans mb-10">
                        {result.match.venue.name}, {result.match.venue.city}
                        {result.match.venue.state ? `, ${result.match.venue.state}` : ''}
                    </p>

                    {/* Placeholder for live data */}
                    <div className="rounded-[var(--radius-lg)] bg-[var(--card-bg)] border border-[var(--card-border)] p-8 text-center">
                        <div className="text-[10px] tracking-[0.2em] text-[var(--silver)] uppercase font-[500] font-sans mb-3">
                            Edge Data
                        </div>
                        <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed max-w-md mx-auto">
                            Live odds comparison and edge calculations will populate
                            when sportsbook and prediction market data is connected.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="animate-breathe-in">
                    <h1 className="text-[clamp(28px,5vw,44px)] font-sans font-[200] tracking-tight text-[var(--ivory)] mb-4">
                        {displayTitle}
                    </h1>
                    <div className="rounded-[var(--radius-lg)] bg-[var(--card-bg)] border border-[var(--card-border)] p-8 text-center">
                        <p className="text-[15px] text-[var(--mist)] font-sans leading-relaxed max-w-md mx-auto">
                            Edge breakdown will be available when data pipelines are connected.
                        </p>
                    </div>
                </div>
            )}
        </Layout>
    );
};

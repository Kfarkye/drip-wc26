import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { allGroups } from '../data/groups';
import { getFlagUrl } from '../lib/flags';

function findMatchBySlug(slug: string) {
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
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(kickoff: string): string {
    const d = new Date(kickoff);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

export const EdgeDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    if (!slug) return null;

    const result = findMatchBySlug(slug);

    const displayTitle = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/ Vs /, ' vs ')
        .replace(/\d{4} \d{2} \d{2}$/, '')
        .trim();

    return (
        <Layout>
            <div className="px-5 pt-12 pb-20">
                <div className="max-w-[660px] mx-auto">

                    {/* Breadcrumb */}
                    <div className="mb-8 animate-in">
                        <Link
                            to={result ? `/group/${result.group.letter.toLowerCase()}` : '/'}
                            className="text-[13px] hover:underline inline-flex items-center gap-1"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-500)' }}
                        >
                            ← {result ? `Group ${result.group.letter}` : 'Hub'}
                        </Link>
                    </div>

                    {result ? (
                        <div className="animate-in">
                            <div
                                className="text-[13px] uppercase tracking-[0.05em] mb-4"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--brand-red)' }}
                            >
                                Group {result.group.letter} · Match {result.match.matchNumber}
                            </div>

                            <h1
                                className="mb-3 leading-[1.08] tracking-[-0.02em]"
                                style={{
                                    fontFamily: 'var(--font-prose)',
                                    fontSize: 'clamp(28px, 5vw, 44px)',
                                    fontWeight: 700,
                                    color: 'var(--gray-900)',
                                }}
                            >
                                <span className="inline-flex items-center gap-3">
                                    {getFlagUrl(result.match.homeTeam.code) && (
                                        <img
                                            src={getFlagUrl(result.match.homeTeam.code)!}
                                            alt=""
                                            className="w-8 h-5 object-cover"
                                            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                        />
                                    )}
                                    {result.match.homeTeam.name}
                                </span>
                                <span style={{ color: 'var(--gray-500)', margin: '0 12px', fontSize: '0.6em' }}>v</span>
                                <span className="inline-flex items-center gap-3">
                                    {getFlagUrl(result.match.awayTeam.code) && (
                                        <img
                                            src={getFlagUrl(result.match.awayTeam.code)!}
                                            alt=""
                                            className="w-8 h-5 object-cover"
                                            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset' }}
                                        />
                                    )}
                                    {result.match.awayTeam.name}
                                </span>
                            </h1>

                            <p
                                className="text-sm mb-1"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                            >
                                {formatDate(result.match.kickoff)} · {formatTime(result.match.kickoff)}
                            </p>
                            <p
                                className="text-[13px] mb-10"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                            >
                                {result.match.venue.name}, {result.match.venue.city}
                                {result.match.venue.state ? `, ${result.match.venue.state}` : ''}
                            </p>

                            {/* Data placeholder */}
                            <div
                                className="p-8 text-center"
                                style={{
                                    background: 'var(--gray-50)',
                                    borderTop: '4px solid var(--gray-900)',
                                    borderBottom: '1px solid var(--gray-300)',
                                }}
                            >
                                <div
                                    className="text-[10px] uppercase tracking-[0.08em] mb-3"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                >
                                    Edge Data
                                </div>
                                <p
                                    className="text-[15px] max-w-md mx-auto leading-relaxed"
                                    style={{ fontFamily: 'var(--font-prose)', color: 'var(--gray-800)' }}
                                >
                                    Live odds comparison and edge calculations will populate
                                    when sportsbook and prediction market data pipelines are connected.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in">
                            <h1
                                className="mb-4 leading-[1.08] tracking-[-0.02em]"
                                style={{
                                    fontFamily: 'var(--font-prose)',
                                    fontSize: 'clamp(28px, 5vw, 44px)',
                                    fontWeight: 700,
                                    color: 'var(--gray-900)',
                                }}
                            >
                                {displayTitle}
                            </h1>
                            <div
                                className="p-8 text-center"
                                style={{
                                    background: 'var(--gray-50)',
                                    borderTop: '4px solid var(--gray-900)',
                                    borderBottom: '1px solid var(--gray-300)',
                                }}
                            >
                                <p
                                    className="text-[15px] max-w-md mx-auto leading-relaxed"
                                    style={{ fontFamily: 'var(--font-prose)', color: 'var(--gray-800)' }}
                                >
                                    Edge breakdown will be available when data pipelines are connected.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { MatchRow } from '../components/MatchRow';
import { getMatchesForUtcDate, type TodayMatch } from '../lib/api';
import { useFavorites, useMarketDepth } from '../hooks/useLiveData';

type MatchGroup = {
    key: string;
    sportLabel: string;
    leagueLabel: string;
    matches: TodayMatch[];
};

const toUtcIsoDate = (): string => new Date().toISOString().slice(0, 10);

const groupMatches = (matches: TodayMatch[]): MatchGroup[] => {
    const groups = new Map<string, MatchGroup>();

    for (const match of matches) {
        const key = `${match.sportKey}::${match.leagueKey}`;
        const existing = groups.get(key);
        if (existing) {
            existing.matches.push(match);
            continue;
        }

        groups.set(key, {
            key,
            sportLabel: match.sportLabel,
            leagueLabel: match.leagueLabel,
            matches: [match],
        });
    }

    return Array.from(groups.values()).sort((a, b) => {
        const sportCompare = a.sportLabel.localeCompare(b.sportLabel);
        if (sportCompare !== 0) return sportCompare;
        return a.leagueLabel.localeCompare(b.leagueLabel);
    });
};

const parseLoadErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.trim()) return error.message;
    if (typeof error === 'object' && error !== null) {
        const record = error as { message?: unknown; details?: unknown };
        if (typeof record.message === 'string' && record.message.trim()) return record.message;
        if (typeof record.details === 'string' && record.details.trim()) return record.details;
    }
    return 'Failed to load matches.';
};

const upsertMetaTag = (attr: 'name' | 'property', key: string, content: string): void => {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
};

const upsertCanonical = (href: string): void => {
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', href);
};

const upsertJsonLd = (id: string, payload: Record<string, unknown>): void => {
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
};

export const TodayPage: React.FC = () => {
    const [dateUtc] = useState<string>(toUtcIsoDate);
    const [matches, setMatches] = useState<TodayMatch[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { data: favoritesPayload } = useFavorites();
    const { data: marketDepthPayload } = useMarketDepth();

    useEffect(() => {
        let active = true;

        const load = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const rows = await getMatchesForUtcDate(dateUtc);
                if (active) {
                    setMatches(rows);
                }
            } catch (error) {
                console.error('Today page match query failed', error);
                if (active) {
                    setErrorMessage(parseLoadErrorMessage(error));
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [dateUtc]);

    useEffect(() => {
        const pageTitle = `Today’s World Cup Odds & Match Slate (${dateUtc}) | The Drip`;
        const pageDescription = `Daily World Cup 2026 betting pulse for ${dateUtc}: today’s match slate, pricing leaders, and market volume trends across sportsbook and prediction market data.`;
        const pageUrl = 'https://thedrip.to/today';

        document.title = pageTitle;
        upsertCanonical(pageUrl);
        upsertMetaTag('name', 'description', pageDescription);
        upsertMetaTag('property', 'og:title', pageTitle);
        upsertMetaTag('property', 'og:description', pageDescription);
        upsertMetaTag('property', 'og:url', pageUrl);
        upsertMetaTag('property', 'og:type', 'website');
        upsertMetaTag('name', 'twitter:card', 'summary');
        upsertMetaTag('name', 'twitter:title', pageTitle);
        upsertMetaTag('name', 'twitter:description', pageDescription);

        upsertJsonLd('today-page-ld', {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Today — The Drip',
            url: pageUrl,
            description: pageDescription,
            dateModified: `${dateUtc}T00:00:00.000Z`,
        });
    }, [dateUtc]);

    const grouped = useMemo(() => groupMatches(matches), [matches]);
    const totalMatches = matches.length;
    const topFavorite = favoritesPayload?.data?.[0];
    const topVolume = marketDepthPayload?.data?.[0];
    const volumeTotal = marketDepthPayload?.totalVolume ?? null;
    const sameLeader = !!topFavorite && !!topVolume && topFavorite.name === topVolume.name;
    const favoriteGroupPath = topFavorite?.group ? `/group/${topFavorite.group.toLowerCase()}` : '/';

    return (
        <Layout>
            <div className="px-5 pt-12 pb-20">
                <div className="max-w-[780px] mx-auto">
                    <header className="mb-10">
                        <div
                            className="text-[10px] uppercase tracking-[0.08em] mb-2"
                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                        >
                            Daily Slate
                        </div>
                        <h1
                            className="text-[clamp(30px,5vw,44px)] leading-[1.08] tracking-[-0.02em]"
                            style={{ fontFamily: 'var(--font-prose)', fontWeight: 700, color: 'var(--gray-900)' }}
                        >
                            Today
                        </h1>
                        <p
                            className="mt-2 text-[13px]"
                            style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--gray-500)' }}
                        >
                            UTC Date {dateUtc}
                        </p>
                    </header>

                    <section
                        className="mb-8 rounded-[14px] border p-6 md:p-8"
                        style={{ borderColor: 'var(--gray-200)' }}
                    >
                        <div
                            className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                            style={{ borderColor: 'var(--gray-900)' }}
                        >
                            <h2
                                className="text-xl uppercase tracking-[-0.02em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                            >
                                Daily Market Pulse
                            </h2>
                            <span
                                className="text-[12px] uppercase"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                            >
                                Updated Daily
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <article className="rounded-[10px] border p-4" style={{ borderColor: 'var(--gray-200)' }}>
                                <h3
                                    className="text-[11px] uppercase mb-2"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                >
                                    Favorite Of The Day
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--gray-900)', fontWeight: 700 }}>
                                    {topFavorite ? `${topFavorite.name} ${topFavorite.odds}` : 'Loading live consensus...'}
                                </p>
                                <p className="text-[12px] mt-1" style={{ color: 'var(--gray-500)' }}>
                                    {topFavorite ? `${topFavorite.implied} implied winner probability.` : 'Derived from consensus pricing across books.'}
                                </p>
                            </article>

                            <article className="rounded-[10px] border p-4" style={{ borderColor: 'var(--gray-200)' }}>
                                <h3
                                    className="text-[11px] uppercase mb-2"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                >
                                    Volume Leader
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--gray-900)', fontWeight: 700 }}>
                                    {topVolume ? topVolume.name : 'Loading live volume...'}
                                </p>
                                <p className="text-[12px] mt-1" style={{ color: 'var(--gray-500)' }}>
                                    {topVolume ? `${topVolume.pct} of ${volumeTotal ?? 'tracked'} market volume.` : 'Based on prediction market flow.'}
                                </p>
                            </article>

                            <article className="rounded-[10px] border p-4" style={{ borderColor: 'var(--gray-200)' }}>
                                <h3
                                    className="text-[11px] uppercase mb-2"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                >
                                    Daily Opportunity
                                </h3>
                                <p className="text-[12px]" style={{ color: 'var(--gray-700)' }}>
                                    {topFavorite && topVolume
                                        ? sameLeader
                                            ? `${topFavorite.name} leads both price and volume. Monitor for overreaction before kickoff windows.`
                                            : `${topFavorite.name} leads pricing while ${topVolume.name} leads flow. Divergence like this is where mispricing can emerge.`
                                        : 'Watch for pricing-flow divergence as liquidity builds throughout the day.'}
                                </p>
                                <div className="mt-3 flex gap-3">
                                    <Link
                                        to={favoriteGroupPath}
                                        className="text-[12px] uppercase"
                                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-900)' }}
                                    >
                                        Open Group Intel
                                    </Link>
                                    <Link
                                        to="/"
                                        className="text-[12px] uppercase"
                                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                                    >
                                        Open Hub
                                    </Link>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section
                        className="mb-16 rounded-[14px] border p-6 md:p-8"
                        style={{ borderColor: 'var(--gray-200)' }}
                    >
                        <div
                            className="flex items-baseline justify-between pb-2 mb-6 border-b-[3px]"
                            style={{ borderColor: 'var(--gray-900)' }}
                        >
                            <h2
                                className="text-xl uppercase tracking-[-0.02em]"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 800 }}
                            >
                                Match Schedule
                            </h2>
                            <span
                                className="text-[13px] uppercase"
                                style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: 'var(--gray-500)' }}
                            >
                                {totalMatches} Matches
                            </span>
                        </div>

                        {isLoading ? (
                            <div
                                className="rounded-[10px] border px-5 py-6 text-sm"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-500)' }}
                            >
                                Loading today&apos;s matches...
                            </div>
                        ) : null}

                        {!isLoading && errorMessage ? (
                            <div
                                className="rounded-[10px] border px-5 py-6 text-sm"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-500)' }}
                            >
                                Failed to load today&apos;s matches: {errorMessage}
                            </div>
                        ) : null}

                        {!isLoading && !errorMessage && grouped.length === 0 ? (
                            <div
                                className="rounded-[10px] border px-5 py-6 text-sm"
                                style={{ borderColor: 'var(--gray-200)', color: 'var(--gray-500)' }}
                            >
                                No matches scheduled today.
                            </div>
                        ) : null}

                        {!isLoading && !errorMessage && grouped.length > 0 ? (
                            <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: 'var(--gray-200)' }}>
                                {grouped.map((group) => (
                                    <div key={group.key} className="border-b last:border-b-0" style={{ borderColor: 'var(--gray-200)' }}>
                                        <div
                                            className="px-4 py-3 text-[10px] uppercase tracking-[0.08em]"
                                            style={{
                                                fontFamily: 'var(--font-ui)',
                                                fontWeight: 800,
                                                color: 'var(--gray-500)',
                                                background: 'var(--gray-50)',
                                            }}
                                        >
                                            {group.sportLabel} · {group.leagueLabel}
                                        </div>
                                        {group.matches.map((match) => (
                                            <MatchRow
                                                key={match.id}
                                                homeTeam={match.homeTeam}
                                                homeCode={match.homeCode}
                                                awayTeam={match.awayTeam}
                                                awayCode={match.awayCode}
                                                kickoff={match.commenceTime}
                                                venue={match.venue}
                                                matchNumber={match.matchNumber}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </section>
                </div>
            </div>
        </Layout>
    );
};

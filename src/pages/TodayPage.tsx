import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { MatchRow } from '../components/MatchRow';
import { getMatchesForUtcDate, type TodayMatch } from '../lib/api';

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

export const TodayPage: React.FC = () => {
    const [dateUtc] = useState<string>(toUtcIsoDate);
    const [matches, setMatches] = useState<TodayMatch[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                if (active) {
                    const message = error instanceof Error ? error.message : 'Failed to load matches.';
                    setErrorMessage(message);
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

    const grouped = useMemo(() => groupMatches(matches), [matches]);
    const totalMatches = matches.length;

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
                                                awayTeam={match.awayTeam}
                                                kickoff={match.commenceTime}
                                                venue={match.venue}
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


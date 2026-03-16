'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '../../../../lib/supabase/client';

interface LiveOddsClientProps {
    slug: string;
    homeTeam: string;
    awayTeam: string;
    initialHomeOdds: string;
    initialAwayOdds: string;
    initialDrawOdds: string;
    source: 'database' | 'schedule';
}

function readOddsValue(value: unknown): string | null {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return null;
}

export default function LiveOddsClient({
    slug,
    homeTeam,
    awayTeam,
    initialHomeOdds,
    initialAwayOdds,
    initialDrawOdds,
    source,
}: LiveOddsClientProps) {
    const initialConnectionState = source === 'database' ? 'snapshot' : 'connecting';
    const [homeOdds, setHomeOdds] = useState(initialHomeOdds);
    const [awayOdds, setAwayOdds] = useState(initialAwayOdds);
    const [drawOdds, setDrawOdds] = useState(initialDrawOdds);
    const [connectionState, setConnectionState] = useState<'snapshot' | 'connecting' | 'live'>(initialConnectionState);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();
        if (!supabase) {
            return undefined;
        }

        const channel = supabase
            .channel(`match-odds-${slug}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    filter: `slug=eq.${slug}`,
                    schema: 'public',
                    table: 'matches',
                },
                (payload) => {
                    const nextRow = payload.new as Record<string, unknown>;
                    const nextHome = readOddsValue(nextRow.home_odds);
                    const nextAway = readOddsValue(nextRow.away_odds);
                    const nextDraw = readOddsValue(nextRow.draw_odds);

                    if (nextHome) setHomeOdds(nextHome);
                    if (nextAway) setAwayOdds(nextAway);
                    if (nextDraw) setDrawOdds(nextDraw);
                    setConnectionState('live');
                },
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setConnectionState('live');
                }
            });

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [slug]);

    return (
        <section className="panel">
            <div className="panel-toolbar">
                <div>
                    <p className="eyebrow">Odds Surface</p>
                    <h2 className="section-title">Moneyline snapshot</h2>
                </div>
                <span className={`status-pill status-${connectionState}`}>
                    {connectionState === 'live' ? 'Live via Supabase Realtime' : connectionState === 'snapshot' ? 'SSR snapshot' : 'Waiting for realtime'}
                </span>
            </div>

            <div className="odds-grid">
                <article className="odds-card">
                    <span className="odds-label">Home</span>
                    <strong className="odds-team">{homeTeam}</strong>
                    <span className="odds-value">{homeOdds}</span>
                </article>

                <article className="odds-card odds-card-neutral">
                    <span className="odds-label">Draw</span>
                    <strong className="odds-team">Tie</strong>
                    <span className="odds-value">{drawOdds}</span>
                </article>

                <article className="odds-card">
                    <span className="odds-label">Away</span>
                    <strong className="odds-team">{awayTeam}</strong>
                    <span className="odds-value">{awayOdds}</span>
                </article>
            </div>
        </section>
    );
}

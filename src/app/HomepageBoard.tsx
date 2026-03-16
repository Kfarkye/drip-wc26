"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  HomepageBoardData,
  HomepageGameCard,
  HomeSportFilter,
} from "../../lib/homepage-board";

type HomepageBoardProps = {
  data: HomepageBoardData;
};

const SPORT_PILLS: Array<{
  icon: string;
  id: HomeSportFilter;
  label: string;
}> = [
  { icon: "★", id: "featured", label: "Featured" },
  { icon: "🏀", id: "nba", label: "NBA" },
  { icon: "🏒", id: "nhl", label: "NHL" },
  { icon: "⚾", id: "mlb", label: "MLB" },
  { icon: "⚽", id: "soccer", label: "Soccer" },
  { icon: "🎓", id: "ncaab", label: "NCAAB" },
] as const;

function cardGamesForFilter(games: HomepageGameCard[], activeSport: HomeSportFilter): HomepageGameCard[] {
  if (activeSport === "featured") {
    const featured = games.filter((game) => game.trend);
    return featured.length > 0 ? featured : games;
  }

  return games.filter((game) => game.sportFilter === activeSport);
}

function formatStrength(value: number): string {
  return `${Math.round(value)}%`;
}

function renderLogo(src: string | null, alt: string) {
  if (!src) {
    return (
      <span className="scoreboard-logo scoreboard-logo-fallback" aria-hidden="true">
        {alt.charAt(0)}
      </span>
    );
  }

  return <img className="scoreboard-logo" src={src} alt={alt} loading="lazy" />;
}

function teamRow(game: HomepageGameCard, side: "away" | "home") {
  const isAway = side === "away";
  const logo = isAway ? game.awayLogo : game.homeLogo;
  const team = isAway ? game.awayTeam : game.homeTeam;
  const spread = isAway ? game.odds.awaySpread : game.odds.homeSpread;
  const moneyline = isAway ? game.odds.awayMoneyline : game.odds.homeMoneyline;

  return (
    <div className="scoreboard-team-row">
      <div className="scoreboard-team-main">
        {renderLogo(logo, team)}
        <strong>{team}</strong>
      </div>
      <div className="scoreboard-team-markets">
        {spread ? <span className="odds-pill">{spread}</span> : null}
        {moneyline ? <span className="odds-pill odds-pill-secondary">{moneyline}</span> : null}
      </div>
    </div>
  );
}

export function HomepageBoard({ data }: HomepageBoardProps) {
  const [activeSport, setActiveSport] = useState<HomeSportFilter>(
    data.featuredCount > 0 ? "featured" : "nba",
  );

  const visibleGames = useMemo(() => {
    const filtered = cardGamesForFilter(data.games, activeSport);
    if (filtered.length > 0) return filtered;
    if (activeSport === "nba") return cardGamesForFilter(data.games, "featured");
    return data.games;
  }, [activeSport, data.games]);

  return (
    <>
      <header className="home-site-header" id="today">
        <div className="home-site-header-inner">
          <Link href="/" className="home-brand">
            The Drip
          </Link>

          <nav className="home-primary-nav" aria-label="Homepage">
            <a href="/#today">Today</a>
            <a href="/#matchups">Trends</a>
            <a href="/#featured-picks">Picks</a>
            <a href="/today">Props</a>
          </nav>

          <p className="home-date-stamp">{data.todayEtLabel}</p>
        </div>
      </header>

      <main className="home-page">
        <section className="home-hero-shell">
          <div className="home-hero-copy">
            <p className="home-kicker">The Drip</p>
            <h1>Today&apos;s games</h1>
            <p>{data.generatedAtEt}</p>
          </div>
        </section>

        <section className="matchup-board-shell" id="matchups">
          <div className="section-heading-row">
            <h2>Upcoming Matchups</h2>
            <span>{visibleGames.length} games</span>
          </div>

          <div className="sports-pill-row" aria-label="Sports">
            {SPORT_PILLS.map((pill) => {
              const count =
                pill.id === "featured"
                  ? data.featuredCount > 0
                    ? data.featuredCount
                    : data.games.length
                  : data.sportCounts[pill.id];
              const isActive = activeSport === pill.id;

              return (
                <button
                  key={pill.id}
                  className={isActive ? "sport-pill sport-pill-active" : "sport-pill"}
                  onClick={() => setActiveSport(pill.id)}
                  type="button"
                >
                  <span aria-hidden="true">{pill.icon}</span>
                  <span>{pill.label}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>

          {visibleGames.length === 0 ? (
            <div className="empty-board-state">
              No games are posted for today yet.
            </div>
          ) : (
            <div className="scoreboard-grid">
              {visibleGames.map((game) => (
                <article key={game.matchId} className="scoreboard-card" id={game.anchorId}>
                  <div className="scoreboard-card-top">
                    <span className={`league-badge league-badge-${game.leagueColor}`}>{game.leagueBadge}</span>
                    <span className="time-pill">{game.timeLabel}</span>
                  </div>

                  <div className="scoreboard-card-body">
                    {teamRow(game, "away")}
                    {teamRow(game, "home")}
                  </div>

                  {game.trend ? (
                    <div className="scoreboard-trend-row">
                      <span className="trend-badge">{game.trend.badge}</span>
                      <div>
                        <strong>{game.trend.play}</strong>
                        <span>
                          {formatStrength(game.trend.strength)} signal
                          {game.trend.sample > 0 ? ` · ${game.trend.sample} sample` : ""}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="scoreboard-total-row">
                    {game.odds.total ? (
                      <>
                        <span>O/U {game.odds.total}</span>
                        {game.odds.sportsbook ? <small>{game.odds.sportsbook}</small> : null}
                      </>
                    ) : (
                      <span>Lines pending</span>
                    )}
                  </div>

                  <Link href={game.href} className="scoreboard-cta">
                    View Matchup
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {data.picks.length > 0 ? (
          <section className="featured-picks-shell" id="featured-picks">
            <div className="section-heading-row">
              <h2>Today&apos;s Picks</h2>
              <span>{data.picks.length} featured</span>
            </div>

            <div className="featured-picks-grid">
              {data.picks.map((pick) => (
                <Link key={`${pick.awayTeam}-${pick.homeTeam}-${pick.play}`} href={pick.href} className="pick-card">
                  <span className={`league-badge league-badge-${pick.leagueColor}`}>{pick.leagueBadge}</span>
                  <strong>{pick.awayTeam} at {pick.homeTeam}</strong>
                  <p>{pick.play}</p>
                  <div className="pick-card-meta">
                    <span>{pick.record}</span>
                    <span>{pick.sample} sample</span>
                    <span>{formatStrength(pick.strength)}</span>
                  </div>
                  <small>{pick.timeLabel}</small>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="home-site-footer">
        <div className="home-site-footer-inner">
          <nav aria-label="Footer">
            <a href="/#matchups">Trends</a>
            <a href="/#today">API</a>
            <a href="/#featured-picks">About</a>
          </nav>
          <p>Data updates every 5 minutes</p>
        </div>
      </footer>
    </>
  );
}

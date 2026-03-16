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

const SPORT_SUBLINKS: Record<HomeSportFilter, Array<{ href: string; label: string }>> = {
  featured: [
    { href: "#matchups", label: "All Sports Today" },
    { href: "/today", label: "Daily Odds" },
  ],
  mlb: [
    { href: "#matchups", label: "MLB Scores & Matchups" },
    { href: "/today", label: "MLB Odds" },
  ],
  nba: [
    { href: "#matchups", label: "NBA Scores & Matchups" },
    { href: "/today", label: "NBA Odds" },
  ],
  ncaab: [
    { href: "#matchups", label: "NCAAB Scores & Matchups" },
    { href: "/today", label: "NCAAB Odds" },
  ],
  nhl: [
    { href: "#matchups", label: "NHL Scores & Matchups" },
    { href: "/today", label: "NHL Odds" },
  ],
  soccer: [
    { href: "#matchups", label: "Soccer Scores & Matchups" },
    { href: "/today", label: "Soccer Odds" },
  ],
};

function cardGamesForFilter(games: HomepageGameCard[], activeSport: HomeSportFilter): HomepageGameCard[] {
  if (activeSport === "featured") {
    return games;
  }

  return games.filter((game) => game.sportFilter === activeSport);
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
  const label = isAway ? game.awayLabel : game.homeLabel;
  const spread = isAway ? game.odds.awaySpread : game.odds.homeSpread;
  const moneyline = isAway ? game.odds.awayMoneyline : game.odds.homeMoneyline;

  return (
    <div className="scoreboard-team-row">
      <div className="scoreboard-team-main">
        {renderLogo(logo, team)}
        <div className="scoreboard-team-copy">
          <strong>{label}</strong>
          {label !== team ? <span>{team}</span> : null}
        </div>
      </div>
      <div className="scoreboard-team-markets">
        {spread ? <span className="odds-pill">{spread}</span> : null}
        {moneyline ? <span className="odds-pill odds-pill-secondary">{moneyline}</span> : null}
      </div>
    </div>
  );
}

export function HomepageBoard({ data }: HomepageBoardProps) {
  const [activeSport, setActiveSport] = useState<HomeSportFilter>("featured");

  const visibleGames = useMemo(() => {
    const filtered = cardGamesForFilter(data.games, activeSport);
    if (filtered.length > 0) return filtered;
    return data.games;
  }, [activeSport, data.games]);

  const featureLinks = SPORT_SUBLINKS[activeSport];
  const primaryMatchupLink = visibleGames.find((game) => game.href !== "/today")?.href ?? "/today";

  return (
    <>
      <header className="home-site-header" id="today">
        <div className="home-site-header-inner">
          <Link href="/" className="home-brand">
            The Drip
          </Link>

          <nav className="home-primary-nav" aria-label="Homepage">
            <a href="#matchups">Sports</a>
            <a href="#matchups">Odds</a>
            <a href="#browse">Trends</a>
            <a href="#browse">API</a>
          </nav>

          <p className="home-date-stamp">{data.todayEtLabel}</p>
        </div>
      </header>

      <main className="home-page">
        <section className="home-hero-shell">
          <div className="home-hero-copy">
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
                pill.id === "featured" ? data.games.length : data.sportCounts[pill.id];
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

          <div className="home-subnav-row" aria-label="Matchup shortcuts">
            {featureLinks.map((link) => (
              <Link key={`${activeSport}-${link.label}`} href={link.href} className="home-subnav-link">
                {link.label}
              </Link>
            ))}
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

                  <div className="scoreboard-total-row">
                    {game.odds.total ? (
                      <span>O/U {game.odds.total}</span>
                    ) : (
                      <span>Odds pending</span>
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

        <section className="home-explore-shell" id="browse">
          <div className="section-heading-row">
            <h2>Browse</h2>
            <span>More from The Drip</span>
          </div>

          <div className="home-explore-grid">
            <Link href="/today" className="home-explore-card">
              <strong>Today board</strong>
              <span>Open the live daily slate.</span>
            </Link>

            <Link href="/group/a" className="home-explore-card">
              <strong>Group tables</strong>
              <span>Move from the homepage into tournament groups.</span>
            </Link>

            <Link href={primaryMatchupLink} className="home-explore-card">
              <strong>Match pages</strong>
              <span>Jump from today&apos;s board into a matchup route.</span>
            </Link>

            <Link href="/edges/rsa-vs-mex-2026-06-11" className="home-explore-card">
              <strong>Edge pages</strong>
              <span>See the deeper matchup layer already on the site.</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-site-footer">
        <div className="home-site-footer-inner">
          <nav aria-label="Footer">
            <a href="#matchups">Sports</a>
            <a href="/today">Odds</a>
            <a href="#browse">Browse</a>
          </nav>
          <p>Data updates every 5 minutes</p>
        </div>
      </footer>
    </>
  );
}

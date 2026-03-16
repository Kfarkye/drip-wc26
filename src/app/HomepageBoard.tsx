"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  HomepageBoardData,
  HomepageGame,
  HomeSportFilter,
} from "../../lib/homepage-board";

type HomepageBoardProps = {
  data: HomepageBoardData;
};

const SPORT_PILLS: Array<{ id: HomeSportFilter; label: string }> = [
  { id: "all", label: "All Sports" },
  { id: "nba", label: "NBA" },
  { id: "nhl", label: "NHL" },
  { id: "mlb", label: "MLB" },
  { id: "soccer", label: "Soccer" },
  { id: "ncaab", label: "NCAAB" },
];

const SPORT_SUBLINKS: Record<HomeSportFilter, Array<{ href: string; label: string }>> = {
  all: [
    { href: "#board", label: "All sports scores & matchups" },
    { href: "/today", label: "All sports odds" },
  ],
  mlb: [
    { href: "#board", label: "MLB scores & matchups" },
    { href: "/today", label: "MLB odds" },
  ],
  nba: [
    { href: "#board", label: "NBA scores & matchups" },
    { href: "/today", label: "NBA odds" },
  ],
  ncaab: [
    { href: "#board", label: "NCAAB scores & matchups" },
    { href: "/today", label: "NCAAB odds" },
  ],
  nhl: [
    { href: "#board", label: "NHL scores & matchups" },
    { href: "/today", label: "NHL odds" },
  ],
  soccer: [
    { href: "#board", label: "Soccer scores & matchups" },
    { href: "/today", label: "Soccer odds" },
  ],
};

function toTeamAbbrev(teamName: string): string {
  const words = teamName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TM";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

  const initials = words.slice(0, 3).map((word) => word.charAt(0)).join("");
  return initials.toUpperCase();
}

function formatSpread(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  if (value === 0) return "PK";

  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)}`;
}

function formatMoneyline(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value);
  const sign = rounded >= 0 ? "+" : "";
  return `${sign}${rounded}`;
}

function formatTotal(total: number | null, side: "away" | "home"): string {
  if (total === null || Number.isNaN(total)) return "—";
  const rounded = Math.round(total * 10) / 10;
  const prefix = side === "away" ? "o" : "u";
  return `${prefix}${rounded.toFixed(1)}`;
}

function getSpreadForSide(game: HomepageGame, side: "away" | "home"): number | null {
  if (side === "home") {
    if (game.odds.homeSpread !== null) return game.odds.homeSpread;
    if (game.odds.awaySpread !== null) return game.odds.awaySpread * -1;
    return null;
  }

  if (game.odds.awaySpread !== null) return game.odds.awaySpread;
  if (game.odds.homeSpread !== null) return game.odds.homeSpread * -1;
  return null;
}

function logoNode(teamName: string, logoUrl: string | null) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${teamName} logo`}
        width={24}
        height={24}
        className="drip-team-logo"
      />
    );
  }

  return (
    <span className="drip-team-logo-fallback" aria-hidden="true">
      {toTeamAbbrev(teamName)}
    </span>
  );
}

function statusLabel(status: string | null): string | null {
  if (!status) return null;
  const normalized = status.toLowerCase().trim();
  if (!normalized) return null;
  if (normalized === "pre") return null;
  if (normalized === "in") return "LIVE";
  if (normalized === "post") return "FINAL";
  return normalized.toUpperCase();
}

function TeamRow({
  game,
  side,
}: {
  game: HomepageGame;
  side: "away" | "home";
}) {
  const isAway = side === "away";
  const teamName = isAway ? game.awayTeam : game.homeTeam;
  const record = isAway ? game.awayRecord : game.homeRecord;
  const logoUrl = isAway ? game.awayLogo : game.homeLogo;
  const moneyline = isAway ? game.odds.awayMoneyline : game.odds.homeMoneyline;

  return (
    <div className="drip-team-row">
      <div className="drip-team-cell">
        {logoNode(teamName, logoUrl)}
        <div className="drip-team-copy">
          <span className="drip-team-name">{teamName}</span>
          {record ? <span className="drip-team-record">{record}</span> : null}
        </div>
      </div>

      <span className="drip-board-number">{formatSpread(getSpreadForSide(game, side))}</span>
      <span className="drip-board-number drip-total-cell">{formatTotal(game.odds.total, side)}</span>
      <span className="drip-board-number">{formatMoneyline(moneyline)}</span>
      <span className="drip-time-cell">{game.startTimeEt}</span>
    </div>
  );
}

export function HomepageBoard({ data }: HomepageBoardProps) {
  const [activeSport, setActiveSport] = useState<HomeSportFilter>("all");

  const visibleLeagues = useMemo(() => {
    if (activeSport === "all") return data.leagues;
    return data.leagues.filter((league) => league.sport === activeSport);
  }, [activeSport, data.leagues]);

  const visibleGameCount = useMemo(
    () => visibleLeagues.reduce((total, league) => total + league.gameCount, 0),
    [visibleLeagues],
  );

  const subLinks = SPORT_SUBLINKS[activeSport];

  return (
    <>
      <header className="drip-home-header">
        <div className="drip-home-header-inner">
          <Link href="/" className="drip-home-brand">
            The Drip
          </Link>

          <nav className="drip-home-nav" aria-label="Primary">
            <a href="#board">Sports</a>
            <a href="/today">Odds</a>
            <a href="/trends">Trends</a>
            <a href="/api">API</a>
          </nav>

          <p className="drip-home-date">{data.todayEtLabel}</p>
        </div>
      </header>

      <main className="drip-home-main" id="board">
        <section className="drip-pills-shell" aria-label="Sports filters">
          <div className="drip-sport-pill-row">
            {SPORT_PILLS.map((pill) => {
              const count = data.sportCounts[pill.id] ?? 0;
              const isActive = pill.id === activeSport;

              return (
                <button
                  key={pill.id}
                  type="button"
                  className={isActive ? "drip-sport-pill drip-sport-pill-active" : "drip-sport-pill"}
                  onClick={() => setActiveSport(pill.id)}
                >
                  <span>{pill.label}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>

          <div className="drip-sport-subnav" aria-label="Sport shortcuts">
            {subLinks.map((link) => (
              <Link key={`${activeSport}-${link.label}`} href={link.href} className="drip-sport-sublink">
                {link.label}
              </Link>
            ))}
          </div>

          <p className="drip-visible-count">{visibleGameCount} games</p>
        </section>

        {visibleLeagues.length === 0 ? (
          <p className="drip-empty-text">No games are posted for today yet.</p>
        ) : (
          <div className="drip-league-board">
            {visibleLeagues.map((league) => (
              <section key={league.leagueId} className="drip-league-section">
                <header className="drip-league-header">
                  <h2>{league.leagueName}</h2>
                  <p>{league.gameCount} games · {league.firstGameTimeEt}</p>
                </header>

                <div className="drip-league-column-head">
                  <span>Matchup</span>
                  <span>Spread</span>
                  <span>Total</span>
                  <span>ML</span>
                  <span>Time (ET)</span>
                </div>

                <div className="drip-matchup-list">
                  {league.games.map((game) => {
                    const status = statusLabel(game.status);

                    return (
                      <article key={game.sourceId} className="drip-matchup-item">
                        {status ? <div className="drip-status-chip">{status}</div> : null}

                        <TeamRow game={game} side="away" />
                        <TeamRow game={game} side="home" />

                        {game.odds.drawMoneyline !== null ? (
                          <div className="drip-draw-row">
                            <span>Draw ML</span>
                            <span className="drip-board-number">{formatMoneyline(game.odds.drawMoneyline)}</span>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="drip-home-footer">
        <div className="drip-home-footer-inner">
          <nav aria-label="Footer">
            <a href="#board">Sports</a>
            <a href="/today">Odds</a>
            <a href="/trends">Trends</a>
            <a href="/api">API</a>
          </nav>
          <p>Data updates every 5 minutes</p>
        </div>
      </footer>
    </>
  );
}

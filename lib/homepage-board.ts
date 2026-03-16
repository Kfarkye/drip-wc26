import { createServerSupabaseClient } from "./supabase/server";

export type HomeSportFilter = "all" | "nba" | "nhl" | "mlb" | "soccer" | "ncaab";
type HomeSport = Exclude<HomeSportFilter, "all"> | "nfl";

type MatchFeedRow = Record<string, unknown>;
type OpeningLineRow = Record<string, unknown>;
type TeamLogoRow = Record<string, unknown>;

type LeagueMeta = {
  name: string;
  sport: HomeSport;
};

type NumericLike = number | string | null | undefined;

const ET_TIME_ZONE = "America/New_York";

const LEAGUE_CONFIG: Record<string, LeagueMeta> = {
  "arg.1": { name: "Argentina Primera", sport: "soccer" },
  "bel.1": { name: "Belgian Pro League", sport: "soccer" },
  "bra.1": { name: "Brasileirão", sport: "soccer" },
  "eng.1": { name: "English Premier League", sport: "soccer" },
  "esp.1": { name: "La Liga", sport: "soccer" },
  "fra.1": { name: "Ligue 1", sport: "soccer" },
  "ger.1": { name: "Bundesliga", sport: "soccer" },
  "ita.1": { name: "Serie A", sport: "soccer" },
  "mens-college-basketball": { name: "NCAAB", sport: "ncaab" },
  "mex.1": { name: "Liga MX", sport: "soccer" },
  mlb: { name: "MLB", sport: "mlb" },
  mls: { name: "MLS", sport: "soccer" },
  nba: { name: "NBA", sport: "nba" },
  ncaab: { name: "NCAAB", sport: "ncaab" },
  "ned.1": { name: "Eredivisie", sport: "soccer" },
  nfl: { name: "NFL", sport: "nfl" },
  nhl: { name: "NHL", sport: "nhl" },
  "por.1": { name: "Primeira Liga", sport: "soccer" },
  "sco.1": { name: "Scottish Premiership", sport: "soccer" },
  "tur.1": { name: "Süper Lig", sport: "soccer" },
  "uefa.champions": { name: "Champions League", sport: "soccer" },
  "uefa.europa": { name: "Europa League", sport: "soccer" },
  "usa.1": { name: "MLS", sport: "soccer" },
};

export interface HomepageOdds {
  awayMoneyline: number | null;
  awaySpread: number | null;
  drawMoneyline: number | null;
  homeMoneyline: number | null;
  homeSpread: number | null;
  total: number | null;
}

export interface HomepageGame {
  awayLogo: string | null;
  awayRecord: string | null;
  awayTeam: string;
  homeLogo: string | null;
  homeRecord: string | null;
  homeTeam: string;
  leagueId: string;
  leagueName: string;
  odds: HomepageOdds;
  sourceId: string;
  sport: HomeSport;
  startTime: string;
  startTimeEt: string;
  status: string | null;
}

export interface HomepageLeagueGroup {
  firstGameTimeEt: string;
  gameCount: number;
  games: HomepageGame[];
  leagueId: string;
  leagueName: string;
  sport: HomeSport;
}

export interface HomepageBoardData {
  games: HomepageGame[];
  generatedAtEt: string;
  leagues: HomepageLeagueGroup[];
  sportCounts: Record<HomeSportFilter, number>;
  todayEtLabel: string;
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

function readNumber(row: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key] as NumericLike;
    const parsed = toNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function toNumber(value: NumericLike): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeTeamName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatEtDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: ET_TIME_ZONE,
    weekday: "long",
  }).format(date);
}

function formatEtTimestamp(date: Date): string {
  return `${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: ET_TIME_ZONE,
  }).format(date)} ET`;
}

function formatEtGameTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "TBD";

  return `${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: ET_TIME_ZONE,
  }).format(parsed)} ET`;
}

function humanizeLeagueId(leagueId: string): string {
  const normalized = leagueId
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, " ")
    .trim();

  if (!normalized) return "League";
  return normalized
    .split(/\s+/)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join(" ");
}

function getLeagueMeta(leagueIdRaw: string): LeagueMeta {
  const leagueId = leagueIdRaw.trim().toLowerCase();
  const configured = LEAGUE_CONFIG[leagueId];
  if (configured) return configured;

  if (leagueId.includes("nba")) return { name: "NBA", sport: "nba" };
  if (leagueId.includes("nhl")) return { name: "NHL", sport: "nhl" };
  if (leagueId.includes("mlb")) return { name: "MLB", sport: "mlb" };
  if (leagueId.includes("college") || leagueId.includes("ncaab")) {
    return { name: "NCAAB", sport: "ncaab" };
  }
  return { name: humanizeLeagueId(leagueIdRaw), sport: "soccer" };
}

function getRecord(row: Record<string, unknown>, side: "home" | "away"): string | null {
  const direct = readString(row, [
    `${side}_record`,
    `${side}_team_record`,
    `${side}_record_summary`,
  ]);
  if (direct) return direct;

  const wins = readNumber(row, [`${side}_wins`]);
  const losses = readNumber(row, [`${side}_losses`]);
  const ties = readNumber(row, [`${side}_ties`]);

  if (wins === null || losses === null) return null;
  if (ties !== null && ties > 0) return `${wins}-${losses}-${ties}`;
  return `${wins}-${losses}`;
}

function lineRichness(row: OpeningLineRow): number {
  const values: Array<number | null> = [
    readNumber(row, ["home_spread"]),
    readNumber(row, ["away_spread"]),
    readNumber(row, ["total"]),
    readNumber(row, ["home_ml"]),
    readNumber(row, ["away_ml"]),
    readNumber(row, ["draw_ml"]),
  ];

  return values.reduce((count, value) => (value === null ? count : count + 1), 0);
}

function parseOdds(row: OpeningLineRow | null): HomepageOdds {
  if (!row) {
    return {
      awayMoneyline: null,
      awaySpread: null,
      drawMoneyline: null,
      homeMoneyline: null,
      homeSpread: null,
      total: null,
    };
  }

  let homeSpread = readNumber(row, ["home_spread"]);
  let awaySpread = readNumber(row, ["away_spread"]);
  if (homeSpread === null && awaySpread !== null) homeSpread = awaySpread * -1;
  if (awaySpread === null && homeSpread !== null) awaySpread = homeSpread * -1;

  return {
    awayMoneyline: readNumber(row, ["away_ml"]),
    awaySpread,
    drawMoneyline: readNumber(row, ["draw_ml"]),
    homeMoneyline: readNumber(row, ["home_ml"]),
    homeSpread,
    total: readNumber(row, ["total"]),
  };
}

function toIsoDayBounds(now: Date): { startIso: string; endIso: string } {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  return { endIso: end.toISOString(), startIso: start.toISOString() };
}

async function fetchMatchFeedRows(now: Date): Promise<MatchFeedRow[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const { startIso, endIso } = toIsoDayBounds(now);
  const { data, error } = await supabase
    .from("match_feed")
    .select("*")
    .gte("start_time", startIso)
    .lte("start_time", endIso)
    .order("start_time", { ascending: true });

  if (error) return [];
  return (data as MatchFeedRow[] | null) ?? [];
}

async function fetchOpeningLineRows(matchIds: string[]): Promise<OpeningLineRow[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase || matchIds.length === 0) return [];

  const { data, error } = await supabase
    .from("opening_lines")
    .select("*")
    .in("match_id", matchIds);

  if (error) return [];
  return (data as OpeningLineRow[] | null) ?? [];
}

async function fetchTeamLogos(teamNames: string[]): Promise<Map<string, string>> {
  const supabase = createServerSupabaseClient();
  if (!supabase || teamNames.length === 0) return new Map();

  const { data, error } = await supabase
    .from("team_logos")
    .select("team_name, logo_url")
    .in("team_name", teamNames);

  if (error) return new Map();

  const map = new Map<string, string>();
  for (const row of (data as TeamLogoRow[] | null) ?? []) {
    const teamName = readString(row, ["team_name"]);
    const logoUrl = readString(row, ["logo_url"]);
    if (!teamName || !logoUrl) continue;
    map.set(normalizeTeamName(teamName), logoUrl);
  }
  return map;
}

function buildSportCounts(games: HomepageGame[]): Record<HomeSportFilter, number> {
  const counts: Record<HomeSportFilter, number> = {
    all: 0,
    mlb: 0,
    nba: 0,
    ncaab: 0,
    nhl: 0,
    soccer: 0,
  };

  for (const game of games) {
    counts.all += 1;
    if (game.sport in counts) {
      counts[game.sport as Exclude<HomeSportFilter, "all">] += 1;
    }
  }
  return counts;
}

function groupByLeague(games: HomepageGame[]): HomepageLeagueGroup[] {
  const grouped = new Map<string, HomepageLeagueGroup>();

  for (const game of games) {
    const existing = grouped.get(game.leagueId);
    if (!existing) {
      grouped.set(game.leagueId, {
        firstGameTimeEt: game.startTimeEt,
        gameCount: 1,
        games: [game],
        leagueId: game.leagueId,
        leagueName: game.leagueName,
        sport: game.sport,
      });
      continue;
    }

    existing.games.push(game);
    existing.gameCount += 1;
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      games: group.games.sort((left, right) => {
        const byTime = left.startTime.localeCompare(right.startTime);
        if (byTime !== 0) return byTime;
        return left.awayTeam.localeCompare(right.awayTeam);
      }),
    }))
    .map((group) => ({
      ...group,
      firstGameTimeEt: group.games[0]?.startTimeEt ?? "TBD",
    }))
    .sort((left, right) => {
      const leftTime = left.games[0]?.startTime ?? "";
      const rightTime = right.games[0]?.startTime ?? "";
      const byTime = leftTime.localeCompare(rightTime);
      if (byTime !== 0) return byTime;
      return left.leagueName.localeCompare(right.leagueName);
    });
}

export async function getHomepageBoardData(now: Date = new Date()): Promise<HomepageBoardData> {
  const rows = await fetchMatchFeedRows(now);
  if (rows.length === 0) {
    return {
      games: [],
      generatedAtEt: `Updated ${formatEtTimestamp(now)}`,
      leagues: [],
      sportCounts: { all: 0, mlb: 0, nba: 0, ncaab: 0, nhl: 0, soccer: 0 },
      todayEtLabel: formatEtDateLabel(now),
    };
  }

  const matchIds = Array.from(
    new Set(
      rows
        .map((row) => readString(row, ["source_id"]))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const teamNames = Array.from(
    new Set(
      rows
        .flatMap((row) => [
          readString(row, ["home_team_name"]),
          readString(row, ["away_team_name"]),
        ])
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const [openingLineRows, logoMap] = await Promise.all([
    fetchOpeningLineRows(matchIds),
    fetchTeamLogos(teamNames),
  ]);

  const oddsByMatchId = new Map<string, HomepageOdds>();
  const lineRowsByMatch = new Map<string, OpeningLineRow[]>();
  for (const row of openingLineRows) {
    const matchId = readString(row, ["match_id"]);
    if (!matchId) continue;
    const bucket = lineRowsByMatch.get(matchId) ?? [];
    bucket.push(row);
    lineRowsByMatch.set(matchId, bucket);
  }

  for (const [matchId, bucket] of lineRowsByMatch.entries()) {
    const best = [...bucket].sort((left, right) => lineRichness(right) - lineRichness(left))[0] ?? null;
    oddsByMatchId.set(matchId, parseOdds(best));
  }

  const games: HomepageGame[] = rows
    .map((row) => {
      const sourceId = readString(row, ["source_id"]);
      const leagueId = readString(row, ["league_id"]);
      const awayTeam = readString(row, ["away_team_name"]);
      const homeTeam = readString(row, ["home_team_name"]);
      const startTime = readString(row, ["start_time"]);

      if (!sourceId || !leagueId || !awayTeam || !homeTeam || !startTime) return null;

      const leagueMeta = getLeagueMeta(leagueId);
      return {
        awayLogo: logoMap.get(normalizeTeamName(awayTeam)) ?? null,
        awayRecord: getRecord(row, "away"),
        awayTeam,
        homeLogo: logoMap.get(normalizeTeamName(homeTeam)) ?? null,
        homeRecord: getRecord(row, "home"),
        homeTeam,
        leagueId,
        leagueName: leagueMeta.name,
        odds: oddsByMatchId.get(sourceId) ?? {
          awayMoneyline: null,
          awaySpread: null,
          drawMoneyline: null,
          homeMoneyline: null,
          homeSpread: null,
          total: null,
        },
        sourceId,
        sport: leagueMeta.sport,
        startTime,
        startTimeEt: formatEtGameTime(startTime),
        status: readString(row, ["status"]),
      } satisfies HomepageGame;
    })
    .filter((game): game is HomepageGame => game !== null)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));

  return {
    games,
    generatedAtEt: `Updated ${formatEtTimestamp(now)}`,
    leagues: groupByLeague(games),
    sportCounts: buildSportCounts(games),
    todayEtLabel: formatEtDateLabel(now),
  };
}

import { createServerSupabaseClient } from "./supabase/server";

type MatchRow = Record<string, unknown>;
type OpeningLineRow = Record<string, unknown>;
type LogoRow = Record<string, unknown>;

type QueryErrorLike = {
  code?: string;
  message?: string;
};

type CandidateTimeColumn = "start_time" | "commence_time" | "kickoff";

const ET_TIME_ZONE = "America/New_York";
const CANDIDATE_TIME_COLUMNS: CandidateTimeColumn[] = ["start_time", "commence_time", "kickoff"];

const SPORT_LABELS: Record<Exclude<HomeSportFilter, "featured">, string> = {
  mlb: "Baseball",
  nba: "Basketball",
  ncaab: "College Basketball",
  nhl: "Hockey",
  soccer: "Soccer",
};

const LEAGUE_BADGES: Record<string, string> = {
  bundesliga: "Bundesliga",
  epl: "EPL",
  "fifa-world-cup-2026": "World Cup",
  ligue1: "Ligue 1",
  "la-liga": "La Liga",
  laliga: "La Liga",
  mlb: "MLB",
  mls: "MLS",
  nba: "NBA",
  ncaab: "NCAAB",
  nhl: "NHL",
  "serie-a": "Serie A",
  seriea: "Serie A",
  soccer: "Soccer",
  ucl: "UCL",
  uel: "UEL",
};

export type HomeSportFilter = "featured" | "nba" | "nhl" | "mlb" | "soccer" | "ncaab";

export interface HomepageCardOdds {
  awayMoneyline: string | null;
  awaySpread: string | null;
  homeMoneyline: string | null;
  homeSpread: string | null;
  total: string | null;
}

export interface HomepageGameCard {
  anchorId: string;
  awayLabel: string;
  awayLogo: string | null;
  awayTeam: string;
  href: string;
  homeLabel: string;
  homeLogo: string | null;
  homeTeam: string;
  leagueBadge: string;
  leagueColor: "amber" | "green" | "ice" | "orange" | "red" | "slate";
  leagueId: string;
  matchId: string;
  odds: HomepageCardOdds;
  sportFilter: Exclude<HomeSportFilter, "featured">;
  sportLabel: string;
  startTime: string;
  status: string | null;
  timeLabel: string;
}

export interface HomepageBoardData {
  games: HomepageGameCard[];
  generatedAtEt: string;
  sportCounts: Record<HomeSportFilter, number>;
  todayEtLabel: string;
}

function asNullableString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const normalized = value.trim().replace(/,/g, "");
    if (!normalized) return null;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readFirstValue(row: Record<string, unknown> | null, keys: string[]): unknown {
  if (!row) return null;

  for (const key of keys) {
    if (key in row && row[key] !== null && row[key] !== undefined) {
      return row[key];
    }
  }

  return null;
}

function readFirstString(row: Record<string, unknown> | null, keys: string[]): string | null {
  return asNullableString(readFirstValue(row, keys));
}

function readFirstNumber(row: Record<string, unknown> | null, keys: string[]): number | null {
  return asNumber(readFirstValue(row, keys));
}

function asQueryError(value: unknown): QueryErrorLike | null {
  if (!value || typeof value !== "object") return null;

  const record = value as QueryErrorLike;
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

function isMissingColumnError(error: QueryErrorLike | null): boolean {
  return !!error && (error.code === "42703" || /column .* does not exist/i.test(error.message ?? ""));
}

function isMissingTableError(error: QueryErrorLike | null): boolean {
  return !!error && (error.code === "42P01" || /relation .* does not exist/i.test(error.message ?? ""));
}

function isPermissionError(error: QueryErrorLike | null): boolean {
  return !!error && (error.code === "42501" || /permission denied/i.test(error.message ?? ""));
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toAnchorId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number.parseInt(part.value, 10)]),
  );

  const asUtc = Date.UTC(
    values.year ?? 0,
    (values.month ?? 1) - 1,
    values.day ?? 1,
    values.hour ?? 0,
    values.minute ?? 0,
    values.second ?? 0,
  );

  return asUtc - date.getTime();
}

function makeDateInTimeZone(dateKey: string, hour: number, minute: number, second: number, timeZone: string): Date {
  const [year, month, day] = dateKey.split("-").map((value) => Number.parseInt(value, 10));
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset = getTimeZoneOffsetMs(guess, timeZone);
  return new Date(guess.getTime() - offset);
}

function getEtDateKey(input: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(input);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function plusOneDay(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatEtDayLabel(input: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(input);
}

function formatEtGeneratedLabel(input: Date): string {
  return `Updated ${new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(input)} ET`;
}

function formatEtTimePill(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Time TBD";

  return `${new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(parsed)} · ${new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed)} ET`;
}

function formatMoneyline(value: number | null): string | null {
  if (value === null) return null;
  const rounded = Math.round(value);
  if (!Number.isFinite(rounded)) return null;
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

function formatSpread(value: number | null): string | null {
  if (value === null) return null;
  const rounded = Math.round(value * 10) / 10;
  if (!Number.isFinite(rounded)) return null;
  if (rounded === 0) return "PK";
  return `${rounded > 0 ? "+" : "-"}${Math.abs(rounded).toFixed(1)}`;
}

function formatTotal(value: number | null): string | null {
  if (value === null) return null;
  const rounded = Math.round(value * 10) / 10;
  if (!Number.isFinite(rounded)) return null;
  return rounded.toFixed(1);
}

function formatSpreadWithPrice(lineValue: unknown, priceValue: unknown): string | null {
  const rawLine = asNullableString(lineValue);
  const lineNumber = asNumber(lineValue);
  const price = formatMoneyline(asNumber(priceValue));

  if (rawLine) {
    const base = lineNumber !== null ? formatSpread(lineNumber) ?? rawLine : rawLine;
    if (!price || /(?:^|\s)[+-]\d{3}(?:\s|$)/.test(base)) return base;
    return `${base} ${price}`;
  }

  const derived = formatSpread(lineNumber);
  if (!derived) return null;
  return price ? `${derived} ${price}` : derived;
}

function humanizeLeague(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const known = LEAGUE_BADGES[normalized];
  if (known) return known;

  return value
    .split(/[-_/\s]+/)
    .filter(Boolean)
    .map((token) => (token.length <= 3 ? token.toUpperCase() : `${token.charAt(0).toUpperCase()}${token.slice(1)}`))
    .join(" ");
}

function inferSportFilter(row: MatchRow): Exclude<HomeSportFilter, "featured"> {
  const leagueId = normalizeName(
    readFirstString(row, ["league_id", "league_key", "league", "league_name", "league_title"]) ?? "",
  );
  const sportId = normalizeName(readFirstString(row, ["sport", "sport_key", "sport_title", "sport_name"]) ?? "");

  const haystack = `${leagueId} ${sportId}`;
  if (haystack.includes("ncaab") || haystack.includes("college basketball")) return "ncaab";
  if (haystack.includes("nba") || haystack.includes("basketball")) return "nba";
  if (haystack.includes("nhl") || haystack.includes("hockey")) return "nhl";
  if (haystack.includes("mlb") || haystack.includes("baseball")) return "mlb";
  return "soccer";
}

function sportLabelFor(filter: Exclude<HomeSportFilter, "featured">): string {
  return SPORT_LABELS[filter];
}

function leagueColorFor(filter: Exclude<HomeSportFilter, "featured">): HomepageGameCard["leagueColor"] {
  switch (filter) {
    case "nba":
      return "amber";
    case "nhl":
      return "ice";
    case "mlb":
      return "red";
    case "ncaab":
      return "orange";
    case "soccer":
      return "green";
    default:
      return "slate";
  }
}

function displayLabel(code: string | null, teamName: string): string {
  if (code && /^[A-Za-z0-9]{2,5}$/.test(code)) return code.toUpperCase();
  return teamName;
}

async function fetchTodayMatchRows(now: Date): Promise<MatchRow[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const todayEt = getEtDateKey(now);
  const tomorrowEt = plusOneDay(todayEt);
  const startIso = makeDateInTimeZone(todayEt, 0, 0, 0, ET_TIME_ZONE).toISOString();
  const endIso = makeDateInTimeZone(tomorrowEt, 0, 0, 0, ET_TIME_ZONE).toISOString();

  for (const timeColumn of CANDIDATE_TIME_COLUMNS) {
    try {
      const { data, error } = await supabase
        .from("match_feed")
        .select("*")
        .gte(timeColumn, startIso)
        .lt(timeColumn, endIso)
        .order(timeColumn, { ascending: true });

      if (!error) {
        return ((data as MatchRow[] | null) ?? []).filter((row) => row && typeof row === "object");
      }

      const normalized = asQueryError(error);
      if (isMissingColumnError(normalized)) continue;
      if (isMissingTableError(normalized) || isPermissionError(normalized)) return [];
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

async function fetchOpeningLineRows(matchIds: string[]): Promise<OpeningLineRow[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase || matchIds.length === 0) return [];

  const idColumns = ["match_id", "source_id", "event_id"] as const;

  for (const idColumn of idColumns) {
    try {
      const { data, error } = await supabase
        .from("opening_lines")
        .select("*")
        .in(idColumn, matchIds);

      if (!error) return (data as OpeningLineRow[] | null) ?? [];

      const normalized = asQueryError(error);
      if (isMissingColumnError(normalized)) continue;
      if (isMissingTableError(normalized) || isPermissionError(normalized)) return [];
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

async function fetchTeamLogos(): Promise<Map<string, string>> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return new Map();

  try {
    const { data, error } = await supabase
      .from("team_logos")
      .select("*")
      .limit(1000);

    if (error) return new Map();

    const logos = new Map<string, string>();
    for (const row of (data as LogoRow[] | null) ?? []) {
      const teamName = readFirstString(row, ["team_name", "team", "name"]);
      const logoUrl = readFirstString(row, ["logo_url", "logo", "espn_logo_url", "logoUrl"]);
      if (!teamName || !logoUrl) continue;
      logos.set(normalizeName(teamName), logoUrl);
    }

    return logos;
  } catch {
    return new Map();
  }
}

function lineRichness(row: OpeningLineRow): number {
  const values = [
    readFirstValue(row, ["home_spread", "spread_home", "home_line"]),
    readFirstValue(row, ["away_spread", "spread_away", "away_line"]),
    readFirstValue(row, ["home_ml", "home_moneyline", "moneyline_home"]),
    readFirstValue(row, ["away_ml", "away_moneyline", "moneyline_away"]),
    readFirstValue(row, ["total", "over_under", "total_points"]),
  ];

  return values.reduce((count, value) => count + (value !== null && value !== undefined && value !== "" ? 1 : 0), 0);
}

function bestLineForMatch(rows: OpeningLineRow[]): OpeningLineRow | null {
  if (rows.length === 0) return null;

  return [...rows].sort((left, right) => {
    const richnessDiff = lineRichness(right) - lineRichness(left);
    if (richnessDiff !== 0) return richnessDiff;

    const leftUpdated = readFirstString(left, ["updated_at", "created_at", "captured_at"]) ?? "";
    const rightUpdated = readFirstString(right, ["updated_at", "created_at", "captured_at"]) ?? "";
    return rightUpdated.localeCompare(leftUpdated);
  })[0] ?? null;
}

function parseOddsRow(row: OpeningLineRow | null): HomepageCardOdds {
  if (!row) {
    return {
      awayMoneyline: null,
      awaySpread: null,
      homeMoneyline: null,
      homeSpread: null,
      total: null,
    };
  }

  const homeSpreadValue = readFirstValue(row, ["home_spread", "spread_home", "home_line"]);
  const awaySpreadValue = readFirstValue(row, ["away_spread", "spread_away", "away_line"]);
  const homeSpreadNumber = asNumber(homeSpreadValue);
  const awaySpreadNumber = asNumber(awaySpreadValue);

  const normalizedHomeSpread = homeSpreadValue ?? (awaySpreadNumber !== null ? -awaySpreadNumber : null);
  const normalizedAwaySpread = awaySpreadValue ?? (homeSpreadNumber !== null ? -homeSpreadNumber : null);

  return {
    homeSpread: formatSpreadWithPrice(
      normalizedHomeSpread,
      readFirstValue(row, ["home_spread_odds", "home_spread_price", "spread_price_home", "juice_home"]),
    ),
    awaySpread: formatSpreadWithPrice(
      normalizedAwaySpread,
      readFirstValue(row, ["away_spread_odds", "away_spread_price", "spread_price_away", "juice_away"]),
    ),
    homeMoneyline: formatMoneyline(readFirstNumber(row, ["home_ml", "home_moneyline", "moneyline_home"])),
    awayMoneyline: formatMoneyline(readFirstNumber(row, ["away_ml", "away_moneyline", "moneyline_away"])),
    total: formatTotal(readFirstNumber(row, ["total", "over_under", "total_points"])),
  };
}

function mapMatchRow(row: MatchRow, logos: Map<string, string>, openingLineByMatchId: Map<string, HomepageCardOdds>): HomepageGameCard | null {
  const startTime = readFirstString(row, ["start_time", "commence_time", "kickoff"]);
  if (!startTime) return null;

  const leagueId = readFirstString(row, ["league_id", "league_key", "league", "league_name", "league_title"]) ?? "featured";
  const awayTeam = readFirstString(row, ["away_team_name", "away_team", "away_name"]) ?? "Away";
  const homeTeam = readFirstString(row, ["home_team_name", "home_team", "home_name"]) ?? "Home";
  const matchId =
    readFirstString(row, ["source_id", "event_id", "match_id", "id"])
    ?? `${startTime}-${awayTeam}-${homeTeam}`;
  const awayCode = readFirstString(row, ["away_team_code", "away_code", "away_abbr"]);
  const homeCode = readFirstString(row, ["home_team_code", "home_code", "home_abbr"]);
  const sportFilter = inferSportFilter(row);
  const explicitSlug = readFirstString(row, ["slug"]);
  const awayLogo = logos.get(normalizeName(awayTeam)) ?? null;
  const homeLogo = logos.get(normalizeName(homeTeam)) ?? null;

  return {
    anchorId: toAnchorId(matchId),
    awayLabel: displayLabel(awayCode, awayTeam),
    awayLogo,
    awayTeam,
    href: explicitSlug ? `/match/${explicitSlug}` : "/today",
    homeLabel: displayLabel(homeCode, homeTeam),
    homeLogo,
    homeTeam,
    leagueBadge: humanizeLeague(leagueId),
    leagueColor: leagueColorFor(sportFilter),
    leagueId,
    matchId,
    odds: openingLineByMatchId.get(matchId) ?? {
      awayMoneyline: null,
      awaySpread: null,
      homeMoneyline: null,
      homeSpread: null,
      total: null,
    },
    sportFilter,
    sportLabel: sportLabelFor(sportFilter),
    startTime,
    status: readFirstString(row, ["status", "game_status"]),
    timeLabel: formatEtTimePill(startTime),
  };
}

function buildSportCounts(games: HomepageGameCard[]): Record<HomeSportFilter, number> {
  const counts: Record<HomeSportFilter, number> = {
    featured: games.length,
    mlb: 0,
    nba: 0,
    ncaab: 0,
    nhl: 0,
    soccer: 0,
  };

  for (const game of games) {
    counts[game.sportFilter] += 1;
  }

  return counts;
}

export async function getHomepageBoardData(now: Date = new Date()): Promise<HomepageBoardData> {
  const matchRows = await fetchTodayMatchRows(now);
  const matchIds = Array.from(
    new Set(
      matchRows
        .map((row) => readFirstString(row, ["source_id", "event_id", "match_id", "id"]))
        .filter((value): value is string => !!value),
    ),
  );

  const [openingLineRows, logos] = await Promise.all([
    fetchOpeningLineRows(matchIds),
    fetchTeamLogos(),
  ]);

  const linesByMatchId = new Map<string, OpeningLineRow[]>();
  for (const row of openingLineRows) {
    const matchId =
      readFirstString(row, ["match_id"])
      ?? readFirstString(row, ["source_id"])
      ?? readFirstString(row, ["event_id"]);

    if (!matchId) continue;
    const existing = linesByMatchId.get(matchId) ?? [];
    existing.push(row);
    linesByMatchId.set(matchId, existing);
  }

  const parsedLinesByMatchId = new Map<string, HomepageCardOdds>();
  for (const [matchId, rows] of linesByMatchId.entries()) {
    parsedLinesByMatchId.set(matchId, parseOddsRow(bestLineForMatch(rows)));
  }

  const games = matchRows
    .map((row) => mapMatchRow(row, logos, parsedLinesByMatchId))
    .filter((row): row is HomepageGameCard => row !== null)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));

  return {
    games,
    generatedAtEt: formatEtGeneratedLabel(now),
    sportCounts: buildSportCounts(games),
    todayEtLabel: formatEtDayLabel(now),
  };
}

import { ALL_MATCHES } from "../src/data/all-matches";
import { matchSlug } from "../src/lib/slugify";
import { createServerSupabaseClient } from "./supabase/server";

type Row = Record<string, unknown>;

type RawPickRow = {
  match_id?: unknown;
  home_team?: unknown;
  away_team?: unknown;
  league?: unknown;
  league_id?: unknown;
  start_time?: unknown;
  play?: unknown;
  pick_type?: unknown;
  home_rate?: unknown;
  home_sample?: unknown;
  away_rate?: unknown;
  away_sample?: unknown;
  avg_rate?: unknown;
};

export type HomeSportFilter = "featured" | "nba" | "nhl" | "mlb" | "soccer" | "ncaab";

export interface HomepageCardOdds {
  awayMoneyline: string | null;
  awaySpread: string | null;
  homeMoneyline: string | null;
  homeSpread: string | null;
  sportsbook: string | null;
  total: string | null;
}

export interface HomepageCardTrend {
  badge: string;
  pickType: string;
  play: string;
  sample: number;
  strength: number;
}

export interface HomepageGameCard {
  anchorId: string;
  awayLogo: string | null;
  awayTeam: string;
  homeLogo: string | null;
  homeTeam: string;
  href: string;
  leagueBadge: string;
  leagueColor: string;
  leagueId: string;
  matchId: string;
  odds: HomepageCardOdds;
  sportFilter: HomeSportFilter;
  sportLabel: string;
  startTime: string;
  status: string;
  timeLabel: string;
  trend: HomepageCardTrend | null;
}

export interface HomepageFeaturedPick {
  awayTeam: string;
  homeTeam: string;
  href: string;
  leagueBadge: string;
  leagueColor: string;
  play: string;
  record: string;
  sample: number;
  strength: number;
  timeLabel: string;
}

export interface HomepageBoardData {
  featuredCount: number;
  generatedAtEt: string;
  games: HomepageGameCard[];
  picks: HomepageFeaturedPick[];
  sportCounts: Record<HomeSportFilter, number>;
  todayEtLabel: string;
}

interface NormalizedPick {
  avgRate: number;
  awaySample: number;
  awayTeam: string;
  homeSample: number;
  homeTeam: string;
  leagueId: string;
  matchId: string;
  pickType: string;
  play: string;
  startTime: string;
}

const DEFAULT_BOARD_DATA: HomepageBoardData = {
  featuredCount: 0,
  generatedAtEt: "",
  games: [],
  picks: [],
  sportCounts: {
    featured: 0,
    mlb: 0,
    nba: 0,
    ncaab: 0,
    nhl: 0,
    soccer: 0,
  },
  todayEtLabel: "",
};

const DEFAULT_LOGO_TIMEOUT_MS = 1_800;
const DEFAULT_QUERY_TIMEOUT_MS = 2_000;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[,$%]/g, "").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function asNullableString(value: unknown): string | null {
  const next = asString(value);
  return next ? next : null;
}

function buildCompositeKey(leagueId: string, homeTeam: string, awayTeam: string, startTime: string): string {
  return `${leagueId}:${normalizeName(homeTeam)}:${normalizeName(awayTeam)}:${startTime}`;
}

function formatEtLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "America/New_York",
    weekday: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatEtTimePill(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "Time TBD";

  const date = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "America/New_York",
  }).format(parsed);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(parsed);

  return `${date} · ${time
    .replace("Eastern Daylight Time", "ET")
    .replace("Eastern Standard Time", "ET")
    .replace("EDT", "ET")
    .replace("EST", "ET")}`;
}

function formatGeneratedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function formatMoneyline(value: unknown): string | null {
  const parsed = asNumber(value);
  if (parsed === null) return null;
  const rounded = Math.round(parsed);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function formatSignedNumber(value: number | null, digits = 1): string | null {
  if (value === null || Number.isNaN(value)) return null;
  const normalized = Math.abs(value % 1) < 0.001 ? value.toFixed(0) : value.toFixed(digits);
  return value > 0 ? `+${normalized}` : normalized;
}

function formatSpread(value: number | null, price: string | null): string | null {
  const line = formatSignedNumber(value);
  if (!line) return null;
  return price ? `${line} ${price}` : line;
}

function formatTotal(value: number | null): string | null {
  if (value === null || Number.isNaN(value)) return null;
  return Math.abs(value % 1) < 0.001 ? value.toFixed(0) : value.toFixed(1);
}

function getEtDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/New_York",
    year: "numeric",
  }).formatToParts(date);

  const lookup = new Map(parts.map((part) => [part.type, part.value]));
  return `${lookup.get("year")}-${lookup.get("month")}-${lookup.get("day")}`;
}

function humanizeLeague(leagueId: string): string {
  const league = leagueId.toLowerCase();
  if (league === "nba") return "NBA";
  if (league === "nhl") return "NHL";
  if (league === "mlb") return "MLB";
  if (league === "ncaab" || league === "mens-college-basketball") return "NCAAB";
  if (league === "mls") return "MLS";
  if (league === "epl" || league === "eng.1") return "EPL";
  if (league === "esp.1") return "La Liga";
  if (league === "ita.1") return "Serie A";
  if (league === "ger.1") return "Bundesliga";
  if (league === "fra.1") return "Ligue 1";
  if (league === "uefa.champions") return "UCL";
  if (league === "uefa.europa") return "UEL";
  if (league === "uefa.europa.conf") return "UECL";
  return leagueId.toUpperCase();
}

function inferSportFilter(leagueId: string): HomeSportFilter {
  const league = leagueId.toLowerCase();
  if (league === "nba") return "nba";
  if (league === "nhl") return "nhl";
  if (league === "mlb") return "mlb";
  if (league === "ncaab" || league === "mens-college-basketball") return "ncaab";
  if (league.includes(".") || league.startsWith("uefa") || league.startsWith("fifa") || league === "mls") {
    return "soccer";
  }
  return "featured";
}

function leagueColor(leagueId: string): string {
  const filter = inferSportFilter(leagueId);
  switch (filter) {
    case "nba":
      return "amber";
    case "nhl":
      return "ice";
    case "mlb":
      return "red";
    case "soccer":
      return "green";
    case "ncaab":
      return "orange";
    default:
      return "slate";
  }
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pickBadge(pickType: string): string {
  const normalized = pickType.toLowerCase();
  if (normalized.includes("money")) return "TREND";
  if (normalized.includes("spread")) return "SPREAD";
  if (normalized.includes("total") || normalized.includes("over") || normalized.includes("under")) return "TOTAL";
  return "TREND";
}

function pickSample(row: NormalizedPick): number {
  return Math.max(row.homeSample, row.awaySample, 0);
}

function pickStrength(row: NormalizedPick): number {
  return row.avgRate * 100;
}

function pickRecord(rate: number, sample: number): string {
  if (sample < 1 || rate <= 0) return "0-0";
  const wins = Math.round(rate * sample);
  const losses = Math.max(sample - wins, 0);
  return `${wins}-${losses}`;
}

function readTimestamp(row: Row): number {
  const raw = asString(row.updated_at) || asString(row.created_at) || asString(row.recorded_at);
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function runWithTimeout<T>(promiseFactory: () => Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promiseFactory(),
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("query timeout")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function buildWorldCupHref(homeTeam: string, awayTeam: string, startTime: string): string | null {
  const kickoffDate = startTime.slice(0, 10);
  const seed = ALL_MATCHES.find(
    (match) =>
      match.kickoff.slice(0, 10) === kickoffDate &&
      match.homeTeam.toLowerCase() === homeTeam.toLowerCase() &&
      match.awayTeam.toLowerCase() === awayTeam.toLowerCase(),
  );

  if (!seed) return null;
  return `/match/${seed.slug ?? matchSlug(seed.awayCode, seed.homeCode, kickoffDate)}`;
}

function mapLeagueToEspnSport(leagueId: string): string | null {
  const id = leagueId.toLowerCase();
  if (id === "nba") return "nba";
  if (id === "nhl") return "nhl";
  if (id === "mlb") return "mlb";
  if (id === "ncaab" || id === "mens-college-basketball") return "ncb";
  return null;
}

function buildEspnLogoUrl({
  leagueId,
  espnId,
  abbreviation,
  existing,
}: {
  abbreviation: string | null;
  espnId: string | null;
  existing: string | null;
  leagueId: string;
}): string | null {
  if (existing && existing.includes("espncdn.com")) return existing;

  if (inferSportFilter(leagueId) === "soccer" && espnId) {
    return `https://a.espncdn.com/i/teamlogos/soccer/500/${espnId}.png`;
  }

  const sport = mapLeagueToEspnSport(leagueId);
  if (!sport) return existing;

  const normalizedAbbreviation = abbreviation?.toLowerCase();
  if (normalizedAbbreviation) {
    return `https://a.espncdn.com/i/teamlogos/${sport}/500/${normalizedAbbreviation}.png`;
  }
  if (espnId) {
    return `https://a.espncdn.com/i/teamlogos/${sport}/500/${espnId}.png`;
  }

  return existing;
}

function normalizePickRows(data: unknown): NormalizedPick[] {
  return asArray<RawPickRow>(data)
    .map((row) => {
      const homeTeam = asString(row.home_team);
      const awayTeam = asString(row.away_team);
      const leagueId = asString(row.league_id) || asString(row.league, "unknown");
      const startTime = asString(row.start_time);
      const matchId =
        asString(row.match_id) ||
        buildCompositeKey(leagueId, homeTeam, awayTeam, startTime);

      return {
        avgRate: asNumber(row.avg_rate) ?? 0,
        awaySample: Math.round(asNumber(row.away_sample) ?? 0),
        awayTeam,
        homeSample: Math.round(asNumber(row.home_sample) ?? 0),
        homeTeam,
        leagueId,
        matchId,
        pickType: asString(row.pick_type, "trend"),
        play: asString(row.play),
        startTime,
      };
    })
    .filter((row) => row.homeTeam.length > 0 && row.awayTeam.length > 0 && row.play.length > 0);
}

function bestLineForMatch(rows: Row[]): Row | null {
  let best: Row | null = null;
  let bestScore = -1;

  for (const row of rows) {
    const sportsbook = asString(row.sportsbook || row.bookmaker || row.book || row.operator, "").toLowerCase();
    let score = 0;

    if (sportsbook.includes("draft")) score += 20;
    if (sportsbook.includes("fanduel")) score += 12;
    if (sportsbook.includes("betmgm")) score += 10;
    if (sportsbook.includes("caesars")) score += 8;
    if (sportsbook.includes("consensus")) score += 6;

    if (asNumber(row.home_moneyline ?? row.home_ml ?? row.moneyline_home) !== null) score += 3;
    if (asNumber(row.away_moneyline ?? row.away_ml ?? row.moneyline_away) !== null) score += 3;
    if (asNumber(row.home_spread ?? row.spread_home ?? row.spread) !== null) score += 2;
    if (asNumber(row.total ?? row.over_under ?? row.total_points ?? row.posted_total) !== null) score += 2;
    score += readTimestamp(row) / 1_000_000_000_000;

    if (score > bestScore) {
      best = row;
      bestScore = score;
    }
  }

  return best;
}

function parseOddsRow(row: Row | null): HomepageCardOdds {
  if (!row) {
    return {
      awayMoneyline: null,
      awaySpread: null,
      homeMoneyline: null,
      homeSpread: null,
      sportsbook: null,
      total: null,
    };
  }

  const homeSpreadValue =
    asNumber(row.home_spread ?? row.spread_home ?? row.spread) ??
    (asNumber(row.away_spread ?? row.spread_away) !== null ? -(asNumber(row.away_spread ?? row.spread_away) ?? 0) : null);
  const awaySpreadValue =
    asNumber(row.away_spread ?? row.spread_away) ??
    (homeSpreadValue !== null ? -homeSpreadValue : null);

  const homeSpreadPrice = formatMoneyline(row.home_spread_odds ?? row.home_spread_price ?? row.spread_price_home);
  const awaySpreadPrice = formatMoneyline(row.away_spread_odds ?? row.away_spread_price ?? row.spread_price_away);
  const totalValue = asNumber(row.total ?? row.over_under ?? row.total_points ?? row.posted_total);

  return {
    awayMoneyline: formatMoneyline(row.away_moneyline ?? row.away_ml ?? row.moneyline_away),
    awaySpread: formatSpread(awaySpreadValue, awaySpreadPrice),
    homeMoneyline: formatMoneyline(row.home_moneyline ?? row.home_ml ?? row.moneyline_home),
    homeSpread: formatSpread(homeSpreadValue, homeSpreadPrice),
    sportsbook: asString(row.sportsbook || row.bookmaker || row.book || row.operator, ""),
    total: formatTotal(totalValue),
  };
}

async function fetchTodayMatchRows(now: Date): Promise<Row[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  const windowStart = new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString();
  const todayEt = getEtDateKey(now);

  try {
    const result = await runWithTimeout(
      () =>
        supabase
          .from("match_feed")
          .select("*")
          .gte("start_time", windowStart)
          .lt("start_time", windowEnd)
          .order("start_time", { ascending: true })
          .limit(500),
      DEFAULT_QUERY_TIMEOUT_MS,
    );

    if ("error" in result && result.error) throw result.error;

    return asArray<Row>(result.data).filter((row) => {
      const startTime = asString(row.start_time);
      if (!startTime) return false;
      return getEtDateKey(new Date(startTime)) === todayEt;
    });
  } catch {
    return [];
  }
}

async function fetchOpeningLineRows(matchIds: string[]): Promise<Row[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase || matchIds.length === 0) return [];

  try {
    const result = await runWithTimeout(
      () =>
        supabase
          .from("opening_lines")
          .select("*")
          .in("match_id", matchIds)
          .limit(Math.max(matchIds.length * 4, 200)),
      DEFAULT_QUERY_TIMEOUT_MS,
    );

    if ("error" in result && result.error) throw result.error;
    return asArray<Row>(result.data);
  } catch {
    return [];
  }
}

async function fetchDailyPicks(now: Date): Promise<NormalizedPick[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];

  try {
    const primary = await runWithTimeout(
      () => supabase.rpc("get_picks"),
      DEFAULT_QUERY_TIMEOUT_MS,
    );

    if ("error" in primary && !primary.error) {
      return normalizePickRows(primary.data);
    }
  } catch {
    // fall through to dated RPC
  }

  try {
    const todayEt = getEtDateKey(now);
    const fallback = await runWithTimeout(
      () => supabase.rpc("get_daily_picks", { p_date: todayEt }),
      DEFAULT_QUERY_TIMEOUT_MS,
    );

    if ("error" in fallback && fallback.error) throw fallback.error;
    return normalizePickRows(fallback.data);
  } catch {
    return [];
  }
}

async function fetchTeamLogos(teamNames: string[]): Promise<Record<string, string>> {
  const supabase = createServerSupabaseClient();
  if (!supabase || teamNames.length === 0) return {};

  const lookup = new Map<string, string>();

  try {
    const result = await runWithTimeout(
      () => supabase.from("team_logos").select("*").limit(1000),
      DEFAULT_LOGO_TIMEOUT_MS,
    );

    if ("error" in result && !result.error) {
      for (const row of asArray<Row>(result.data)) {
        const teamName = asString(row.team_name || row.name);
        const logo = buildEspnLogoUrl({
          abbreviation: asNullableString(row.abbreviation),
          espnId: asNullableString(row.espn_id),
          existing: asNullableString(row.logo_url),
          leagueId: asString(row.league_id, "unknown"),
        });

        if (teamName && logo) lookup.set(normalizeName(teamName), logo);

        const canonicalName = asString(row.canonical_name);
        if (canonicalName && logo && !lookup.has(normalizeName(canonicalName))) {
          lookup.set(normalizeName(canonicalName), logo);
        }

        const oddsApiName = asString(row.odds_api_name);
        if (oddsApiName && logo && !lookup.has(normalizeName(oddsApiName))) {
          lookup.set(normalizeName(oddsApiName), logo);
        }
      }
    }
  } catch {
    // fall through to team registry fallback
  }

  if (lookup.size === 0) {
    try {
      const [teamsResult, canonicalResult] = await Promise.all([
        runWithTimeout(
          () => supabase.from("teams").select("name,short_name,abbreviation,league_id,logo_url").limit(5000),
          DEFAULT_LOGO_TIMEOUT_MS,
        ),
        runWithTimeout(
          () => supabase.from("canonical_teams").select("canonical_name,odds_api_name,espn_id,league_id").limit(5000),
          DEFAULT_LOGO_TIMEOUT_MS,
        ),
      ]);

      if ("error" in teamsResult && !teamsResult.error) {
        for (const row of asArray<Row>(teamsResult.data)) {
          const logo = buildEspnLogoUrl({
            abbreviation: asNullableString(row.abbreviation),
            espnId: null,
            existing: asNullableString(row.logo_url),
            leagueId: asString(row.league_id, "unknown"),
          });
          if (!logo) continue;
          const name = asString(row.name);
          const shortName = asString(row.short_name);
          if (name) lookup.set(normalizeName(name), logo);
          if (shortName) lookup.set(normalizeName(shortName), logo);
        }
      }

      if ("error" in canonicalResult && !canonicalResult.error) {
        for (const row of asArray<Row>(canonicalResult.data)) {
          const logo = buildEspnLogoUrl({
            abbreviation: null,
            espnId: asNullableString(row.espn_id),
            existing: null,
            leagueId: asString(row.league_id, "unknown"),
          });
          if (!logo) continue;
          const canonicalName = asString(row.canonical_name);
          const oddsApiName = asString(row.odds_api_name);
          if (canonicalName && !lookup.has(normalizeName(canonicalName))) {
            lookup.set(normalizeName(canonicalName), logo);
          }
          if (oddsApiName && !lookup.has(normalizeName(oddsApiName))) {
            lookup.set(normalizeName(oddsApiName), logo);
          }
        }
      }
    } catch {
      // ignore logo fallback failures
    }
  }

  const resolved: Record<string, string> = {};
  for (const teamName of teamNames) {
    const logo = lookup.get(normalizeName(teamName));
    if (logo) resolved[teamName] = logo;
  }
  return resolved;
}

export async function getHomepageBoardData(now: Date = new Date()): Promise<HomepageBoardData> {
  const [matchRows, dailyPicks] = await Promise.all([
    fetchTodayMatchRows(now),
    fetchDailyPicks(now),
  ]);

  if (matchRows.length === 0) {
    return {
      ...DEFAULT_BOARD_DATA,
      generatedAtEt: formatGeneratedAt(now.toISOString()),
      todayEtLabel: formatEtLongDate(now.toISOString()),
    };
  }

  const matchIds = matchRows
    .map((row) => asString(row.source_id || row.match_id || row.id || row.event_id))
    .filter(Boolean);

  const lineRows = await fetchOpeningLineRows(matchIds);
  const lineLookup = new Map<string, Row[]>();
  for (const row of lineRows) {
    const matchId = asString(row.match_id);
    if (!matchId) continue;
    const existing = lineLookup.get(matchId) ?? [];
    existing.push(row);
    lineLookup.set(matchId, existing);
  }

  const pickLookup = new Map<string, NormalizedPick>();
  for (const pick of dailyPicks) {
    const composite = buildCompositeKey(pick.leagueId, pick.homeTeam, pick.awayTeam, pick.startTime);
    pickLookup.set(pick.matchId, pick);
    pickLookup.set(composite, pick);
  }

  const teamNames = Array.from(
    new Set(
      matchRows.flatMap((row) => [
        asString(row.home_team_name),
        asString(row.away_team_name),
      ]).filter(Boolean),
    ),
  );
  const logos = await fetchTeamLogos(teamNames);

  const games: HomepageGameCard[] = matchRows
    .map((row, index) => {
      const homeTeam = asString(row.home_team_name);
      const awayTeam = asString(row.away_team_name);
      const leagueId = asString(row.league_id, "unknown");
      const startTime = asString(row.start_time);
      const matchId =
        asString(row.source_id || row.match_id || row.id || row.event_id) ||
        buildCompositeKey(leagueId, homeTeam, awayTeam, startTime);
      const compositeKey = buildCompositeKey(leagueId, homeTeam, awayTeam, startTime);
      const pick = pickLookup.get(matchId) ?? pickLookup.get(compositeKey) ?? null;
      const odds = parseOddsRow(bestLineForMatch(lineLookup.get(matchId) ?? []));
      const href =
        buildWorldCupHref(homeTeam, awayTeam, startTime) ??
        "/today";

      return {
        anchorId: `game-${matchId || index}`,
        awayLogo: logos[awayTeam] ?? null,
        awayTeam,
        homeLogo: logos[homeTeam] ?? null,
        homeTeam,
        href,
        leagueBadge: humanizeLeague(leagueId),
        leagueColor: leagueColor(leagueId),
        leagueId,
        matchId,
        odds,
        sportFilter: inferSportFilter(leagueId),
        sportLabel: humanizeLeague(leagueId),
        startTime,
        status: asString(row.status, "scheduled"),
        timeLabel: formatEtTimePill(startTime),
        trend: pick
          ? {
              badge: pickBadge(pick.pickType),
              pickType: pick.pickType,
              play: pick.play,
              sample: pickSample(pick),
              strength: pickStrength(pick),
            }
          : null,
      };
    })
    .filter((game) => game.homeTeam.length > 0 && game.awayTeam.length > 0 && game.startTime.length > 0)
    .sort((a, b) => {
      const featuredDelta = (b.trend?.strength ?? -1) - (a.trend?.strength ?? -1);
      if (featuredDelta !== 0) return featuredDelta;
      return a.startTime.localeCompare(b.startTime);
    });

  const sportCounts: Record<HomeSportFilter, number> = {
    featured: games.filter((game) => game.trend).length,
    mlb: games.filter((game) => game.sportFilter === "mlb").length,
    nba: games.filter((game) => game.sportFilter === "nba").length,
    ncaab: games.filter((game) => game.sportFilter === "ncaab").length,
    nhl: games.filter((game) => game.sportFilter === "nhl").length,
    soccer: games.filter((game) => game.sportFilter === "soccer").length,
  };

  const picks = games
    .filter((game) => game.trend)
    .sort((a, b) => (b.trend?.strength ?? 0) - (a.trend?.strength ?? 0))
    .slice(0, 4)
    .map((game) => ({
      awayTeam: game.awayTeam,
      homeTeam: game.homeTeam,
      href: game.href,
      leagueBadge: game.leagueBadge,
      leagueColor: game.leagueColor,
      play: game.trend?.play ?? "",
      record: pickRecord((game.trend?.strength ?? 0) / 100, game.trend?.sample ?? 0),
      sample: game.trend?.sample ?? 0,
      strength: game.trend?.strength ?? 0,
      timeLabel: game.timeLabel,
    }));

  return {
    featuredCount: sportCounts.featured,
    generatedAtEt: formatGeneratedAt(now.toISOString()),
    games,
    picks,
    sportCounts,
    todayEtLabel: formatEtLongDate(now.toISOString()),
  };
}

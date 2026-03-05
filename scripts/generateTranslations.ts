import { createClient } from '@supabase/supabase-js';
import { ALL_MATCHES } from '../src/data/all-matches';
import { EDGE_LANGUAGES } from '../src/data/languages';

type DbRow = Record<string, unknown>;

interface MatchForTranslation {
  slug: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  venue: string;
  groupName: string;
  probHome: number | null;
  probDraw: number | null;
  probAway: number | null;
}

interface TranslationPayload {
  title: string;
  meta_description: string;
  analysis_headline: string;
  analysis_body: string;
  key_factors: string[];
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://qffzvrnbzabcokqqrwbv.supabase.co';

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const TOURNAMENT_START = '2026-06-01T00:00:00.000Z';
const TOURNAMENT_END = '2026-07-31T23:59:59.999Z';
const SLEEP_MS = 500;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface ClaudeTextBlock {
  type: 'text';
  text: string;
}

interface ClaudeResponse {
  content?: ClaudeTextBlock[];
  error?: { message?: string };
}

const TEAM_ALIAS: Record<string, string> = {
  usa: 'united states',
  'u s a': 'united states',
  usmnt: 'united states',
  'korea republic': 'south korea',
  'republic of korea': 'south korea',
  "cote d ivoire": 'ivory coast',
  'cote divoire': 'ivory coast',
  "cote d'ivoire": 'ivory coast',
};

const SEEDS_BY_DATE = new Map<string, typeof ALL_MATCHES>();
for (const seed of ALL_MATCHES) {
  const dateKey = seed.kickoff.slice(0, 10);
  if (!SEEDS_BY_DATE.has(dateKey)) {
    SEEDS_BY_DATE.set(dateKey, []);
  }
  SEEDS_BY_DATE.get(dateKey)?.push(seed);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.trim();
    if (!cleaned) return null;
    const parsed = Number.parseFloat(cleaned.replace(/[^0-9.+-]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeProbability(value: unknown): number | null {
  const n = toNumber(value);
  if (n == null) return null;
  if (n > 0 && n < 1) return n;
  if (n >= 1 && n <= 100) return n / 100;
  return null;
}

function readFirstString(row: DbRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTeam(value: string): string {
  const normalized = normalizeText(value);
  return TEAM_ALIAS[normalized] ?? normalized;
}

function slugPart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dateOnly(input: string): string | null {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parseError(value: unknown): { code?: string; message?: string } | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as { code?: unknown; message?: unknown };
  return {
    code: typeof obj.code === 'string' ? obj.code : undefined,
    message: typeof obj.message === 'string' ? obj.message : undefined,
  };
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42703' || /column .* does not exist/i.test(error.message ?? '');
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? '');
}

function probToDecimal(prob: number | null): number | null {
  if (!prob || prob <= 0 || prob >= 1) return null;
  return 1 / prob;
}

function normalizeProbTriple(
  home: number | null,
  draw: number | null,
  away: number | null,
): { home: number | null; draw: number | null; away: number | null } {
  if (home == null || draw == null || away == null) {
    return { home, draw, away };
  }

  const total = home + draw + away;
  if (total <= 0) return { home: null, draw: null, away: null };

  return {
    home: home / total,
    draw: draw / total,
    away: away / total,
  };
}

function findSeedSlug(homeTeam: string, awayTeam: string, kickoffLike: string): string | null {
  const date = dateOnly(kickoffLike);
  if (!date) return null;

  const candidates = SEEDS_BY_DATE.get(date) ?? [];
  const home = normalizeTeam(homeTeam);
  const away = normalizeTeam(awayTeam);

  for (const seed of candidates) {
    const seedHome = normalizeTeam(seed.homeTeam);
    const seedAway = normalizeTeam(seed.awayTeam);

    if (seedHome === home && seedAway === away) return seed.slug;
    if (seedHome === away && seedAway === home) return seed.slug;
  }

  return null;
}

function toMatchContext(row: DbRow): MatchForTranslation | null {
  const rowHomeTeam = readFirstString(row, ['home_team', 'home_team_name', 'home_name']);
  const rowAwayTeam = readFirstString(row, ['away_team', 'away_team_name', 'away_name']);
  const kickoff = readFirstString(row, ['start_time', 'commence_time', 'kickoff', 'match_date']);

  if (!rowHomeTeam || !rowAwayTeam || !kickoff) {
    return null;
  }

  const directSlug = readFirstString(row, ['slug', 'match_slug']);
  const awayCode = readFirstString(row, ['away_team_code', 'away_code', 'away_abbr']);
  const homeCode = readFirstString(row, ['home_team_code', 'home_code', 'home_abbr']);

  const seedSlug = findSeedSlug(rowHomeTeam, rowAwayTeam, kickoff);
  const fallbackDate = dateOnly(kickoff);

  const generatedSlug = awayCode && homeCode && fallbackDate
    ? `${slugPart(awayCode)}-vs-${slugPart(homeCode)}-${fallbackDate}`
    : null;

  const slug = (directSlug || seedSlug || generatedSlug || '').replace(/^\/+|\/+$/g, '');
  if (!slug) return null;

  const venueName = readFirstString(row, ['venue_name', 'venue', 'stadium']) || 'Venue TBD';
  const venueCity = readFirstString(row, ['venue_city', 'city']);
  const venue = venueCity ? `${venueName}, ${venueCity}` : venueName;

  const groupLetter = readFirstString(row, ['group_letter']);
  const groupName =
    readFirstString(row, ['group_name']) ||
    (groupLetter ? `Group ${groupLetter.toUpperCase()}` : 'World Cup 2026');

  const baseHomeProb = normalizeProbability(row.prob_home ?? row.home_prob ?? row.home_probability);
  const baseDrawProb = normalizeProbability(row.prob_draw ?? row.draw_prob ?? row.draw_probability);
  const baseAwayProb = normalizeProbability(row.prob_away ?? row.away_prob ?? row.away_probability);

  let homeTeam = rowHomeTeam;
  let awayTeam = rowAwayTeam;
  let probHome = baseHomeProb;
  let probAway = baseAwayProb;

  if (seedSlug) {
    const seed = ALL_MATCHES.find((item) => item.slug === seedSlug);
    if (seed) {
      homeTeam = seed.homeTeam;
      awayTeam = seed.awayTeam;

      const rowHomeNorm = normalizeTeam(rowHomeTeam);
      const rowAwayNorm = normalizeTeam(rowAwayTeam);
      const seedHomeNorm = normalizeTeam(seed.homeTeam);
      const seedAwayNorm = normalizeTeam(seed.awayTeam);

      const swapped = rowHomeNorm === seedAwayNorm && rowAwayNorm === seedHomeNorm;
      if (swapped) {
        probHome = baseAwayProb;
        probAway = baseHomeProb;
      }
    }
  }

  const normalized = normalizeProbTriple(probHome, baseDrawProb, probAway);

  return {
    slug,
    homeTeam,
    awayTeam,
    matchDate: fallbackDate ?? kickoff.slice(0, 10),
    venue,
    groupName,
    probHome: normalized.home,
    probDraw: normalized.draw,
    probAway: normalized.away,
  };
}

function buildPrompt(match: MatchForTranslation, languageName: string): string {
  const homeProbPct = match.probHome == null ? 'N/A' : `${(match.probHome * 100).toFixed(1)}%`;
  const drawProbPct = match.probDraw == null ? 'N/A' : `${(match.probDraw * 100).toFixed(1)}%`;
  const awayProbPct = match.probAway == null ? 'N/A' : `${(match.probAway * 100).toFixed(1)}%`;

  const homeOdds = probToDecimal(match.probHome);
  const drawOdds = probToDecimal(match.probDraw);
  const awayOdds = probToDecimal(match.probAway);

  const homeOddsLabel = homeOdds == null ? 'N/A' : homeOdds.toFixed(2);
  const drawOddsLabel = drawOdds == null ? 'N/A' : drawOdds.toFixed(2);
  const awayOddsLabel = awayOdds == null ? 'N/A' : awayOdds.toFixed(2);

  return `You are a sports betting analyst writing World Cup 2026 match previews.
Write exclusively in ${languageName}. Every word of your response must be in ${languageName}.

Generate a match preview for:
${match.awayTeam} vs ${match.homeTeam}
Date: ${match.matchDate}
Venue: ${match.venue}
Group: ${match.groupName}
Win probabilities: ${match.awayTeam} ${awayProbPct} | Draw ${drawProbPct} | ${match.homeTeam} ${homeProbPct}
Model implied decimal odds: ${match.awayTeam} ${awayOddsLabel} | Draw ${drawOddsLabel} | ${match.homeTeam} ${homeOddsLabel}

Rules:
- Use only the data provided above.
- Do not invent rankings, injuries, form streaks, or historical records.
- Keep the meta description within 155 characters.

Return ONLY valid JSON, no markdown, no preamble:
{
  "title": "string, max 60 chars, format: '[Team A] vs [Team B] ... | The Drip'",
  "meta_description": "string in ${languageName}, max 155 chars, includes team names, odds, World Cup 2026",
  "analysis_headline": "string, one compelling sentence in ${languageName}",
  "analysis_body": "string, exactly 2 short paragraphs in ${languageName}, grounded in the probability data provided",
  "key_factors": ["string", "string", "string"]
}`;
}

function extractJsonPayload(raw: string): TranslationPayload {
  const trimmed = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in Claude response');
  }

  const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<TranslationPayload>;

  if (!parsed.title || !parsed.meta_description || !parsed.analysis_headline || !parsed.analysis_body) {
    throw new Error('Claude response is missing required fields');
  }

  const keyFactors = Array.isArray(parsed.key_factors)
    ? parsed.key_factors.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  return {
    title: parsed.title.trim(),
    meta_description: parsed.meta_description.trim().slice(0, 155),
    analysis_headline: parsed.analysis_headline.trim(),
    analysis_body: parsed.analysis_body.trim(),
    key_factors: keyFactors.slice(0, 6),
  };
}

async function fetchMatches(supabase: ReturnType<typeof createClient>): Promise<MatchForTranslation[]> {
  const attempts: Array<() => Promise<{ data: DbRow[] | null; error: unknown }>> = [
    async () =>
      supabase
        .from('matches')
        .select('*')
        .eq('tournament', 'wc2026')
        .order('start_time', { ascending: true }) as unknown as { data: DbRow[] | null; error: unknown },
    async () =>
      supabase
        .from('matches')
        .select('*')
        .eq('tournament', 'wc2026')
        .order('commence_time', { ascending: true }) as unknown as { data: DbRow[] | null; error: unknown },
    async () =>
      supabase
        .from('matches')
        .select('*')
        .gte('start_time', TOURNAMENT_START)
        .lte('start_time', TOURNAMENT_END)
        .order('start_time', { ascending: true }) as unknown as { data: DbRow[] | null; error: unknown },
    async () =>
      supabase
        .from('matches')
        .select('*')
        .gte('commence_time', TOURNAMENT_START)
        .lte('commence_time', TOURNAMENT_END)
        .order('commence_time', { ascending: true }) as unknown as { data: DbRow[] | null; error: unknown },
    async () =>
      supabase
        .from('matches')
        .select('*')
        .gte('kickoff', TOURNAMENT_START)
        .lte('kickoff', TOURNAMENT_END)
        .order('kickoff', { ascending: true }) as unknown as { data: DbRow[] | null; error: unknown },
  ];

  for (const attempt of attempts) {
    const { data, error } = await attempt();

    if (!error) {
      const rows = (data ?? []).map(toMatchContext).filter((row): row is MatchForTranslation => row !== null);
      const deduped = new Map<string, MatchForTranslation>();
      for (const row of rows) {
        deduped.set(row.slug, row);
      }
      return Array.from(deduped.values()).sort((a, b) => a.matchDate.localeCompare(b.matchDate));
    }

    const normalized = parseError(error);
    if (isMissingTableError(normalized)) {
      throw new Error('Supabase table `matches` was not found.');
    }

    if (isMissingColumnError(normalized)) {
      continue;
    }

    throw new Error(normalized?.message || 'Failed to load matches table');
  }

  return [];
}

async function fetchExistingPairs(
  supabase: ReturnType<typeof createClient>,
  slugs: string[],
): Promise<Map<string, Set<string>>> {
  const map = new Map<string, Set<string>>();
  if (slugs.length === 0) return map;

  const { data, error } = await supabase
    .from('match_translations')
    .select('match_slug, language_code')
    .in('match_slug', slugs);

  if (error) {
    const parsed = parseError(error);
    throw new Error(parsed?.message || 'Failed to read existing translations');
  }

  for (const row of (data as Array<{ match_slug?: string; language_code?: string }> | null) ?? []) {
    const slug = typeof row.match_slug === 'string' ? row.match_slug : null;
    const lang = typeof row.language_code === 'string' ? row.language_code : null;
    if (!slug || !lang) continue;

    if (!map.has(slug)) map.set(slug, new Set());
    map.get(slug)?.add(lang);
  }

  return map;
}

async function main() {
  if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY.length < 20) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY).');
  }

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.length < 20) {
    throw new Error('Missing ANTHROPIC_API_KEY.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('Fetching World Cup matches...');
  const matches = await fetchMatches(supabase);

  if (matches.length === 0) {
    console.log('No matches found for WC2026 filters. Nothing to generate.');
    return;
  }

  const existing = await fetchExistingPairs(
    supabase,
    matches.map((match) => match.slug),
  );

  const totalCombos = matches.length * EDGE_LANGUAGES.length;
  console.log(`Found ${matches.length} matches x ${EDGE_LANGUAGES.length} languages = ${totalCombos} combos.`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const match of matches) {
    console.log(`\n[${match.slug}] ${match.awayTeam} vs ${match.homeTeam}`);

    for (const language of EDGE_LANGUAGES) {
      const langSet = existing.get(match.slug) ?? new Set<string>();
      if (langSet.has(language.code)) {
        skipped += 1;
        console.log(`  - ${language.code}: already exists`);
        continue;
      }

      console.log(`  - ${language.code}: generating...`);

      try {
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1200,
            temperature: 0.2,
            messages: [
              {
                role: 'user',
                content: buildPrompt(match, language.name),
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Claude API ${response.status}: ${errorBody}`);
        }

        const json = (await response.json()) as ClaudeResponse;
        if (json.error?.message) {
          throw new Error(json.error.message);
        }

        const textBlock = json.content?.find((block) => block.type === 'text');
        if (!textBlock) {
          throw new Error('Claude returned no text content');
        }

        const payload = extractJsonPayload(textBlock.text);

        const { error } = await supabase.from('match_translations').insert({
          match_slug: match.slug,
          language_code: language.code,
          title: payload.title,
          meta_description: payload.meta_description,
          analysis_headline: payload.analysis_headline,
          analysis_body: payload.analysis_body,
          key_factors: payload.key_factors,
        });

        if (error) {
          const parsed = parseError(error);
          if (parsed?.code === '23505') {
            skipped += 1;
            console.log(`    skipped duplicate (${language.code})`);
            continue;
          }
          throw new Error(parsed?.message || 'Insert failed');
        }

        if (!existing.has(match.slug)) existing.set(match.slug, new Set<string>());
        existing.get(match.slug)?.add(language.code);

        generated += 1;
        console.log(`    saved (${language.code})`);
      } catch (error) {
        failed += 1;
        console.error(`    failed (${language.code}):`, error);
      }

      await sleep(SLEEP_MS);
    }
  }

  console.log('\nDone.');
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error('Translation generation failed:', error);
  process.exit(1);
});

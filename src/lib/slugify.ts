/**
 * Convert a match description to a URL-safe slug.
 * "USA vs Paraguay" → "usa-vs-paraguay"
 * Handles accented characters and special cases.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a match slug from team codes and date.
 * "USA", "PAR", "2026-06-12" → "usa-vs-par-2026-06-12"
 */
export function matchSlug(awayCode: string, homeCode: string, date: string): string {
  return `${awayCode.toLowerCase()}-vs-${homeCode.toLowerCase()}-${date}`;
}

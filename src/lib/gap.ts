/**
 * Gap calculation utilities.
 * Computes the difference between sportsbook consensus and
 * prediction market consensus implied probabilities.
 */

import { americanToImplied } from './odds';

/**
 * Calculate the gap for a single team/side between sportsbook
 * implied probability and prediction market implied probability.
 * Returns percentage points (e.g. 4.2 means 4.2%).
 */
export function teamGap(sbImplied: number, pmImplied: number): number {
  return Math.abs(sbImplied - pmImplied) * 100;
}

/**
 * Calculate the maximum gap across all sides (home/away/draw)
 * for a single game. Takes arrays of sportsbook odds and PM prices.
 *
 * sbOdds: array of { side: 'home'|'away'|'draw', odds: number (American) }
 * pmPrices: array of { side: 'home'|'away'|'draw', price: number (cents 0-100) }
 *
 * Returns the max gap in percentage points.
 */
export function maxGapForGame(
  sbOdds: { side: string; odds: number }[],
  pmPrices: { side: string; price: number }[]
): number {
  const sides = ['home', 'away', 'draw'];
  let maxGap = 0;

  for (const side of sides) {
    const sbForSide = sbOdds.filter(o => o.side === side);
    const pmForSide = pmPrices.filter(p => p.side === side);

    if (sbForSide.length === 0 || pmForSide.length === 0) continue;

    // Average implied probability across all sportsbooks for this side
    const sbAvg =
      sbForSide.reduce((sum, o) => sum + americanToImplied(o.odds), 0) /
      sbForSide.length;

    // Average implied probability across all prediction markets for this side
    const pmAvg =
      pmForSide.reduce((sum, p) => sum + p.price / 100, 0) /
      pmForSide.length;

    const gap = teamGap(sbAvg, pmAvg);
    if (gap > maxGap) maxGap = gap;
  }

  return Math.round(maxGap * 10) / 10;
}

/**
 * Sort comparator: highest gap first.
 */
export function byMaxGapDesc(a: { maxGap: number }, b: { maxGap: number }): number {
  return b.maxGap - a.maxGap;
}

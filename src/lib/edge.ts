/**
 * Edge insight engine.
 * Analyzes the gap between sportsbook and prediction market pricing
 * and generates actionable insights + CTAs.
 */

import type { EdgeInsight, CTA, VenueType } from '../types';
import { americanToImplied } from './odds';

/** Minimum gap to show international sportsbooks (percentage points) */
export const INTL_THRESHOLD = 1.5;

/** Minimum gap to feature on the landing page */
export const MIN_FEATURED_GAP = 2.0;

interface OddsInput {
  book: string;
  type: VenueType;
  side: string;
  odds: number;       // American odds for sportsbooks, cents for PMs
  url?: string;
}

/**
 * Determine confidence level based on gap magnitude and data freshness.
 */
function getConfidence(gapPct: number, sourceCount: number): 'high' | 'medium' | 'low' {
  if (gapPct >= 5 && sourceCount >= 3) return 'high';
  if (gapPct >= 2 && sourceCount >= 2) return 'medium';
  return 'low';
}

/**
 * Build CTAs based on the edge direction and magnitude.
 */
function buildCTAs(
  direction: 'sportsbook_high' | 'prediction_high',
  bestSb: OddsInput | undefined,
  bestPm: OddsInput | undefined,
): CTA[] {
  const ctas: CTA[] = [];

  if (direction === 'sportsbook_high' && bestPm) {
    // PM is pricing lower → sportsbook offers more value → bet sportsbook
    if (bestSb?.url) {
      ctas.push({
        label: `Bet on ${bestSb.book}`,
        url: bestSb.url,
        book: bestSb.book,
        action: 'bet_sportsbook',
      });
    }
    if (bestPm.url) {
      ctas.push({
        label: `Buy on ${bestPm.book}`,
        url: bestPm.url,
        book: bestPm.book,
        action: 'buy_contract',
      });
    }
  } else if (direction === 'prediction_high' && bestSb) {
    // PM is pricing higher → PM sees more value → buy PM contract
    if (bestPm?.url) {
      ctas.push({
        label: `Buy on ${bestPm.book}`,
        url: bestPm.url,
        book: bestPm.book,
        action: 'buy_contract',
      });
    }
    if (bestSb.url) {
      ctas.push({
        label: `Bet on ${bestSb.book}`,
        url: bestSb.url,
        book: bestSb.book,
        action: 'bet_sportsbook',
      });
    }
  }

  return ctas.slice(0, 2); // max 2 CTAs
}

/**
 * Core edge analysis function.
 * Computes the gap between sportsbook consensus and PM consensus
 * for a given side and returns a complete EdgeInsight.
 */
export function getEdgeInsight(
  awayTeam: string,
  homeTeam: string,
  side: 'home' | 'away' | 'draw',
  allOdds: OddsInput[],
): EdgeInsight {
  const sbOdds = allOdds.filter(o => o.type !== 'prediction_market' && o.side === side);
  const pmOdds = allOdds.filter(o => o.type === 'prediction_market' && o.side === side);

  if (sbOdds.length === 0 || pmOdds.length === 0) {
    return {
      gapPct: 0,
      direction: 'sportsbook_high',
      summary: 'Insufficient data to compute edge.',
      ctas: [],
      confidence: 'low',
    };
  }

  // Average SB implied probability
  const sbAvgImplied =
    sbOdds.reduce((sum, o) => sum + americanToImplied(o.odds), 0) / sbOdds.length;

  // Average PM implied probability (prices in cents)
  const pmAvgImplied =
    pmOdds.reduce((sum, o) => sum + o.odds / 100, 0) / pmOdds.length;

  const gapPct = Math.round(Math.abs(sbAvgImplied - pmAvgImplied) * 1000) / 10;
  const direction: 'sportsbook_high' | 'prediction_high' =
    sbAvgImplied > pmAvgImplied ? 'sportsbook_high' : 'prediction_high';

  const teamName = side === 'home' ? homeTeam : side === 'away' ? awayTeam : 'Draw';
  const sbPctStr = `${(sbAvgImplied * 100).toFixed(1)}%`;
  const pmPctStr = `${(pmAvgImplied * 100).toFixed(1)}%`;

  // Find best odds for CTA
  const bestSb = sbOdds.reduce<OddsInput | undefined>(
    (best, o) => (!best || americanToImplied(o.odds) < americanToImplied(best.odds) ? o : best),
    undefined
  );
  const bestPm = pmOdds.reduce<OddsInput | undefined>(
    (best, p) => (!best || p.odds < (best?.odds ?? Infinity) ? p : best),
    undefined
  );

  const ctas = buildCTAs(direction, bestSb, bestPm);

  const summary = direction === 'sportsbook_high'
    ? `Sportsbooks imply ${sbPctStr} for ${teamName} while prediction markets price at ${pmPctStr}. ${gapPct}% gap favors the prediction market side.`
    : `Prediction markets imply ${pmPctStr} for ${teamName} while sportsbooks price at ${sbPctStr}. ${gapPct}% gap favors the sportsbook side.`;

  return {
    gapPct,
    direction,
    summary,
    ctas,
    confidence: getConfidence(gapPct, sbOdds.length + pmOdds.length),
  };
}

/**
 * Check whether international sportsbooks should be shown
 * based on the gap exceeding INTL_THRESHOLD.
 */
export function shouldShowIntl(gapPct: number): boolean {
  return gapPct >= INTL_THRESHOLD;
}

/**
 * Check if a game qualifies for the featured edges section.
 */
export function isFeaturedEdge(gapPct: number): boolean {
  return gapPct >= MIN_FEATURED_GAP;
}

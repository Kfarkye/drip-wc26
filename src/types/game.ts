export type VenueType = 'us_regulated' | 'international' | 'prediction_market';

export type GameStatus = 'pre' | 'live' | 'final' | 'postponed';

export type Sport = 'soccer' | 'futures';

export interface OddsLine {
  book: string;
  type: VenueType;
  away: number;   // American odds or contract price (cents)
  home: number;
  draw?: number;
  updated: string; // ISO timestamp
}

export interface PMPrice {
  book: string;
  type: 'prediction_market';
  away: number;   // Contract price in cents (0-100)
  home: number;
  draw?: number;
  updated: string;
}

export type CTAAction = 'bet_sportsbook' | 'buy_contract' | 'sell_contract' | 'no_action';

export interface CTA {
  label: string;
  url: string;
  book: string;
  action: CTAAction;
}

export interface EdgeInsight {
  gapPct: number;
  direction: 'sportsbook_high' | 'prediction_high';
  summary: string;
  ctas: CTA[];
  confidence: 'high' | 'medium' | 'low';
}

export interface Game {
  id: string;
  slug: string;
  sport: Sport;
  awayTeam: string;
  homeTeam: string;
  awayCode: string;
  homeCode: string;
  gameTime: string;     // ISO 8601
  venue: string;
  venueCity: string;
  status: GameStatus;
  sportsbook: OddsLine[];
  pm: PMPrice[];
  maxGap: number;       // Percentage points
  updatedAt: string;
}

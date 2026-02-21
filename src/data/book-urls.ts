/**
 * Affiliate URL map for all tracked sportsbooks and prediction markets.
 * Use these URLs for CTAs — they include tracking parameters.
 *
 * NOTE: Replace placeholder affiliate IDs with real ones before launch.
 * Format: { [bookId]: { base: string, signup?: string, promo?: string } }
 */

export interface BookUrl {
    base: string;
    signup?: string;
    promo?: string;
}

export const BOOK_URLS: Record<string, BookUrl> = {
    // US Regulated Sportsbooks
    draftkings: {
        base: 'https://sportsbook.draftkings.com',
        signup: 'https://sportsbook.draftkings.com/r/thedrip',
    },
    fanduel: {
        base: 'https://sportsbook.fanduel.com',
        signup: 'https://sportsbook.fanduel.com/join?utm_source=thedrip',
    },
    betmgm: {
        base: 'https://sports.betmgm.com',
        signup: 'https://sports.betmgm.com/en/mobileportal/register?utm_source=thedrip',
    },
    caesars: {
        base: 'https://www.caesars.com/sportsbook-and-casino',
        signup: 'https://www.caesars.com/sportsbook-and-casino/join?utm_source=thedrip',
    },
    betrivers: {
        base: 'https://www.betrivers.com',
        signup: 'https://www.betrivers.com/ref/thedrip',
    },

    // International Sportsbooks
    bovada: {
        base: 'https://www.bovada.lv',
        signup: 'https://www.bovada.lv/?utm_source=thedrip',
    },
    betonline: {
        base: 'https://www.betonline.ag',
        signup: 'https://www.betonline.ag/?utm_source=thedrip',
    },

    // Prediction Markets
    kalshi: {
        base: 'https://kalshi.com',
        signup: 'https://kalshi.com/sign-up/?referral=thedrip',
    },
    polymarket: {
        base: 'https://polymarket.com',
        signup: 'https://polymarket.com/?ref=thedrip',
    },
    robinhood: {
        base: 'https://robinhood.com',
        signup: 'https://join.robinhood.com/thedrip',
    },
    interactive_brokers: {
        base: 'https://www.interactivebrokers.com',
        signup: 'https://www.interactivebrokers.com/referral/thedrip',
    },
};

/** Get the best URL for a given book (prefer signup/affiliate over base) */
export function getBookUrl(bookId: string): string {
    const urls = BOOK_URLS[bookId];
    if (!urls) return '#';
    return urls.signup ?? urls.base;
}

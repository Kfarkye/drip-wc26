/**
 * Withdrawal/deposit metadata for all 12 venues tracked by The Drip.
 * 5 US regulated sportsbooks, 2 international, 5 prediction markets.
 */

import type { Venue } from '../types';

export const VENUES: Venue[] = [
    // ═══ US REGULATED SPORTSBOOKS ═══
    {
        id: 'draftkings',
        name: 'DraftKings',
        type: 'us_regulated',
        url: 'https://sportsbook.draftkings.com',
        withdrawals: [
            { method: 'PayPal', speed: '1-3 business days', fee: 'Free', min: '$20', max: '$10,000' },
            { method: 'Bank Transfer (ACH)', speed: '3-5 business days', fee: 'Free', min: '$20', max: '$100,000' },
            { method: 'Check', speed: '7-14 business days', fee: 'Free', min: '$20', max: '$100,000' },
            { method: 'VIP Preferred (e-check)', speed: '3-5 business days', fee: 'Free', min: '$20', max: '$10,000' },
        ],
        deposits: [
            { method: 'Debit/Credit Card', speed: 'Instant', fee: 'Free', min: '$5', max: '$5,000' },
            { method: 'PayPal', speed: 'Instant', fee: 'Free', min: '$5', max: '$5,000' },
            { method: 'Bank Transfer', speed: 'Instant', fee: 'Free', min: '$5', max: '$50,000' },
        ],
    },
    {
        id: 'fanduel',
        name: 'FanDuel',
        type: 'us_regulated',
        url: 'https://sportsbook.fanduel.com',
        withdrawals: [
            { method: 'PayPal', speed: '1-3 business days', fee: 'Free', min: '$10', max: '$10,000' },
            { method: 'Bank Transfer (ACH)', speed: '3-5 business days', fee: 'Free', min: '$10', max: '$100,000' },
            { method: 'Check', speed: '7-14 business days', fee: 'Free', min: '$10', max: '$100,000' },
            { method: 'Venmo', speed: '1-3 business days', fee: 'Free', min: '$10', max: '$5,000' },
        ],
        deposits: [
            { method: 'Debit/Credit Card', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'PayPal', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'Venmo', speed: 'Instant', fee: 'Free', min: '$10', max: '$2,000' },
        ],
    },
    {
        id: 'betmgm',
        name: 'BetMGM',
        type: 'us_regulated',
        url: 'https://sports.betmgm.com',
        withdrawals: [
            { method: 'PayPal', speed: '1-3 business days', fee: 'Free', min: '$20', max: '$10,000' },
            { method: 'Bank Transfer (ACH)', speed: '3-5 business days', fee: 'Free', min: '$20', max: '$25,000' },
            { method: 'Check', speed: '7-14 business days', fee: 'Free', min: '$25', max: '$25,000' },
        ],
        deposits: [
            { method: 'Debit/Credit Card', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'PayPal', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'Bank Transfer', speed: 'Instant', fee: 'Free', min: '$10', max: '$50,000' },
        ],
    },
    {
        id: 'caesars',
        name: 'Caesars Sportsbook',
        type: 'us_regulated',
        url: 'https://www.caesars.com/sportsbook-and-casino',
        withdrawals: [
            { method: 'PayPal', speed: '1-3 business days', fee: 'Free', min: '$20', max: '$10,000' },
            { method: 'Bank Transfer (ACH)', speed: '3-5 business days', fee: 'Free', min: '$20', max: '$100,000' },
            { method: 'Check', speed: '7-14 business days', fee: 'Free', min: '$20', max: '$100,000' },
        ],
        deposits: [
            { method: 'Debit/Credit Card', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'PayPal', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
        ],
    },
    {
        id: 'betrivers',
        name: 'BetRivers',
        type: 'us_regulated',
        url: 'https://www.betrivers.com',
        withdrawals: [
            { method: 'PayPal', speed: '1-3 business days', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'Bank Transfer (ACH)', speed: '3-5 business days', fee: 'Free', min: '$10', max: '$25,000' },
            { method: 'Check', speed: '7-14 business days', fee: 'Free', min: '$10', max: '$25,000' },
        ],
        deposits: [
            { method: 'Debit/Credit Card', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'PayPal', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
        ],
    },

    // ═══ INTERNATIONAL SPORTSBOOKS ═══
    {
        id: 'bovada',
        name: 'Bovada',
        type: 'international',
        url: 'https://www.bovada.lv',
        withdrawals: [
            { method: 'Bitcoin', speed: '15 minutes - 1 hour', fee: 'Free', min: '$10', max: '$9,500' },
            { method: 'Check by Courier', speed: '10-15 business days', fee: '$100', min: '$100', max: '$3,000' },
            { method: 'Bank Wire', speed: '5-10 business days', fee: '$50', min: '$1,500', max: '$9,500' },
        ],
        deposits: [
            { method: 'Bitcoin', speed: 'Instant', fee: 'Free', min: '$10', max: '$5,000' },
            { method: 'Credit Card', speed: 'Instant', fee: '15.9%', min: '$20', max: '$1,500' },
        ],
    },
    {
        id: 'betonline',
        name: 'BetOnline',
        type: 'international',
        url: 'https://www.betonline.ag',
        withdrawals: [
            { method: 'Bitcoin', speed: 'Within 24 hours', fee: 'Free (1st/month)', min: '$20', max: '$25,000' },
            { method: 'Check', speed: '7-10 business days', fee: '$50', min: '$500', max: '$2,500' },
            { method: 'Bank Wire', speed: '5-7 business days', fee: '3%', min: '$500', max: '$24,900' },
        ],
        deposits: [
            { method: 'Bitcoin', speed: 'Instant', fee: 'Free', min: '$20', max: '$500,000' },
            { method: 'Credit Card', speed: 'Instant', fee: '7.5%', min: '$25', max: '$5,000' },
        ],
    },

    // ═══ PREDICTION MARKETS ═══
    {
        id: 'kalshi',
        name: 'Kalshi',
        type: 'prediction_market',
        url: 'https://kalshi.com',
        regulatoryNote: 'US-regulated event contract exchange',
        withdrawals: [
            { method: 'Bank Transfer (ACH)', speed: '1-3 business days', fee: 'Free', min: '$1', max: '$250,000' },
            { method: 'Wire Transfer', speed: '1 business day', fee: '$25', min: '$5,000', max: '$250,000' },
        ],
        deposits: [
            { method: 'Bank Transfer (ACH)', speed: 'Instant (up to $10k)', fee: 'Free', min: '$1', max: '$250,000' },
            { method: 'Wire Transfer', speed: 'Same day', fee: '$25', min: '$1', max: '$250,000' },
            { method: 'Debit Card', speed: 'Instant', fee: 'Free', min: '$1', max: '$10,000' },
        ],
    },
    {
        id: 'polymarket',
        name: 'Polymarket',
        type: 'prediction_market',
        url: 'https://polymarket.com',
        withdrawals: [
            { method: 'USDC (Polygon)', speed: 'Instant', fee: 'Network gas', min: '$1', max: 'No limit' },
            { method: 'Crypto bridge to bank', speed: 'Varies', fee: 'Exchange fees', min: 'Varies', max: 'No limit' },
        ],
        deposits: [
            { method: 'USDC (Polygon)', speed: 'Instant', fee: 'Network gas', min: '$1', max: 'No limit' },
            { method: 'Debit Card (via MoonPay)', speed: 'Minutes', fee: '~3.5%', min: '$20', max: '$10,000' },
        ],
    },
    {
        id: 'robinhood',
        name: 'Robinhood',
        type: 'prediction_market',
        url: 'https://robinhood.com',
        withdrawals: [
            { method: 'Bank Transfer (ACH)', speed: '1-3 business days', fee: 'Free', min: '$1', max: '$50,000' },
            { method: 'Wire Transfer', speed: 'Same day', fee: '$25', min: '$1', max: 'No limit' },
        ],
        deposits: [
            { method: 'Bank Transfer (ACH)', speed: 'Instant (up to $5k)', fee: 'Free', min: '$1', max: '$50,000' },
            { method: 'Wire Transfer', speed: 'Same day', fee: '$0', min: '$1', max: 'No limit' },
        ],
    },
    {
        id: 'interactive_brokers',
        name: 'Interactive Brokers',
        type: 'prediction_market',
        url: 'https://www.interactivebrokers.com',
        withdrawals: [
            { method: 'Bank Transfer (ACH)', speed: '1-4 business days', fee: 'Free (1st/month)', min: '$1', max: 'No limit' },
            { method: 'Wire Transfer', speed: '1 business day', fee: '$10', min: '$1', max: 'No limit' },
        ],
        deposits: [
            { method: 'Bank Transfer (ACH)', speed: '1-4 business days', fee: 'Free', min: '$1', max: 'No limit' },
            { method: 'Wire Transfer', speed: 'Same day', fee: '$0', min: '$1', max: 'No limit' },
        ],
    },
];

/** Look up a venue by ID */
export function getVenueById(id: string): Venue | undefined {
    return VENUES.find(v => v.id === id);
}

/** Get all venues of a given type */
export function getVenuesByType(type: Venue['type']): Venue[] {
    return VENUES.filter(v => v.type === type);
}

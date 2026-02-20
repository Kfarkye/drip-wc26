/**
 * Convert American odds to implied probability
 * +150 → 0.4000 (40%)
 * -200 → 0.6667 (66.67%)
 */
export function americanToImplied(odds: number): number {
    if (odds > 0) {
        return 100 / (odds + 100)
    } else {
        return Math.abs(odds) / (Math.abs(odds) + 100)
    }
}

/**
 * Convert implied probability to American odds
 * 0.40 → +150
 * 0.667 → -200
 */
export function impliedToAmerican(prob: number): number {
    if (prob <= 0 || prob >= 1) throw new Error('Probability must be between 0 and 1')
    if (prob < 0.5) {
        return Math.round((100 / prob) - 100)
    } else {
        return Math.round(-100 * prob / (1 - prob))
    }
}

/**
 * Calculate edge between sportsbook and prediction market
 * Returns percentage points of edge
 *
 * Positive = sportsbook offering more value than prediction market suggests
 * Negative = sportsbook line is tight relative to prediction market
 */
export function calculateEdge(
    sportsbookOdds: number,
    predictionPriceCents: number
): {
    edge: number
    sportsbookImplied: number
    predictionImplied: number
    direction: 'sportsbook_high' | 'prediction_high'
    fairValueAmerican: number
} {
    const sportsbookImplied = americanToImplied(sportsbookOdds)
    const predictionImplied = predictionPriceCents / 100

    const edge = Math.abs(sportsbookImplied - predictionImplied) * 100
    const direction = sportsbookImplied > predictionImplied
        ? 'sportsbook_high'
        : 'prediction_high'

    const fairValueAmerican = impliedToAmerican(predictionImplied)

    return {
        edge: Math.round(edge * 10) / 10,
        sportsbookImplied,
        predictionImplied,
        direction,
        fairValueAmerican,
    }
}

/**
 * Calculate fair (devigged) probabilities using the Multiplicative (Power) Method
 * Corrects for the sportsbook overround/vig to find the "Oracle" fair value.
 */
export function devigPower(impliedProbs: number[]): number[] {
    const sum = impliedProbs.reduce((a, b) => a + b, 0);
    if (sum <= 1) return impliedProbs; // Already fair or better

    // Solve for k where sum(p_i ^ k) = 1
    // For most markets, 1/sum is a close enough linear approximation for the Power Method
    // but for high-precision we iterate.
    let k = 1.0;
    let currentSum = sum;

    // Simple iterative approach to find the power factor
    for (let i = 0; i < 10; i++) {
        k = k * (Math.log(0.5) / Math.log(currentSum / sum || 0.5));
        currentSum = impliedProbs.reduce((a, b) => a + Math.pow(b, k), 0);
    }

    return impliedProbs.map(p => Math.pow(p, k));
}

/**
 * Format American odds for display
 * 150 → "+150"
 * -200 → "-200"
 */
export function formatOdds(odds: number): string {
    return odds > 0 ? `+${odds}` : `${odds}`
}

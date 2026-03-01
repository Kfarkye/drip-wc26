/**
 * Map FIFA 3-letter codes to flagcdn.com 2-letter ISO codes.
 * flagcdn uses ISO 3166-1 alpha-2 with some special sub-national codes.
 */
const FIFA_TO_FLAG: Record<string, string> = {
    MEX: 'mx', KOR: 'kr', RSA: 'za',
    CAN: 'ca', SUI: 'ch', QAT: 'qa',
    BRA: 'br', MAR: 'ma', SCO: 'gb-sct', HAI: 'ht',
    USA: 'us', PAR: 'py', AUS: 'au',
    GER: 'de', CIV: 'ci', ECU: 'ec', CUW: 'cw',
    NED: 'nl', JPN: 'jp', TUN: 'tn',
    BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
    ESP: 'es', URU: 'uy', KSA: 'sa', CPV: 'cv',
    FRA: 'fr', NOR: 'no', SEN: 'sn',
    ARG: 'ar', AUT: 'at', ALG: 'dz', JOR: 'jo',
    POR: 'pt', COL: 'co', UZB: 'uz',
    ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
};

export function getFlagUrl(fifaCode: string): string | null {
    const iso = FIFA_TO_FLAG[fifaCode.toUpperCase()];
    if (!iso) return null;
    return `https://flagcdn.com/${iso}.svg`;
}

export function getFlagCode(fifaCode: string): string | null {
    return FIFA_TO_FLAG[fifaCode.toUpperCase()] ?? null;
}

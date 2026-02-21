export interface TeamInfo {
    name: string;
    code: string;
    flag: string;
}

export interface MatchInfo {
    homeTeam: { name: string; code: string };
    awayTeam: { name: string; code: string };
    venue: { name: string; city: string; state?: string; country: string };
    kickoff: string;
    matchNumber: number;
}

export interface GroupInfo {
    letter: string;
    teams: TeamInfo[];
    matches: MatchInfo[];
}

// ═══════════════════════════════════════════════════════════════
// FIFA World Cup 2026 — Official Group Draw (Dec 5, 2025)
// 48 teams · 12 groups · 72 group stage matches
// Playoff winners TBD (March 2026)
// ═══════════════════════════════════════════════════════════════

export const groupA: GroupInfo = {
    letter: 'A',
    teams: [
        { name: 'Mexico', code: 'MEX', flag: '🇲🇽' },
        { name: 'South Korea', code: 'KOR', flag: '🇰🇷' },
        { name: 'South Africa', code: 'RSA', flag: '🇿🇦' },
        { name: 'UEFA Playoff D', code: 'A4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'Mexico', code: 'MEX' },
            awayTeam: { name: 'South Africa', code: 'RSA' },
            venue: { name: 'Estadio Azteca', city: 'Mexico City', country: 'MX' },
            kickoff: '2026-06-11T12:00:00-06:00',
            matchNumber: 1
        },
        {
            homeTeam: { name: 'South Korea', code: 'KOR' },
            awayTeam: { name: 'UEFA Playoff D', code: 'A4' },
            venue: { name: 'Estadio Akron', city: 'Guadalajara', country: 'MX' },
            kickoff: '2026-06-11T22:00:00-06:00',
            matchNumber: 2
        },
        {
            homeTeam: { name: 'Mexico', code: 'MEX' },
            awayTeam: { name: 'South Korea', code: 'KOR' },
            venue: { name: 'Estadio BBVA', city: 'Monterrey', country: 'MX' },
            kickoff: '2026-06-16T18:00:00-06:00',
            matchNumber: 13
        },
        {
            homeTeam: { name: 'South Africa', code: 'RSA' },
            awayTeam: { name: 'UEFA Playoff D', code: 'A4' },
            venue: { name: 'Estadio Azteca', city: 'Mexico City', country: 'MX' },
            kickoff: '2026-06-16T15:00:00-06:00',
            matchNumber: 14
        },
        {
            homeTeam: { name: 'Mexico', code: 'MEX' },
            awayTeam: { name: 'UEFA Playoff D', code: 'A4' },
            venue: { name: 'Estadio Azteca', city: 'Mexico City', country: 'MX' },
            kickoff: '2026-06-21T18:00:00-06:00',
            matchNumber: 25
        },
        {
            homeTeam: { name: 'South Korea', code: 'KOR' },
            awayTeam: { name: 'South Africa', code: 'RSA' },
            venue: { name: 'Estadio Akron', city: 'Guadalajara', country: 'MX' },
            kickoff: '2026-06-21T18:00:00-06:00',
            matchNumber: 26
        }
    ]
};

export const groupB: GroupInfo = {
    letter: 'B',
    teams: [
        { name: 'Canada', code: 'CAN', flag: '🇨🇦' },
        { name: 'Switzerland', code: 'SUI', flag: '🇨🇭' },
        { name: 'Qatar', code: 'QAT', flag: '🇶🇦' },
        { name: 'UEFA Playoff A', code: 'B4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'Canada', code: 'CAN' },
            awayTeam: { name: 'UEFA Playoff A', code: 'B4' },
            venue: { name: 'BMO Field', city: 'Toronto', state: 'ON', country: 'CA' },
            kickoff: '2026-06-12T15:00:00-04:00',
            matchNumber: 3
        },
        {
            homeTeam: { name: 'Switzerland', code: 'SUI' },
            awayTeam: { name: 'Qatar', code: 'QAT' },
            venue: { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'US' },
            kickoff: '2026-06-13T15:00:00-04:00',
            matchNumber: 7
        },
        {
            homeTeam: { name: 'Canada', code: 'CAN' },
            awayTeam: { name: 'Switzerland', code: 'SUI' },
            venue: { name: 'BC Place', city: 'Vancouver', state: 'BC', country: 'CA' },
            kickoff: '2026-06-17T18:00:00-07:00',
            matchNumber: 15
        },
        {
            homeTeam: { name: 'Qatar', code: 'QAT' },
            awayTeam: { name: 'UEFA Playoff A', code: 'B4' },
            venue: { name: 'BMO Field', city: 'Toronto', state: 'ON', country: 'CA' },
            kickoff: '2026-06-17T15:00:00-04:00',
            matchNumber: 16
        },
        {
            homeTeam: { name: 'Canada', code: 'CAN' },
            awayTeam: { name: 'Qatar', code: 'QAT' },
            venue: { name: 'BC Place', city: 'Vancouver', state: 'BC', country: 'CA' },
            kickoff: '2026-06-22T18:00:00-07:00',
            matchNumber: 27
        },
        {
            homeTeam: { name: 'Switzerland', code: 'SUI' },
            awayTeam: { name: 'UEFA Playoff A', code: 'B4' },
            venue: { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'US' },
            kickoff: '2026-06-22T18:00:00-07:00',
            matchNumber: 28
        }
    ]
};

export const groupC: GroupInfo = {
    letter: 'C',
    teams: [
        { name: 'Brazil', code: 'BRA', flag: '🇧🇷' },
        { name: 'Morocco', code: 'MAR', flag: '🇲🇦' },
        { name: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
        { name: 'Haiti', code: 'HAI', flag: '🇭🇹' }
    ],
    matches: [
        {
            homeTeam: { name: 'Brazil', code: 'BRA' },
            awayTeam: { name: 'Morocco', code: 'MAR' },
            venue: { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'US' },
            kickoff: '2026-06-12T18:00:00-04:00',
            matchNumber: 4
        },
        {
            homeTeam: { name: 'Scotland', code: 'SCO' },
            awayTeam: { name: 'Haiti', code: 'HAI' },
            venue: { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'US' },
            kickoff: '2026-06-13T21:00:00-04:00',
            matchNumber: 8
        },
        {
            homeTeam: { name: 'Brazil', code: 'BRA' },
            awayTeam: { name: 'Scotland', code: 'SCO' },
            venue: { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'US' },
            kickoff: '2026-06-18T15:00:00-04:00',
            matchNumber: 17
        },
        {
            homeTeam: { name: 'Morocco', code: 'MAR' },
            awayTeam: { name: 'Haiti', code: 'HAI' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-18T18:00:00-04:00',
            matchNumber: 18
        },
        {
            homeTeam: { name: 'Brazil', code: 'BRA' },
            awayTeam: { name: 'Haiti', code: 'HAI' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-23T18:00:00-04:00',
            matchNumber: 29
        },
        {
            homeTeam: { name: 'Morocco', code: 'MAR' },
            awayTeam: { name: 'Scotland', code: 'SCO' },
            venue: { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'US' },
            kickoff: '2026-06-23T18:00:00-04:00',
            matchNumber: 30
        }
    ]
};

export const groupD: GroupInfo = {
    letter: 'D',
    teams: [
        { name: 'United States', code: 'USA', flag: '🇺🇸' },
        { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' },
        { name: 'Australia', code: 'AUS', flag: '🇦🇺' },
        { name: 'UEFA Playoff C', code: 'D4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'United States', code: 'USA' },
            awayTeam: { name: 'Paraguay', code: 'PAR' },
            venue: { name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', country: 'US' },
            kickoff: '2026-06-12T21:00:00-04:00',
            matchNumber: 5
        },
        {
            homeTeam: { name: 'Australia', code: 'AUS' },
            awayTeam: { name: 'UEFA Playoff C', code: 'D4' },
            venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'US' },
            kickoff: '2026-06-13T12:00:00-04:00',
            matchNumber: 6
        },
        {
            homeTeam: { name: 'United States', code: 'USA' },
            awayTeam: { name: 'Australia', code: 'AUS' },
            venue: { name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', country: 'US' },
            kickoff: '2026-06-17T21:00:00-04:00',
            matchNumber: 19
        },
        {
            homeTeam: { name: 'Paraguay', code: 'PAR' },
            awayTeam: { name: 'UEFA Playoff C', code: 'D4' },
            venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'US' },
            kickoff: '2026-06-17T18:00:00-04:00',
            matchNumber: 20
        },
        {
            homeTeam: { name: 'United States', code: 'USA' },
            awayTeam: { name: 'UEFA Playoff C', code: 'D4' },
            venue: { name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', country: 'US' },
            kickoff: '2026-06-22T21:00:00-04:00',
            matchNumber: 31
        },
        {
            homeTeam: { name: 'Paraguay', code: 'PAR' },
            awayTeam: { name: 'Australia', code: 'AUS' },
            venue: { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'US' },
            kickoff: '2026-06-22T21:00:00-04:00',
            matchNumber: 32
        }
    ]
};

export const groupE: GroupInfo = {
    letter: 'E',
    teams: [
        { name: 'Germany', code: 'GER', flag: '🇩🇪' },
        { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
        { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮' },
        { name: 'Curacao', code: 'CUW', flag: '🇨🇼' }
    ],
    matches: [
        {
            homeTeam: { name: 'Germany', code: 'GER' },
            awayTeam: { name: 'Curacao', code: 'CUW' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-14T13:00:00-04:00',
            matchNumber: 9
        },
        {
            homeTeam: { name: 'Ivory Coast', code: 'CIV' },
            awayTeam: { name: 'Ecuador', code: 'ECU' },
            venue: { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'US' },
            kickoff: '2026-06-14T19:00:00-04:00',
            matchNumber: 10
        },
        {
            homeTeam: { name: 'Germany', code: 'GER' },
            awayTeam: { name: 'Ecuador', code: 'ECU' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-19T13:00:00-04:00',
            matchNumber: 21
        },
        {
            homeTeam: { name: 'Ivory Coast', code: 'CIV' },
            awayTeam: { name: 'Curacao', code: 'CUW' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-19T16:00:00-04:00',
            matchNumber: 22
        },
        {
            homeTeam: { name: 'Germany', code: 'GER' },
            awayTeam: { name: 'Ivory Coast', code: 'CIV' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-24T18:00:00-04:00',
            matchNumber: 33
        },
        {
            homeTeam: { name: 'Ecuador', code: 'ECU' },
            awayTeam: { name: 'Curacao', code: 'CUW' },
            venue: { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'US' },
            kickoff: '2026-06-24T18:00:00-04:00',
            matchNumber: 34
        }
    ]
};

export const groupF: GroupInfo = {
    letter: 'F',
    teams: [
        { name: 'Netherlands', code: 'NED', flag: '🇳🇱' },
        { name: 'Japan', code: 'JPN', flag: '🇯🇵' },
        { name: 'Tunisia', code: 'TUN', flag: '🇹🇳' },
        { name: 'UEFA Playoff B', code: 'F4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'Netherlands', code: 'NED' },
            awayTeam: { name: 'Japan', code: 'JPN' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-14T16:00:00-04:00',
            matchNumber: 11
        },
        {
            homeTeam: { name: 'Tunisia', code: 'TUN' },
            awayTeam: { name: 'UEFA Playoff B', code: 'F4' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-14T22:00:00-04:00',
            matchNumber: 12
        },
        {
            homeTeam: { name: 'Netherlands', code: 'NED' },
            awayTeam: { name: 'Tunisia', code: 'TUN' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-19T19:00:00-04:00',
            matchNumber: 23
        },
        {
            homeTeam: { name: 'Japan', code: 'JPN' },
            awayTeam: { name: 'UEFA Playoff B', code: 'F4' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-19T22:00:00-04:00',
            matchNumber: 24
        },
        {
            homeTeam: { name: 'Netherlands', code: 'NED' },
            awayTeam: { name: 'UEFA Playoff B', code: 'F4' },
            venue: { name: 'Lumen Field', city: 'Seattle', state: 'WA', country: 'US' },
            kickoff: '2026-06-24T21:00:00-04:00',
            matchNumber: 35
        },
        {
            homeTeam: { name: 'Japan', code: 'JPN' },
            awayTeam: { name: 'Tunisia', code: 'TUN' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-24T21:00:00-04:00',
            matchNumber: 36
        }
    ]
};

export const groupG: GroupInfo = {
    letter: 'G',
    teams: [
        { name: 'Belgium', code: 'BEL', flag: '🇧🇪' },
        { name: 'Egypt', code: 'EGY', flag: '🇪🇬' },
        { name: 'Iran', code: 'IRN', flag: '🇮🇷' },
        { name: 'New Zealand', code: 'NZL', flag: '🇳🇿' }
    ],
    matches: [
        {
            homeTeam: { name: 'Belgium', code: 'BEL' },
            awayTeam: { name: 'Egypt', code: 'EGY' },
            venue: { name: 'Lumen Field', city: 'Seattle', state: 'WA', country: 'US' },
            kickoff: '2026-06-15T15:00:00-04:00',
            matchNumber: 37
        },
        {
            homeTeam: { name: 'Iran', code: 'IRN' },
            awayTeam: { name: 'New Zealand', code: 'NZL' },
            venue: { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'US' },
            kickoff: '2026-06-15T18:00:00-04:00',
            matchNumber: 38
        },
        {
            homeTeam: { name: 'Belgium', code: 'BEL' },
            awayTeam: { name: 'Iran', code: 'IRN' },
            venue: { name: 'Lumen Field', city: 'Seattle', state: 'WA', country: 'US' },
            kickoff: '2026-06-20T15:00:00-04:00',
            matchNumber: 39
        },
        {
            homeTeam: { name: 'Egypt', code: 'EGY' },
            awayTeam: { name: 'New Zealand', code: 'NZL' },
            venue: { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'US' },
            kickoff: '2026-06-20T18:00:00-04:00',
            matchNumber: 40
        },
        {
            homeTeam: { name: 'Belgium', code: 'BEL' },
            awayTeam: { name: 'New Zealand', code: 'NZL' },
            venue: { name: 'Lumen Field', city: 'Seattle', state: 'WA', country: 'US' },
            kickoff: '2026-06-25T18:00:00-04:00',
            matchNumber: 41
        },
        {
            homeTeam: { name: 'Egypt', code: 'EGY' },
            awayTeam: { name: 'Iran', code: 'IRN' },
            venue: { name: "Levi's Stadium", city: 'Santa Clara', state: 'CA', country: 'US' },
            kickoff: '2026-06-25T18:00:00-04:00',
            matchNumber: 42
        }
    ]
};

export const groupH: GroupInfo = {
    letter: 'H',
    teams: [
        { name: 'Spain', code: 'ESP', flag: '🇪🇸' },
        { name: 'Uruguay', code: 'URU', flag: '🇺🇾' },
        { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦' },
        { name: 'Cape Verde', code: 'CPV', flag: '🇨🇻' }
    ],
    matches: [
        {
            homeTeam: { name: 'Spain', code: 'ESP' },
            awayTeam: { name: 'Cape Verde', code: 'CPV' },
            venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'US' },
            kickoff: '2026-06-15T12:00:00-04:00',
            matchNumber: 43
        },
        {
            homeTeam: { name: 'Uruguay', code: 'URU' },
            awayTeam: { name: 'Saudi Arabia', code: 'KSA' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-15T18:00:00-04:00',
            matchNumber: 44
        },
        {
            homeTeam: { name: 'Spain', code: 'ESP' },
            awayTeam: { name: 'Uruguay', code: 'URU' },
            venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'US' },
            kickoff: '2026-06-20T21:00:00-04:00',
            matchNumber: 45
        },
        {
            homeTeam: { name: 'Saudi Arabia', code: 'KSA' },
            awayTeam: { name: 'Cape Verde', code: 'CPV' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-20T18:00:00-04:00',
            matchNumber: 46
        },
        {
            homeTeam: { name: 'Spain', code: 'ESP' },
            awayTeam: { name: 'Saudi Arabia', code: 'KSA' },
            venue: { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', country: 'US' },
            kickoff: '2026-06-25T21:00:00-04:00',
            matchNumber: 47
        },
        {
            homeTeam: { name: 'Uruguay', code: 'URU' },
            awayTeam: { name: 'Cape Verde', code: 'CPV' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-25T21:00:00-04:00',
            matchNumber: 48
        }
    ]
};

export const groupI: GroupInfo = {
    letter: 'I',
    teams: [
        { name: 'France', code: 'FRA', flag: '🇫🇷' },
        { name: 'Senegal', code: 'SEN', flag: '🇸🇳' },
        { name: 'Norway', code: 'NOR', flag: '🇳🇴' },
        { name: 'Intercon Playoff 2', code: 'I4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'France', code: 'FRA' },
            awayTeam: { name: 'Senegal', code: 'SEN' },
            venue: { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'US' },
            kickoff: '2026-06-16T15:00:00-04:00',
            matchNumber: 49
        },
        {
            homeTeam: { name: 'Norway', code: 'NOR' },
            awayTeam: { name: 'Intercon Playoff 2', code: 'I4' },
            venue: { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'US' },
            kickoff: '2026-06-16T18:00:00-04:00',
            matchNumber: 50
        },
        {
            homeTeam: { name: 'France', code: 'FRA' },
            awayTeam: { name: 'Norway', code: 'NOR' },
            venue: { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'US' },
            kickoff: '2026-06-21T15:00:00-04:00',
            matchNumber: 51
        },
        {
            homeTeam: { name: 'Senegal', code: 'SEN' },
            awayTeam: { name: 'Intercon Playoff 2', code: 'I4' },
            venue: { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'US' },
            kickoff: '2026-06-21T18:00:00-04:00',
            matchNumber: 52
        },
        {
            homeTeam: { name: 'France', code: 'FRA' },
            awayTeam: { name: 'Intercon Playoff 2', code: 'I4' },
            venue: { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'US' },
            kickoff: '2026-06-26T18:00:00-04:00',
            matchNumber: 53
        },
        {
            homeTeam: { name: 'Senegal', code: 'SEN' },
            awayTeam: { name: 'Norway', code: 'NOR' },
            venue: { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', country: 'US' },
            kickoff: '2026-06-26T18:00:00-04:00',
            matchNumber: 54
        }
    ]
};

export const groupJ: GroupInfo = {
    letter: 'J',
    teams: [
        { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
        { name: 'Austria', code: 'AUT', flag: '🇦🇹' },
        { name: 'Algeria', code: 'ALG', flag: '🇩🇿' },
        { name: 'Jordan', code: 'JOR', flag: '🇯🇴' }
    ],
    matches: [
        {
            homeTeam: { name: 'Argentina', code: 'ARG' },
            awayTeam: { name: 'Algeria', code: 'ALG' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-16T21:00:00-04:00',
            matchNumber: 55
        },
        {
            homeTeam: { name: 'Austria', code: 'AUT' },
            awayTeam: { name: 'Jordan', code: 'JOR' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-16T18:00:00-04:00',
            matchNumber: 56
        },
        {
            homeTeam: { name: 'Argentina', code: 'ARG' },
            awayTeam: { name: 'Austria', code: 'AUT' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-21T21:00:00-04:00',
            matchNumber: 57
        },
        {
            homeTeam: { name: 'Algeria', code: 'ALG' },
            awayTeam: { name: 'Jordan', code: 'JOR' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-21T18:00:00-04:00',
            matchNumber: 58
        },
        {
            homeTeam: { name: 'Argentina', code: 'ARG' },
            awayTeam: { name: 'Jordan', code: 'JOR' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-26T21:00:00-04:00',
            matchNumber: 59
        },
        {
            homeTeam: { name: 'Austria', code: 'AUT' },
            awayTeam: { name: 'Algeria', code: 'ALG' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-26T21:00:00-04:00',
            matchNumber: 60
        }
    ]
};

export const groupK: GroupInfo = {
    letter: 'K',
    teams: [
        { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
        { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
        { name: 'Uzbekistan', code: 'UZB', flag: '🇺🇿' },
        { name: 'Intercon Playoff 1', code: 'K4', flag: '🏳️' }
    ],
    matches: [
        {
            homeTeam: { name: 'Portugal', code: 'POR' },
            awayTeam: { name: 'Intercon Playoff 1', code: 'K4' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-17T13:00:00-04:00',
            matchNumber: 61
        },
        {
            homeTeam: { name: 'Colombia', code: 'COL' },
            awayTeam: { name: 'Uzbekistan', code: 'UZB' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-17T16:00:00-04:00',
            matchNumber: 62
        },
        {
            homeTeam: { name: 'Portugal', code: 'POR' },
            awayTeam: { name: 'Colombia', code: 'COL' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-22T13:00:00-04:00',
            matchNumber: 63
        },
        {
            homeTeam: { name: 'Uzbekistan', code: 'UZB' },
            awayTeam: { name: 'Intercon Playoff 1', code: 'K4' },
            venue: { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', country: 'US' },
            kickoff: '2026-06-22T16:00:00-04:00',
            matchNumber: 64
        },
        {
            homeTeam: { name: 'Portugal', code: 'POR' },
            awayTeam: { name: 'Uzbekistan', code: 'UZB' },
            venue: { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'US' },
            kickoff: '2026-06-27T18:00:00-04:00',
            matchNumber: 65
        },
        {
            homeTeam: { name: 'Colombia', code: 'COL' },
            awayTeam: { name: 'Intercon Playoff 1', code: 'K4' },
            venue: { name: 'NRG Stadium', city: 'Houston', state: 'TX', country: 'US' },
            kickoff: '2026-06-27T18:00:00-04:00',
            matchNumber: 66
        }
    ]
};

export const groupL: GroupInfo = {
    letter: 'L',
    teams: [
        { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
        { name: 'Croatia', code: 'CRO', flag: '🇭🇷' },
        { name: 'Ghana', code: 'GHA', flag: '🇬🇭' },
        { name: 'Panama', code: 'PAN', flag: '🇵🇦' }
    ],
    matches: [
        {
            homeTeam: { name: 'England', code: 'ENG' },
            awayTeam: { name: 'Croatia', code: 'CRO' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-17T16:00:00-04:00',
            matchNumber: 67
        },
        {
            homeTeam: { name: 'Ghana', code: 'GHA' },
            awayTeam: { name: 'Panama', code: 'PAN' },
            venue: { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', country: 'US' },
            kickoff: '2026-06-17T19:00:00-04:00',
            matchNumber: 68
        },
        {
            homeTeam: { name: 'England', code: 'ENG' },
            awayTeam: { name: 'Ghana', code: 'GHA' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-22T16:00:00-04:00',
            matchNumber: 69
        },
        {
            homeTeam: { name: 'Croatia', code: 'CRO' },
            awayTeam: { name: 'Panama', code: 'PAN' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-22T19:00:00-04:00',
            matchNumber: 70
        },
        {
            homeTeam: { name: 'England', code: 'ENG' },
            awayTeam: { name: 'Panama', code: 'PAN' },
            venue: { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', country: 'US' },
            kickoff: '2026-06-27T21:00:00-04:00',
            matchNumber: 71
        },
        {
            homeTeam: { name: 'Croatia', code: 'CRO' },
            awayTeam: { name: 'Ghana', code: 'GHA' },
            venue: { name: 'GEHA Field at Arrowhead Stadium', city: 'Kansas City', state: 'MO', country: 'US' },
            kickoff: '2026-06-27T21:00:00-04:00',
            matchNumber: 72
        }
    ]
};

/** All 12 groups indexed by letter */
export const allGroups: Record<string, GroupInfo> = {
    A: groupA,
    B: groupB,
    C: groupC,
    D: groupD,
    E: groupE,
    F: groupF,
    G: groupG,
    H: groupH,
    I: groupI,
    J: groupJ,
    K: groupK,
    L: groupL,
};

/** Flat array of all groups */
export const groups: GroupInfo[] = Object.values(allGroups);

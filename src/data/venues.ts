export interface WCVenue {
    id: string;
    name: string;
    city: string;
    state?: string;
    country: 'US' | 'MX' | 'CA';
    capacity: number;
    latitude: number;
    longitude: number;
    timezone: string;
}

export const venues: WCVenue[] = [
    // ═══ UNITED STATES (11 cities) ═══
    {
        id: 'sofi',
        name: 'SoFi Stadium',
        city: 'Inglewood',
        state: 'CA',
        country: 'US',
        capacity: 70240,
        latitude: 33.9534,
        longitude: -118.339,
        timezone: 'America/Los_Angeles'
    },
    {
        id: 'metlife',
        name: 'MetLife Stadium',
        city: 'East Rutherford',
        state: 'NJ',
        country: 'US',
        capacity: 82500,
        latitude: 40.8128,
        longitude: -74.0742,
        timezone: 'America/New_York'
    },
    {
        id: 'att',
        name: 'AT&T Stadium',
        city: 'Arlington',
        state: 'TX',
        country: 'US',
        capacity: 80000,
        latitude: 32.7473,
        longitude: -97.0945,
        timezone: 'America/Chicago'
    },
    {
        id: 'mercedesbenz',
        name: 'Mercedes-Benz Stadium',
        city: 'Atlanta',
        state: 'GA',
        country: 'US',
        capacity: 71000,
        latitude: 33.7554,
        longitude: -84.4010,
        timezone: 'America/New_York'
    },
    {
        id: 'gillette',
        name: 'Gillette Stadium',
        city: 'Foxborough',
        state: 'MA',
        country: 'US',
        capacity: 65878,
        latitude: 42.0909,
        longitude: -71.2643,
        timezone: 'America/New_York'
    },
    {
        id: 'nrg',
        name: 'NRG Stadium',
        city: 'Houston',
        state: 'TX',
        country: 'US',
        capacity: 72220,
        latitude: 29.6847,
        longitude: -95.4107,
        timezone: 'America/Chicago'
    },
    {
        id: 'hardrock',
        name: 'Hard Rock Stadium',
        city: 'Miami Gardens',
        state: 'FL',
        country: 'US',
        capacity: 64767,
        latitude: 25.9580,
        longitude: -80.2389,
        timezone: 'America/New_York'
    },
    {
        id: 'lincolnfinancial',
        name: 'Lincoln Financial Field',
        city: 'Philadelphia',
        state: 'PA',
        country: 'US',
        capacity: 69796,
        latitude: 39.9008,
        longitude: -75.1675,
        timezone: 'America/New_York'
    },
    {
        id: 'levis',
        name: "Levi's Stadium",
        city: 'Santa Clara',
        state: 'CA',
        country: 'US',
        capacity: 68500,
        latitude: 37.4033,
        longitude: -121.9694,
        timezone: 'America/Los_Angeles'
    },
    {
        id: 'arrowhead',
        name: 'GEHA Field at Arrowhead Stadium',
        city: 'Kansas City',
        state: 'MO',
        country: 'US',
        capacity: 76416,
        latitude: 39.0489,
        longitude: -94.4839,
        timezone: 'America/Chicago'
    },
    {
        id: 'lumen',
        name: 'Lumen Field',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
        capacity: 68740,
        latitude: 47.5952,
        longitude: -122.3316,
        timezone: 'America/Los_Angeles'
    },

    // ═══ MEXICO (3 cities) ═══
    {
        id: 'azteca',
        name: 'Estadio Azteca',
        city: 'Mexico City',
        country: 'MX',
        capacity: 87523,
        latitude: 19.3028,
        longitude: -99.1505,
        timezone: 'America/Mexico_City'
    },
    {
        id: 'akron',
        name: 'Estadio Akron',
        city: 'Guadalajara',
        country: 'MX',
        capacity: 49850,
        latitude: 20.6820,
        longitude: -103.4623,
        timezone: 'America/Mexico_City'
    },
    {
        id: 'bbva',
        name: 'Estadio BBVA',
        city: 'Monterrey',
        country: 'MX',
        capacity: 53500,
        latitude: 25.6032,
        longitude: -100.0093,
        timezone: 'America/Monterrey'
    },

    // ═══ CANADA (2 cities) ═══
    {
        id: 'bmo',
        name: 'BMO Field',
        city: 'Toronto',
        state: 'ON',
        country: 'CA',
        capacity: 45736,
        latitude: 43.6332,
        longitude: -79.4186,
        timezone: 'America/Toronto'
    },
    {
        id: 'bcplace',
        name: 'BC Place',
        city: 'Vancouver',
        state: 'BC',
        country: 'CA',
        capacity: 54500,
        latitude: 49.2768,
        longitude: -123.1118,
        timezone: 'America/Vancouver'
    }
];

/** Look up a venue by ID */
export function getVenue(id: string): WCVenue | undefined {
    return venues.find(v => v.id === id);
}

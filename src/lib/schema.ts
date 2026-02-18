interface TeamData {
    name: string
    code: string
}

interface VenueData {
    name: string
    city: string
    state?: string
    country: string
    streetAddress?: string
    postalCode?: string
}

interface MatchData {
    homeTeam: TeamData
    awayTeam: TeamData
    venue: VenueData
    kickoff: string  // ISO 8601
    matchNumber: number
}

interface GroupData {
    letter: string
    matches: MatchData[]
    teams: TeamData[]
}

/**
 * Generate JSON-LD for a single SportsEvent match
 */
export function generateMatchSchema(match: MatchData): object {
    return {
        '@type': 'SportsEvent',
        name: `${match.homeTeam.name} vs ${match.awayTeam.name} — FIFA World Cup 2026 Group Stage`,
        startDate: match.kickoff,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: match.venue.name,
            address: {
                '@type': 'PostalAddress',
                addressLocality: match.venue.city,
                addressRegion: match.venue.state || '',
                addressCountry: match.venue.country,
            },
        },
        competitor: [
            { '@type': 'SportsTeam', name: match.homeTeam.name },
            { '@type': 'SportsTeam', name: match.awayTeam.name },
        ],
        superEvent: {
            '@type': 'SportsEvent',
            name: 'FIFA World Cup 2026',
            startDate: '2026-06-11',
            endDate: '2026-07-19',
            location: {
                '@type': 'Place',
                name: 'United States, Canada, and Mexico',
            },
        },
    }
}

/**
 * Generate the complete JSON-LD block for a group page
 * Includes EventSeries wrapping all matches + FAQPage
 */
export function generateGroupSchema(group: GroupData, faqs: { question: string; answer: string }[]): string {
    const matchSchemas = group.matches.map(generateMatchSchema)

    const schema = [
        {
            '@context': 'https://schema.org',
            '@type': 'EventSeries',
            name: `FIFA World Cup 2026 — Group ${group.letter}`,
            startDate: '2026-06-11',
            endDate: '2026-07-19',
            subEvent: matchSchemas,
            location: {
                '@type': 'Place',
                name: 'United States, Canada, and Mexico',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        },
    ]

    return JSON.stringify(schema)
}

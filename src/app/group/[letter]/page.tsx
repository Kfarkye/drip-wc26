import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { generateGroupSchema } from '../../../../src/lib/schema';
import { ALL_MATCHES } from '../../../../src/data/all-matches';
import { allGroups } from '../../../../src/data/groups';
import { GROUP_EDITORIAL } from '../../../../lib/group-editorial';

type GroupPageProps = {
    params: Promise<{
        letter: string;
    }>;
};

function formatKickoff(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return 'Kickoff TBD';

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsed);
}

function buildGroupFaq(letter: string, teamNames: string[], venues: string[]) {
    return [
        {
            question: `Who is in World Cup 2026 Group ${letter}?`,
            answer: `Group ${letter} includes ${teamNames.join(', ')}.`,
        },
        {
            question: `Where is Group ${letter} being played?`,
            answer: `Group ${letter} fixtures are hosted across ${venues.join('; ')}.`,
        },
        {
            question: `How many matches are in Group ${letter}?`,
            answer: `Group ${letter} contains ${ALL_MATCHES.filter((match) => match.group === letter).length} scheduled group-stage fixtures.`,
        },
    ];
}

export function generateStaticParams() {
    return Object.keys(allGroups).map((letter) => ({ letter: letter.toLowerCase() }));
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const upperLetter = resolvedParams.letter.toUpperCase();
    const group = allGroups[upperLetter];

    if (!group) {
        return { title: 'Group not found' };
    }

    const description = `World Cup 2026 Group ${upperLetter} guide with teams, match schedule, venue map, and editorial context for ${group.teams.map((team) => team.name).join(', ')}.`;

    return {
        title: `World Cup 2026 Group ${upperLetter}`,
        description,
        alternates: {
            canonical: `https://thedrip.to/group/${resolvedParams.letter.toLowerCase()}`,
        },
        openGraph: {
            title: `World Cup 2026 Group ${upperLetter}`,
            description,
            type: 'website',
            url: `https://thedrip.to/group/${resolvedParams.letter.toLowerCase()}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `World Cup 2026 Group ${upperLetter}`,
            description,
        },
    };
}

export default async function GroupPage({ params }: GroupPageProps) {
    const resolvedParams = await params;
    const upperLetter = resolvedParams.letter.toUpperCase();
    const group = allGroups[upperLetter];

    if (!group) {
        notFound();
    }

    const matches = ALL_MATCHES
        .filter((match) => match.group === upperLetter)
        .sort((a, b) => a.matchNumber - b.matchNumber);
    const editorial = GROUP_EDITORIAL[upperLetter];
    const venueLines = Array.from(
        new Set(group.matches.map((match) => `${match.venue.name}, ${match.venue.city}`)),
    );
    const faqs = buildGroupFaq(upperLetter, group.teams.map((team) => team.name), venueLines);
    const groupSchema = generateGroupSchema(group, faqs);

    return (
        <main className="app-shell">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: groupSchema }}
            />

            <div className="match-shell">
                <header className="hero-card">
                    <div className="eyebrow-row">
                        <p className="eyebrow">World Cup 2026 • Group Stage</p>
                        {editorial?.badge ? (
                            <span className={`group-badge badge-${editorial.badgeType ?? 'host'}`}>{editorial.badge}</span>
                        ) : null}
                    </div>
                    <h1 className="hero-title">Group {upperLetter}</h1>
                    <p className="hero-copy">
                        {editorial?.analysis ?? `Tournament schedule, venue map, and qualification context for Group ${upperLetter}.`}
                    </p>
                </header>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Teams</h2>
                        <p>Static tournament identities now server-rendered for SEO and route-level metadata.</p>
                    </div>
                    <div className="team-grid">
                        {group.teams.map((team) => (
                            <article key={team.code} className="team-card">
                                <span className="team-flag" aria-hidden="true">{team.flag}</span>
                                <strong>{team.name}</strong>
                                <span>{team.code}</span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>Match Schedule</h2>
                        <p>Each match links into the migrated Next.js matchup route with SSR metadata and live odds hydration.</p>
                    </div>
                    <div className="schedule-list">
                        {matches.map((match) => (
                            <Link key={match.slug} href={`/match/${match.slug}`} className="schedule-card">
                                <div className="schedule-meta">
                                    <span>Match {match.matchNumber}</span>
                                    <span>{formatKickoff(match.kickoff)}</span>
                                </div>
                                <strong>{match.homeTeam} vs {match.awayTeam}</strong>
                                <span>{match.venue} • {match.venueCity}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <h2>FAQ Signals</h2>
                        <p>These answers feed the structured FAQ schema emitted on the page.</p>
                    </div>
                    <div className="link-grid">
                        {faqs.map((faq) => (
                            <article key={faq.question} className="match-link-card">
                                <strong>{faq.question}</strong>
                                <span>{faq.answer}</span>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

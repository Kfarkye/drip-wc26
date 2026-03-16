import type { MetadataRoute } from 'next';
import { allGroups } from '../data/groups';
import { getEdgeStaticMatches } from '../../lib/edge-page';
import { getSitemapEntries } from '../../lib/match-page';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries = await getSitemapEntries();
    const edgeEntries = getEdgeStaticMatches();

    return [
        {
            changeFrequency: 'daily',
            lastModified: new Date(),
            priority: 1,
            url: 'https://thedrip.to',
        },
        {
            changeFrequency: 'daily',
            lastModified: new Date(),
            priority: 0.9,
            url: 'https://thedrip.to/today',
        },
        ...Object.keys(allGroups).map((letter) => ({
            changeFrequency: 'weekly' as const,
            lastModified: new Date(),
            priority: 0.85,
            url: `https://thedrip.to/group/${letter.toLowerCase()}`,
        })),
        ...edgeEntries.map((entry) => ({
            changeFrequency: 'daily' as const,
            lastModified: new Date(entry.kickoff),
            priority: 0.78,
            url: `https://thedrip.to/edges/${entry.slug}`,
        })),
        ...entries.map((entry) => ({
            changeFrequency: 'hourly' as const,
            lastModified: entry.lastModified,
            priority: 0.8,
            url: `https://thedrip.to/match/${entry.slug}`,
        })),
    ];
}

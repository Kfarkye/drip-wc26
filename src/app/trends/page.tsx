import type { Metadata } from 'next';
import { getTrendsPageData, buildTrendMeta } from '../../../lib/trends-page';
import TrendsBoard from './TrendsBoard';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const meta = buildTrendMeta();

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: meta.canonical,
    },
    openGraph: {
      type: 'website',
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function TrendsPage() {
  const data = await getTrendsPageData();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SportsSync Trends',
    url: 'https://thedrip.to/trends',
    description: 'Trend and signal board for sports markets and team behavior.',
  };

  return (
    <main className="app-shell trends-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrendsBoard data={data} />
    </main>
  );
}

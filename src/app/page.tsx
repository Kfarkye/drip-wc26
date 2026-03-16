import type { Metadata } from "next";
import { HomepageBoard } from "./HomepageBoard";
import { getHomepageBoardData } from "../../lib/homepage-board";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Today’s Games & Odds",
  description: "Today’s games, opening lines, and matchup cards across NBA, NHL, MLB, soccer, and NCAAB.",
  alternates: {
    canonical: "https://thedrip.to/",
  },
  openGraph: {
    title: "Today’s Games & Odds",
    description: "Matchup cards, opening lines, and team logos for today’s slate.",
    type: "website",
    url: "https://thedrip.to/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Today’s Games & Odds",
    description: "Matchup cards, opening lines, and team logos for today’s slate.",
  },
};

export default async function HomePage() {
  const data = await getHomepageBoardData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Drip Homepage",
    url: "https://thedrip.to/",
    description: "Today’s games, opening lines, and matchup cards across the live slate.",
    hasPart: data.games.map((game) => ({
      "@type": "SportsEvent",
      name: `${game.awayTeam} at ${game.homeTeam}`,
      sport: game.sportLabel,
      startDate: game.startTime,
      url: game.href.startsWith("/")
        ? `https://thedrip.to${game.href}`
        : "https://thedrip.to/today",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomepageBoard data={data} />
    </>
  );
}

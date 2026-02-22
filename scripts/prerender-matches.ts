/**
 * Pre-render static HTML for all 104 World Cup 2026 match pages.
 * Generates SEO-ready pages in public/edges/<slug>/index.html
 * and a comprehensive sitemap.xml.
 *
 * Usage: npx tsx scripts/prerender-matches.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ALL_MATCHES, type MatchSeed } from '../src/data/all-matches';

const SITE_URL = 'https://thedrip.to';
const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');

function formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatTime(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function phaseLabel(phase: MatchSeed['phase']): string {
    switch (phase) {
        case 'group': return 'Group Stage';
        case 'round-of-32': return 'Round of 32';
        case 'round-of-16': return 'Round of 16';
        case 'quarterfinal': return 'Quarterfinal';
        case 'semifinal': return 'Semifinal';
        case 'third-place': return 'Third-Place Match';
        case 'final': return 'Final';
    }
}

function matchTitle(match: MatchSeed): string {
    if (match.phase === 'group') {
        return `${match.awayTeam} vs ${match.homeTeam}`;
    }
    return `${phaseLabel(match.phase)} — Match ${match.matchNumber}`;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderMatchPage(match: MatchSeed): string {
    const title = matchTitle(match);
    const description = match.phase === 'group'
        ? `Compare ${match.awayTeam} vs ${match.homeTeam} odds across DraftKings, FanDuel, Kalshi, Polymarket. World Cup 2026 Group ${match.group}.`
        : `${phaseLabel(match.phase)} odds comparison — World Cup 2026. Sportsbook vs prediction market pricing.`;
    const groupLabel = match.group ? ` · Group ${match.group}` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- SEO Core -->
  <title>${escapeHtml(title)} Odds — Sportsbooks & Prediction Markets | The Drip</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${SITE_URL}/edges/${match.slug}/">

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)} Odds | The Drip">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${SITE_URL}/edges/${match.slug}/">
  <meta property="og:type" content="website">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} Odds | The Drip">

  <!-- JSON-LD: SportsEvent -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": "${escapeHtml(title)}",
    "startDate": "${match.kickoff}",
    "location": { "@type": "Place", "name": "${escapeHtml(match.venue)}", "address": "${escapeHtml(match.venueCity)}" },
    "homeTeam": { "@type": "SportsTeam", "name": "${escapeHtml(match.homeTeam)}" },
    "awayTeam": { "@type": "SportsTeam", "name": "${escapeHtml(match.awayTeam)}" },
    "description": "Cross-venue odds comparison for ${escapeHtml(title)}. World Cup 2026.",
    "superEvent": {
      "@type": "SportsEvent",
      "name": "FIFA World Cup 2026",
      "startDate": "2026-06-11",
      "endDate": "2026-07-19"
    }
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">

  <!-- Minimal inline CSS for above-the-fold render without JS -->
  <style>
    body { background: #0a0a0a; color: #e8e4dc; font-family: 'Outfit', system-ui, sans-serif; margin: 0; padding: 24px; -webkit-font-smoothing: antialiased; }
    .matchup { text-align: center; padding: 32px 0; }
    .matchup h1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 2rem; font-weight: 300; margin: 0 0 8px; }
    .meta { color: #8a8a8a; margin: 0 0 12px; font-size: 0.875rem; }
    .gap-badge { display: inline-block; background: rgba(0,201,120,0.12); color: #00c978; padding: 4px 12px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; }
    .odds-table { width: 100%; max-width: 720px; margin: 24px auto; border-collapse: collapse; }
    .odds-table th, .odds-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1e1e1e; font-size: 0.875rem; }
    .odds-table th { color: #8a8a8a; font-weight: 500; }
    .section-label { color: #555; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding-top: 16px; }
    .placeholder { text-align: center; padding: 48px 24px; color: #555; font-size: 0.875rem; max-width: 720px; margin: 0 auto; }
    .placeholder p { margin: 0 0 16px; line-height: 1.6; }
    .receipt { max-width: 720px; margin: 32px auto 0; padding: 16px 0; border-top: 1px solid #1e1e1e; color: #555; font-size: 0.75rem; }
    .live-link { display: block; text-align: center; margin-top: 16px; color: #8a8a8a; font-size: 0.875rem; }
    .live-link a { color: #00c978; text-decoration: none; }
    .nav { border-bottom: 1px solid #232323; padding: 16px 24px; display: flex; align-items: center; gap: 8px; }
    .nav a { text-decoration: none; }
    .nav .the { font-size: 11px; color: #aaa; text-transform: lowercase; }
    .nav .drip { font-size: 28px; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; color: #aaa; line-height: 1; }
    footer { max-width: 720px; margin: 24px auto; padding: 16px 0; border-top: 1px solid #1e1e1e; color: #555; font-size: 0.7rem; line-height: 1.6; }
    footer a { color: #555; }
  </style>
</head>
<body>
  <!-- NAV -->
  <div class="nav">
    <a href="/"><span class="the">the</span><span class="drip">Drip</span></a>
  </div>

  <!-- ABOVE THE FOLD -->
  <div class="matchup">
    <h1>${escapeHtml(match.awayTeam)} vs ${escapeHtml(match.homeTeam)}</h1>
    <p class="meta">${formatDate(match.kickoff)} · ${escapeHtml(match.venue)}, ${escapeHtml(match.venueCity)}${groupLabel}</p>
    <span class="gap-badge">Odds loading...</span>
  </div>

  <!-- ODDS TABLE (placeholder until pipeline populates) -->
  <table class="odds-table">
    <thead>
      <tr><th>Venue</th><th>${escapeHtml(match.awayTeam)}</th><th>${escapeHtml(match.homeTeam)}</th><th>Draw</th></tr>
    </thead>
    <tbody>
      <tr><td colspan="4" class="section-label">US Regulated</td></tr>
      <tr><td>DraftKings</td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td>FanDuel</td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td>BetMGM</td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td colspan="4" class="section-label">Prediction Markets</td></tr>
      <tr><td>Kalshi</td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td>Polymarket</td><td>—</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

  <!-- PLACEHOLDER NOTICE -->
  <div class="placeholder">
    <p>Odds data will populate as sportsbooks and prediction markets open lines for this match.
    Check back closer to kickoff for cross-venue gap analysis.</p>
  </div>

  <!-- LINK TO SPA LIVE VIEW -->
  <p class="live-link">
    <a href="/#/edges/${match.slug}">Open Live View &rarr;</a>
    for real-time odds updates
  </p>

  <!-- DATA RECEIPT -->
  <div class="receipt">
    <strong>Pre-game snapshot</strong> &middot; Page generated: ${new Date().toISOString().slice(0, 19)} UTC<br>
    Sources: DraftKings, FanDuel, BetMGM, Caesars, BetRivers, Kalshi, Polymarket<br>
    Prediction market prices reflect last traded contract price, not mid-market.
  </div>

  <!-- AFFILIATE DISCLOSURE -->
  <footer>
    The Drip may earn a commission if you sign up through links on this page.
    Odds and prices are informational only. Gambling involves risk.
    Confirm legality in your jurisdiction before placing wagers.
  </footer>
</body>
</html>`;
}

function generateSitemap(matches: MatchSeed[]): string {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${SITE_URL}/learn/withdrawals`, priority: '0.8', changefreq: 'monthly' },
        { loc: `${SITE_URL}/learn/how-it-works`, priority: '0.7', changefreq: 'monthly' },
        { loc: `${SITE_URL}/learn/odds-converter`, priority: '0.7', changefreq: 'monthly' },
        ...matches.map(m => ({
            loc: `${SITE_URL}/edges/${m.slug}/`,
            priority: m.phase === 'group' ? '0.9' : m.phase === 'final' ? '1.0' : '0.8',
            changefreq: 'daily',
        })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// ═══ MAIN ═══
async function main() {
    console.log(`Pre-rendering ${ALL_MATCHES.length} match pages...`);

    let generated = 0;
    for (const match of ALL_MATCHES) {
        const dir = resolve(PUBLIC_DIR, 'edges', match.slug);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        const html = renderMatchPage(match);
        writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
        generated++;
    }

    // Generate sitemap
    const sitemap = generateSitemap(ALL_MATCHES);
    writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8');

    console.log(`Done. Generated ${generated} match pages + sitemap.xml`);
}

main().catch(err => {
    console.error('Prerender failed:', err);
    process.exit(1);
});

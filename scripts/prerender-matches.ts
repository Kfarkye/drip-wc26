/**
 * Pre-render static HTML for all World Cup 2026 match pages.
 * Generates SEO-ready pages in public/edges/<slug>/index.html
 * with full Obsidian Weissach v7 design system and sitemap.xml.
 *
 * Usage: npx tsx scripts/prerender-matches.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ALL_MATCHES, type MatchSeed } from '../src/data/all-matches';
import { allGroups } from '../src/data/groups';

const SITE_URL = 'https://thedrip.to';
const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');
const BUILD_TIME = new Date().toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDateLong(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateShort(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function daysUntil(isoDate: string): number {
    const now = new Date();
    const target = new Date(isoDate);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function phaseLabel(phase: MatchSeed['phase']): string {
    const labels: Record<string, string> = {
        'group': 'Group Stage',
        'round-of-32': 'Round of 32',
        'round-of-16': 'Round of 16',
        'quarterfinal': 'Quarterfinal',
        'semifinal': 'Semifinal',
        'third-place': 'Third-Place Match',
        'final': 'Final',
    };
    return labels[phase] ?? phase;
}

function isRealTeam(name: string): boolean {
    return !/^[WL\d]/.test(name) && !/Playoff/.test(name) && !/^[12]$/.test(name) && !/^3[A-Z]+/.test(name);
}

function matchDisplayTitle(match: MatchSeed): string {
    if (match.phase === 'group' && isRealTeam(match.awayTeam) && isRealTeam(match.homeTeam)) {
        return `${match.awayTeam} vs ${match.homeTeam}`;
    }
    if (match.phase === 'group') {
        const real = isRealTeam(match.awayTeam) ? match.awayTeam : match.homeTeam;
        const tbd = isRealTeam(match.awayTeam) ? match.homeTeam : match.awayTeam;
        return `${real} vs ${tbd}`;
    }
    return `${phaseLabel(match.phase)} — Match ${match.matchNumber}`;
}

function getGroupTeams(groupLetter: string): string[] {
    const group = allGroups[groupLetter];
    if (!group) return [];
    return group.teams.map(t => t.name);
}

function getGroupMatches(groupLetter: string): MatchSeed[] {
    return ALL_MATCHES.filter(m => m.group === groupLetter);
}

function matchSeoTitle(match: MatchSeed): string {
    if (match.phase === 'group') {
        return `${match.awayTeam} vs ${match.homeTeam} Odds — World Cup 2026 Group ${match.group} | The Drip`;
    }
    return `${phaseLabel(match.phase)} Match ${match.matchNumber} Odds — World Cup 2026 | The Drip`;
}

function matchSeoDescription(match: MatchSeed): string {
    if (match.phase === 'group') {
        return `${match.awayTeam} vs ${match.homeTeam} odds comparison across sportsbooks and prediction markets. ${formatDateLong(match.kickoff)} at ${match.venue}, ${match.venueCity}. World Cup 2026 Group ${match.group}.`;
    }
    return `World Cup 2026 ${phaseLabel(match.phase)} odds comparison across DraftKings, FanDuel, Kalshi, and Polymarket. ${formatDateLong(match.kickoff)} at ${match.venue}.`;
}

// ═══════════════════════════════════════════════════════════════
// INLINE CSS — Obsidian Weissach v7
// ═══════════════════════════════════════════════════════════════

const INLINE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
--void:#050505;--obsidian:#0a0a0a;--ash:#111;--smoke:#1a1a1a;
--card-bg:#141414;--card-border:#1f1f1f;
--iron:#3a3a3a;--silver:#6a6a6a;--mist:#8a8a8a;--bone:#b0b0b0;--ivory:#d8d4cc;--white:#eae6de;
--emerald:#00c978;--emerald-muted:#00a862;--emerald-glow:rgba(0,201,120,0.15);--emerald-subtle:rgba(0,201,120,0.06);
--font-serif:'Cormorant Garamond',Georgia,serif;
--font-sans:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;
--font-mono:'JetBrains Mono','SF Mono',monospace;
}

html{background:var(--void);scroll-behavior:smooth}
body{font-family:var(--font-sans);color:var(--ivory);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;min-height:100vh;display:flex;flex-direction:column}
::selection{background:var(--emerald-glow);color:var(--white)}

body::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.018;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:256px}
body::after{content:'';position:fixed;inset:0;z-index:9998;pointer-events:none;background:radial-gradient(ellipse at center,transparent 50%,var(--void) 100%)}

.nav{border-bottom:1px solid var(--card-border);background:var(--void);position:sticky;top:0;z-index:50}
.nav-inner{max-width:72rem;margin:0 auto;padding:0 1.5rem;height:3.5rem;display:flex;align-items:center;justify-content:space-between}
.nav a{text-decoration:none;display:flex;align-items:baseline;gap:2px}
.nav .t{font-size:10px;font-family:var(--font-sans);text-transform:lowercase;color:var(--mist)}
.nav .d{font-size:26px;font-family:var(--font-serif);font-style:italic;font-weight:300;color:var(--bone);line-height:1}
.nav-links{display:flex;gap:1.5rem;align-items:center}
.nav-links a{font-size:13px;color:var(--silver);text-decoration:none;transition:color .15s}
.nav-links a:hover{color:var(--bone)}
.live-dot{display:flex;align-items:center;gap:6px}
.live-dot::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--emerald);box-shadow:0 0 8px rgba(0,201,120,0.4)}
.live-dot span{font-size:10px;letter-spacing:.15em;color:var(--silver);text-transform:uppercase;font-family:var(--font-mono)}

main{max-width:72rem;margin:0 auto;padding:3rem 1.5rem;flex:1}

.breadcrumb{display:flex;align-items:center;gap:.5rem;margin-bottom:2rem}
.breadcrumb a{font-size:13px;color:var(--silver);text-decoration:none;transition:color .15s}
.breadcrumb a:hover{color:var(--ivory)}
.breadcrumb .sep{font-size:11px;color:var(--iron)}

.label{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.label::before{content:'';width:2rem;height:1px;background:var(--emerald);opacity:.3}
.label span{font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--emerald)}

.match-header{margin-bottom:3rem}
.match-header h1{font-size:clamp(28px,5vw,44px);font-weight:200;letter-spacing:-.01em;line-height:1.1;color:var(--ivory);margin-bottom:.5rem}
.match-header h1 .v{color:var(--iron);margin:0 .6em;font-size:.6em}
.match-meta{font-size:14px;color:var(--mist);margin-bottom:.25rem}
.match-venue{font-size:13px;color:var(--silver)}
.countdown{display:inline-flex;align-items:center;gap:.5rem;margin-top:1rem;padding:.25rem .75rem;border-radius:6px;background:var(--emerald-subtle);border:1px solid rgba(0,201,120,0.08)}
.countdown span{font-size:12px;font-family:var(--font-mono);color:var(--emerald);font-weight:500}

.card{border-radius:16px;background:var(--card-bg);border:1px solid var(--card-border);padding:2rem;margin-bottom:1.5rem}
.card-label{font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--silver);margin-bottom:1rem}

.odds-grid{display:grid;gap:1px;background:var(--card-border);border-radius:12px;overflow:hidden;margin-bottom:1.5rem}
.odds-row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;background:var(--card-bg);padding:.75rem 1rem}
.odds-header{background:var(--ash)}
.odds-row .book{font-size:13px;color:var(--bone);font-weight:400}
.odds-row .col-h{font-size:13px;color:var(--mist);font-weight:500}
.odds-row .pending{color:var(--iron);font-family:var(--font-mono);font-size:12px}
.odds-section{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--silver);padding:.75rem 1rem;background:var(--smoke)}

.prose{max-width:40rem}
.prose p{font-size:15px;color:var(--mist);line-height:1.7;margin-bottom:1rem}
.prose p:last-child{margin-bottom:0}
.prose strong{color:var(--ivory);font-weight:500}

.related{margin-top:3rem}
.related-grid{display:grid;gap:.75rem}
.related-card{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-radius:12px;background:var(--card-bg);border:1px solid var(--card-border);text-decoration:none;transition:border-color .2s}
.related-card:hover{border-color:rgba(255,255,255,0.08)}
.related-card .teams{font-size:14px;color:var(--ivory);font-weight:300}
.related-card .date{font-size:12px;color:var(--silver);font-family:var(--font-mono)}

.how{margin-top:3rem;max-width:40rem}

.site-footer{border-top:1px solid var(--card-border);margin-top:4rem}
.footer-inner{max-width:72rem;margin:0 auto;padding:2.5rem 1.5rem}
.footer-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}
.footer-top .brand{display:flex;align-items:baseline;gap:2px}
.footer-top .brand .t{font-size:10px;text-transform:lowercase;color:var(--iron)}
.footer-top .brand .d{font-size:20px;font-family:var(--font-serif);font-style:italic;font-weight:300;color:var(--iron);line-height:1}
.footer-copy{font-size:12px;color:var(--silver)}
.footer-legal{border-top:1px solid var(--card-border);padding-top:1.5rem}
.footer-legal p{font-size:11px;color:var(--iron);line-height:1.6;max-width:48rem}

@media(max-width:640px){
.nav-links{display:none}
.match-header h1{font-size:28px}
.odds-row{grid-template-columns:1.2fr 1fr 1fr 1fr;padding:.6rem .75rem}
.footer-top{flex-direction:column;align-items:flex-start;gap:1rem}
}
`.trim();

// ═══════════════════════════════════════════════════════════════
// PAGE SECTIONS
// ═══════════════════════════════════════════════════════════════

function renderNav(): string {
    return `
  <nav class="nav">
    <div class="nav-inner">
      <div style="display:flex;align-items:center;gap:2rem">
        <a href="/"><span class="t">the</span><span class="d">Drip</span></a>
        <div class="nav-links">
          <a href="/">Hub</a>
          <a href="/group/d">Group D</a>
        </div>
      </div>
      <div class="live-dot"><span>Live</span></div>
    </div>
  </nav>`;
}

function renderFooter(): string {
    return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="brand"><span class="t">the</span><span class="d">Drip</span></div>
        <div class="footer-copy">&copy; 2026 The Drip. Not financial advice.</div>
      </div>
      <div class="footer-legal">
        <p>The Drip compares odds across sportsbooks and prediction markets for informational purposes only. Gambling involves risk. Confirm legality in your jurisdiction before placing wagers. Past performance does not guarantee future results. Gap calculations are mathematical, not predictive.</p>
      </div>
    </div>
  </footer>`;
}

function renderBreadcrumbs(match: MatchSeed): string {
    const crumbs: { label: string; href: string }[] = [{ label: 'Hub', href: '/' }];
    if (match.group) {
        crumbs.push({ label: `Group ${match.group}`, href: `/group/${match.group.toLowerCase()}` });
    } else {
        crumbs.push({ label: phaseLabel(match.phase), href: '/' });
    }
    return `<div class="breadcrumb"> ${crumbs.map((c, i) =>
        `<a href="${c.href}">${escapeHtml(c.label)}</a>${i < crumbs.length - 1 ? '<span class="sep">/</span>' : ''}`
    ).join('')} </div>`;
}

function renderMatchContent(match: MatchSeed): string {
    const days = daysUntil(match.kickoff);
    const countdownText = days > 0 ? `${days} days to kickoff` : days === 0 ? 'Match day' : 'Completed';

    const isGroup = match.phase === 'group';
    const bothReal = isRealTeam(match.awayTeam) && isRealTeam(match.homeTeam);

    let groupContext = '';
    if (isGroup && match.group) {
        const teams = getGroupTeams(match.group);
        groupContext = `Group ${match.group} features ${teams.join(', ')}. Each team plays three group stage matches, with the top two advancing to the Round of 32 along with the eight best third-placed teams.`;
    }

    let matchProse = '';
    if (bothReal) {
        matchProse = `
    <p><strong>${escapeHtml(match.awayTeam)}</strong> and <strong>${escapeHtml(match.homeTeam)}</strong> meet in World Cup 2026 Group ${match.group} action at ${escapeHtml(match.venue)} in ${escapeHtml(match.venueCity)}. The Drip tracks moneyline, spread, and total pricing across regulated sportsbooks and prediction markets to identify cross-ecosystem pricing gaps.</p>
    ${groupContext ? `<p>${escapeHtml(groupContext)}</p>` : ''}
    <p>Sportsbooks set lines based on liability management and handle distribution. Prediction markets like Kalshi and Polymarket set prices through open order books driven by trader conviction. When these two systems price the same outcome differently, the gap represents a quantifiable edge.</p>`;
    } else if (isGroup) {
        matchProse = `
    <p>This Group ${match.group} match features ${escapeHtml(match.awayTeam)} against ${escapeHtml(match.homeTeam)} at ${escapeHtml(match.venue)}. Odds will populate once sportsbooks and prediction markets open lines for this fixture.</p>
    ${groupContext ? `<p>${escapeHtml(groupContext)}</p>` : ''}`;
    } else {
        matchProse = `
    <p>World Cup 2026 ${phaseLabel(match.phase)} &mdash; Match ${match.matchNumber} at ${escapeHtml(match.venue)} in ${escapeHtml(match.venueCity)}. Teams will be determined by earlier knockout results. Odds comparison will populate once matchups are confirmed and sportsbooks open lines.</p>`;
    }

    return `
<div class="match-header">
  <div class="label"><span>${isGroup ? `Group ${match.group} &middot; Match ${match.matchNumber}` : `${phaseLabel(match.phase)} &middot; Match ${match.matchNumber}`}</span></div>
  <h1>${escapeHtml(match.awayTeam)}<span class="v">v</span>${escapeHtml(match.homeTeam)}</h1>
  <p class="match-meta">${formatDateLong(match.kickoff)} &middot; ${formatTime(match.kickoff)}</p>
  <p class="match-venue">${escapeHtml(match.venue)}, ${escapeHtml(match.venueCity)}</p>
  ${days > 0 ? `<div class="countdown"><span>${countdownText}</span></div>` : ''}
</div>

<div class="card">
  <div class="card-label">Odds Comparison</div>
  <div class="odds-grid">
    <div class="odds-row odds-header">
      <span class="col-h">Venue</span>
      <span class="col-h">${escapeHtml(match.awayTeam)}</span>
      <span class="col-h">${escapeHtml(match.homeTeam)}</span>
      <span class="col-h">Draw</span>
    </div>
    <div class="odds-section">Sportsbooks</div>
    <div class="odds-row"><span class="book">DraftKings</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span></div>
    <div class="odds-row"><span class="book">FanDuel</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span></div>
    <div class="odds-row"><span class="book">BetMGM</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span></div>
    <div class="odds-section">Prediction Markets</div>
    <div class="odds-row"><span class="book">Kalshi</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span></div>
    <div class="odds-row"><span class="book">Polymarket</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span><span class="pending">&mdash;</span></div>
  </div>
  <p style="font-size:12px;color:var(--iron);line-height:1.5">Lines populate as books open markets for this match. Prediction market prices reflect last traded contract price.</p>
</div>

<div class="prose">
  <div class="label"><span>Analysis</span></div>
  ${matchProse}
</div>`;
}

function renderRelatedMatches(match: MatchSeed): string {
    if (!match.group) return '';

    const siblings = getGroupMatches(match.group)
        .filter(m => m.slug !== match.slug)
        .slice(0, 5);

    if (siblings.length === 0) return '';

    return `
<div class="related">
  <div class="label"><span>Group ${match.group} Matches</span></div>
  <div class="related-grid">
    ${siblings.map(m => `
    <a href="/edges/${m.slug}/" class="related-card">
      <span class="teams">${escapeHtml(m.awayTeam)} v ${escapeHtml(m.homeTeam)}</span>
      <span class="date">${formatDateShort(m.kickoff)}</span>
    </a>`).join('')}
  </div>
</div>`;
}

function renderHowItWorks(): string {
    return `
  <div class="how">
    <div class="label"><span>How It Works</span></div>
    <div class="prose">
      <p>Sportsbooks set odds based on liability and handle. Prediction markets like Kalshi and Polymarket set prices through open order books. When these two ecosystems price the same outcome differently, the gap is a measurable signal. The Drip surfaces those gaps across every World Cup 2026 match.</p>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURED DATA
// ═══════════════════════════════════════════════════════════════

function renderJsonLd(match: MatchSeed): string {
    const title = matchDisplayTitle(match);
    const sportsEvent = {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: title,
        startDate: match.kickoff,
        location: {
            '@type': 'Place',
            name: match.venue,
            address: { '@type': 'PostalAddress', addressLocality: match.venueCity },
        },
        homeTeam: { '@type': 'SportsTeam', name: match.homeTeam },
        awayTeam: { '@type': 'SportsTeam', name: match.awayTeam },
        description: matchSeoDescription(match),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        organizer: { '@type': 'Organization', name: 'FIFA', url: 'https://www.fifa.com' },
        superEvent: {
            '@type': 'SportsEvent',
            name: 'FIFA World Cup 2026',
            startDate: '2026-06-11',
            endDate: '2026-07-19',
        },
        url: `${SITE_URL}/edges/${match.slug}/`,
    };

    const breadcrumbItems: object[] = [
        { '@type': 'ListItem', position: 1, name: 'The Drip', item: SITE_URL },
    ];
    if (match.group) {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 2,
            name: `Group ${match.group}`,
            item: `${SITE_URL}/group/${match.group.toLowerCase()}`,
        });
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: `${SITE_URL}/edges/${match.slug}/`,
        });
    } else {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 2,
            name: title,
            item: `${SITE_URL}/edges/${match.slug}/`,
        });
    }

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
    };

    return `
  <script type="application/ld+json">${JSON.stringify(sportsEvent)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
}

// ═══════════════════════════════════════════════════════════════
// FULL PAGE RENDER
// ═══════════════════════════════════════════════════════════════

function renderMatchPage(match: MatchSeed): string {
    const title = matchSeoTitle(match);
    const description = matchSeoDescription(match);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${SITE_URL}/edges/${match.slug}/">

  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${SITE_URL}/edges/${match.slug}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Drip">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">

${renderJsonLd(match)}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">

  <style>${INLINE_CSS}</style>

</head>
<body>
${renderNav()}

  <main>
    ${renderBreadcrumbs(match)}
    ${renderMatchContent(match)}
    ${renderRelatedMatches(match)}
    ${renderHowItWorks()}
  </main>

${renderFooter()}

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// SITEMAP
// ═══════════════════════════════════════════════════════════════

function generateSitemap(matches: MatchSeed[]): string {
    const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
        ...matches.map(m => ({
            loc: `${SITE_URL}/edges/${m.slug}/`,
            priority: m.phase === 'final' ? '1.0' : m.phase === 'group' ? '0.9' : '0.8',
            changefreq: 'daily',
        })),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${BUILD_TIME}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

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

    const sitemap = generateSitemap(ALL_MATCHES);
    writeFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8');

    console.log(`\u2713 ${generated} match pages`);
    console.log(`\u2713 sitemap.xml`);
    console.log(`Build date: ${BUILD_TIME}`);
}

main().catch(err => {
    console.error('Prerender failed:', err);
    process.exit(1);
});

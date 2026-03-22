/**
 * Pre-render static HTML for all 12 World Cup 2026 group pages.
 * Generates SEO-ready pages in public/group/<letter>/index.html
 * with Obsidian Weissach v7 design + real odds data.
 *
 * Also patches sitemap.xml to include group pages.
 *
 * Usage: npx tsx scripts/prerender-groups.ts
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { allGroups, type GroupInfo } from '../src/data/groups';

const SITE_URL = 'https://thedrip.to';
const PUBLIC_DIR = resolve(import.meta.dirname, '..', 'public');
const BUILD_TIME = new Date().toISOString().slice(0, 10);

// ═══════════════════════════════════════════════════════════════
// STATIC ODDS DATA (baked in for SEO — same as useLiveData.ts)
// ═══════════════════════════════════════════════════════════════

const TEAM_ODDS: Record<string, { odds: string; implied: string; pct: number; isLongshot: boolean }> = {
    MEX: { odds: '+6600', implied: '1.5%', pct: 10, isLongshot: false },
    KOR: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    RSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    SUI: { odds: '+10000', implied: '1.0%', pct: 7, isLongshot: false },
    CAN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    QAT: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    BRA: { odds: '+750', implied: '10.5%', pct: 70, isLongshot: false },
    MAR: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false },
    SCO: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    HAI: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    USA: { odds: '+2500', implied: '3.8%', pct: 25, isLongshot: false },
    PAR: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    AUS: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    GER: { odds: '+1000', implied: '7.1%', pct: 47, isLongshot: false },
    CIV: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    ECU: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    CUW: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    NED: { odds: '+1400', implied: '5.3%', pct: 35, isLongshot: false },
    JPN: { odds: '+8000', implied: '1.2%', pct: 8, isLongshot: false },
    TUN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    BEL: { odds: '+3000', implied: '2.5%', pct: 17, isLongshot: false },
    EGY: { odds: '+25000', implied: '<0.4%', pct: 0, isLongshot: true },
    IRN: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    NZL: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    ESP: { odds: '+450', implied: '15.0%', pct: 100, isLongshot: false },
    URU: { odds: '+4000', implied: '2.4%', pct: 16, isLongshot: false },
    KSA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    CPV: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    FRA: { odds: '+750', implied: '10.5%', pct: 70, isLongshot: false },
    NOR: { odds: '+10000', implied: '1.0%', pct: 7, isLongshot: false },
    SEN: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    ARG: { odds: '+800', implied: '12.3%', pct: 82, isLongshot: false },
    AUT: { odds: '+15000', implied: '0.7%', pct: 0, isLongshot: true },
    ALG: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    JOR: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    POR: { odds: '+1200', implied: '6.3%', pct: 42, isLongshot: false },
    COL: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false },
    UZB: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
    ENG: { odds: '+550', implied: '13.2%', pct: 88, isLongshot: false },
    CRO: { odds: '+5000', implied: '2.0%', pct: 13, isLongshot: false },
    GHA: { odds: '+50000', implied: '<0.2%', pct: 0, isLongshot: true },
    PAN: { odds: '+100000', implied: '<0.1%', pct: 0, isLongshot: true },
};

// ═══════════════════════════════════════════════════════════════
// GROUP EDITORIAL METADATA
// ═══════════════════════════════════════════════════════════════

const GROUP_META: Record<string, {
    badge?: string;
    badgeType?: 'host' | 'death';
    tagline: string;
    analysis: string;
    seoTitle: string;
    seoDesc: string;
}> = {
    A: {
        badge: 'Host Nation', badgeType: 'host',
        tagline: 'Mexico opener at Azteca',
        analysis: "Mexico's high-altitude advantage at the Estadio Azteca is the strongest of any host nation, heavily favoring their progression from the group stage. South Korea represents the primary threat, having reached the semifinals in 2002 as co-hosts. South Africa adds unpredictability — they stunned France in the 2010 group stage on home soil. The Azteca's 7,200-foot elevation is a proven tactical weapon, with visiting teams historically struggling in the thin air. The Mexico vs South Korea clash in Monterrey is the group's decisive swing fixture.",
        seoTitle: 'World Cup 2026 Group A Odds — Mexico, South Korea, South Africa Predictions',
        seoDesc: 'Compare World Cup 2026 Group A outright odds and prediction market prices for Mexico, South Korea, South Africa. Match schedule, venues, and cross-ecosystem analysis.',
    },
    B: {
        badge: 'Host Nation', badgeType: 'host',
        tagline: 'Canada · Italy playoff swing',
        analysis: "If Italy wins their UEFA Playoff A bracket, this group transforms from comfortable to combustible. Switzerland profiles as the most reliable group-stage nation in recent tournament history — they have advanced from the group stage at four consecutive major tournaments since 2014. Canada, as co-hosts, gets the BMO Field and BC Place advantage. Qatar, the 2022 hosts, became the first host nation to lose all three group games and enter as the group's heaviest longshot.",
        seoTitle: 'World Cup 2026 Group B Odds — Canada, Switzerland, Qatar Predictions',
        seoDesc: 'Compare World Cup 2026 Group B outright odds and prediction market prices for Canada, Switzerland, Qatar. Match schedule, venues, and analysis.',
    },
    C: {
        badge: 'Group of Death', badgeType: 'death',
        tagline: 'Brazil vs Morocco marquee',
        analysis: "Brazil vs Morocco at MetLife Stadium on June 12 is the undisputed heavyweight fixture of the entire group stage. Morocco's 2022 semifinal run — beating Belgium, Spain, and Portugal — proved their defensive structure is world-class, not a fluke. Brazil enters off a historically turbulent qualifying campaign but remains priced as a top-5 outright favorite. Scotland's return to the World Cup marks their first appearance since 1998. Haiti makes history as a first-time qualifier.",
        seoTitle: 'World Cup 2026 Group C Odds — Brazil, Morocco, Scotland, Haiti Predictions',
        seoDesc: 'World Cup 2026 Group C breakdown: Brazil vs Morocco odds comparison, match schedule at MetLife Stadium, and outright winner probabilities across sportsbooks and prediction markets.',
    },
    D: {
        badge: 'Host Nation', badgeType: 'host',
        tagline: 'USA home advantage',
        analysis: "The most favorable draw any host nation could hope for. The USMNT under Pochettino avoids elite European squads entirely while playing every match on home soil at SoFi Stadium. Paraguay, Australia, and the UEFA Playoff C winner present manageable opposition. The opening match against Paraguay at SoFi Stadium in Inglewood sets the tournament tone for the host nation. USA holds 3.8% implied outright probability — the highest of any host nation in the field.",
        seoTitle: 'World Cup 2026 Group D Odds — USA, Paraguay, Australia Predictions',
        seoDesc: 'World Cup 2026 Group D analysis: USA home advantage at SoFi Stadium, Paraguay and Australia odds comparison across sportsbooks and Kalshi/Polymarket prediction markets.',
    },
    E: {
        tagline: 'Germany redemption · Curaçao debut',
        analysis: "Germany desperately seeks redemption after back-to-back group stage exits in 2018 and 2022 — a historically unprecedented collapse for a four-time champion. Wirtz and Musiala represent the most exciting young attacking midfield duo in the tournament. Ecuador provides legitimate South American quality. Ivory Coast, the reigning AFCON champions, are dangerous but underpriced. Curaçao makes a historic World Cup debut as the smallest nation in the field with a population of approximately 150,000.",
        seoTitle: 'World Cup 2026 Group E Odds — Germany, Ecuador, Ivory Coast, Curaçao Predictions',
        seoDesc: 'World Cup 2026 Group E odds: Germany redemption arc, Curaçao historic debut, Ecuador and Ivory Coast predictions. Outright odds and prediction market analysis.',
    },
    F: {
        badge: 'Dangerous', badgeType: 'death',
        tagline: 'Japan trap · Netherlands beware',
        analysis: "Japan stunned both Germany and Spain in the 2022 group stage, making this an extremely uncomfortable draw for the Netherlands. Japan at +8000 represents one of the most underpriced dark horse profiles in the tournament. The Netherlands enter as group favorites but face a squad that has proven capable of dismantling European powerhouses. Tunisia adds North African grit. The UEFA Playoff B winner could inject Austria or Ukraine into an already volatile group.",
        seoTitle: 'World Cup 2026 Group F Odds — Netherlands, Japan, Tunisia Predictions',
        seoDesc: 'World Cup 2026 Group F breakdown: Netherlands vs Japan odds, Tunisia and UEFA Playoff predictions. Cross-ecosystem odds comparison across sportsbooks and prediction markets.',
    },
    G: {
        tagline: "Belgium fading · Egypt's Salah",
        analysis: "Belgium's golden generation — De Bruyne, Lukaku, Courtois — is running on fumes. Their 2018 semifinal and 2022 group-stage exit trajectory tells the whole story. Egypt's Mohamed Salah is likely playing his final World Cup, guaranteeing massive viewership for every group match. Iran brings defensive discipline honed through Asian qualifying. New Zealand, the Oceania representatives, face the steepest quality gap but have produced upsets before.",
        seoTitle: 'World Cup 2026 Group G Odds — Belgium, Egypt, Iran, New Zealand Predictions',
        seoDesc: 'World Cup 2026 Group G analysis: Belgium golden generation farewell, Salah final World Cup, Iran and New Zealand odds across sportsbooks and prediction markets.',
    },
    H: {
        tagline: "Spain 18.5% of handle · Yamal turns 18",
        analysis: "Spain commands 18.5% of the total outright betting handle — the single largest concentration in the tournament. Lamine Yamal will turn 18 during the group stage, already the reigning European Championship Best Young Player. Uruguay brings legitimate knockout-stage pedigree with Núñez and Valverde forming a world-class spine. Saudi Arabia electrified the 2022 tournament by beating Argentina in the group stage but face a far tougher proposition here.",
        seoTitle: 'World Cup 2026 Group H Odds — Spain, Uruguay, Saudi Arabia, Cape Verde Predictions',
        seoDesc: 'World Cup 2026 Group H: Spain tournament favorite at +450, Uruguay dark horse, Saudi Arabia and Cape Verde odds. Prediction market analysis and match schedule.',
    },
    I: {
        badge: 'Group of Death', badgeType: 'death',
        tagline: 'Mbappé vs Haaland',
        analysis: "The generational collision between Mbappé and Haaland — France vs Norway — is projected to be the most-watched match of the entire group stage. France enters as defending finalists and perennial contenders. Norway's qualification marks Haaland's first-ever World Cup match; his 0.83 goals-per-game international record is the highest of any active player. Senegal adds genuine dark-horse quality, having reached the quarterfinals in 2002 and the Round of 16 in 2022.",
        seoTitle: 'World Cup 2026 Group I Odds — France, Norway, Senegal Predictions | Mbappé vs Haaland',
        seoDesc: 'World Cup 2026 Group I: Mbappé vs Haaland headline clash. France, Norway, Senegal odds comparison across DraftKings, Kalshi, and Polymarket prediction markets.',
    },
    J: {
        tagline: "Messi's farewell · Defending champs",
        analysis: "Lionel Messi turns 39 during the tournament. If he plays — and all indications suggest he will — every Argentina match becomes the hottest ticket on the continent. Argentina enters as the reigning World Cup and Copa América champions. Austria showed impressive form at Euro 2024, comfortably advancing from their group. Algeria brings passionate support and African qualifying battle-hardening. Jordan's qualification is historic, making their debut at the senior World Cup.",
        seoTitle: 'World Cup 2026 Group J Odds — Argentina, Austria, Algeria, Jordan Predictions',
        seoDesc: "World Cup 2026 Group J: Messi's farewell tour with defending champions Argentina. Austria, Algeria, Jordan odds and prediction market prices compared.",
    },
    K: {
        badge: 'Dangerous', badgeType: 'death',
        tagline: 'Ronaldo swan song · Colombia dark horse',
        analysis: "Cristiano Ronaldo's farewell World Cup adds narrative gravity to every Portugal match. At 41, he would become the oldest outfield player in World Cup history if he takes the pitch. Colombia represents legitimate, battle-tested knockout-stage quality after their 2024 Copa América final run against Argentina. Uzbekistan's qualification marks a breakthrough for Central Asian football. The Intercontinental Playoff 1 winner adds an unknown variable.",
        seoTitle: 'World Cup 2026 Group K Odds — Portugal, Colombia, Uzbekistan Predictions',
        seoDesc: "World Cup 2026 Group K: Ronaldo's final World Cup, Colombia dark horse after Copa América final. Outright odds and prediction market analysis.",
    },
    L: {
        badge: 'Group of Death', badgeType: 'death',
        tagline: 'England vs Croatia opener',
        analysis: "The consensus Group of Death. England vs Croatia in Dallas operates as a brutal opening act — a rematch of the 2018 semifinal that Croatia won. Croatia reached the 2018 final and the 2022 semifinal, making them the most consistent deep-run nation of the modern era. England, perennially priced as a contender, has the depth but faces immediate adversity. Ghana and Panama round out the group with genuine upset potential on any given matchday.",
        seoTitle: 'World Cup 2026 Group L Odds — England, Croatia, Ghana, Panama Predictions',
        seoDesc: 'World Cup 2026 Group L: England vs Croatia Group of Death opener. Outright winner odds, match schedule, and cross-ecosystem prediction market comparison.',
    },
};

// ═══════════════════════════════════════════════════════════════
// FLAG MAPPING (same as lib/flags.ts)
// ═══════════════════════════════════════════════════════════════

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

function flagUrl(code: string): string | null {
    const iso = FIFA_TO_FLAG[code.toUpperCase()];
    return iso ? `https://flagcdn.com/${iso}.svg` : null;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMatchDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMatchTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

// ═══════════════════════════════════════════════════════════════
// INLINE CSS — Obsidian Weissach v7 (matches edge pages)
// ═══════════════════════════════════════════════════════════════

const INLINE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
--void:#050505;--obsidian:#0a0a0a;--ash:#111;--smoke:#1a1a1a;
--card-bg:#141414;--card-border:#1f1f1f;
--iron:#3a3a3a;--silver:#6a6a6a;--mist:#8a8a8a;--bone:#b0b0b0;--ivory:#d8d4cc;--white:#eae6de;
--emerald:#00c978;--emerald-muted:#00a862;--emerald-glow:rgba(0,201,120,0.15);--emerald-subtle:rgba(0,201,120,0.06);
--red:#e74c3c;--red-glow:rgba(231,76,60,0.15);
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
.nav .t{font-size:10px;text-transform:lowercase;color:var(--mist)}
.nav .d{font-size:26px;font-family:var(--font-serif);font-style:italic;font-weight:300;color:var(--bone);line-height:1}
.nav-links{display:flex;gap:1.5rem;align-items:center}
.nav-links a{font-size:13px;color:var(--silver);text-decoration:none;transition:color .15s}
.nav-links a:hover{color:var(--bone)}
.live-dot{display:flex;align-items:center;gap:6px}
.live-dot::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--emerald);box-shadow:0 0 8px rgba(0,201,120,0.4)}
.live-dot span{font-size:10px;letter-spacing:.15em;color:var(--silver);text-transform:uppercase;font-family:var(--font-mono)}
main{max-width:48rem;margin:0 auto;padding:3rem 1.5rem;flex:1}
.breadcrumb{display:flex;align-items:center;gap:.5rem;margin-bottom:2rem}
.breadcrumb a{font-size:13px;color:var(--silver);text-decoration:none;transition:color .15s}
.breadcrumb a:hover{color:var(--ivory)}
.breadcrumb .sep{font-size:11px;color:var(--iron)}
.label{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.label::before{content:'';width:2rem;height:1px;background:var(--emerald);opacity:.3}
.label span{font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--emerald)}
.group-header{margin-bottom:2.5rem}
.group-header h1{font-size:clamp(32px,5vw,48px);font-weight:200;letter-spacing:-.01em;line-height:1.1;color:var(--ivory);margin-bottom:.5rem}
.group-badge{display:inline-block;font-size:10px;letter-spacing:.15em;text-transform:uppercase;font-weight:600;padding:3px 10px;border-radius:4px;margin-bottom:1rem}
.badge-host{background:rgba(253,224,71,0.12);color:#fde047;border:1px solid rgba(253,224,71,0.2)}
.badge-death{background:var(--red-glow);color:var(--red);border:1px solid rgba(231,76,60,0.2)}
.group-teams{display:flex;gap:1.25rem;flex-wrap:wrap;margin-bottom:1rem}
.team-chip{display:flex;align-items:center;gap:.5rem;padding:6px 12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:8px}
.team-chip img{width:20px;height:14px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,0.06) inset;border-radius:1px}
.team-chip span{font-size:14px;font-weight:400;color:var(--bone)}
.prose{max-width:40rem}
.prose p{font-size:15px;color:var(--mist);line-height:1.7;margin-bottom:1rem}
.prose p:last-child{margin-bottom:0}
.prose strong{color:var(--ivory);font-weight:500}
.section{margin-bottom:3rem}
.section-head{font-size:10px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--silver);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid var(--card-border)}
.card{border-radius:16px;background:var(--card-bg);border:1px solid var(--card-border);overflow:hidden;margin-bottom:1.5rem}
.odds-table{width:100%;border-collapse:collapse}
.odds-table th{text-align:left;padding:10px 16px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mist);font-weight:500;background:var(--ash);border-bottom:1px solid var(--card-border)}
.odds-table th.r{text-align:right}
.odds-table td{padding:12px 16px;border-bottom:1px solid var(--card-border);font-size:14px;color:var(--bone);vertical-align:middle}
.odds-table td.r{text-align:right}
.odds-table tr:last-child td{border-bottom:none}
.odds-table .team-cell{display:flex;align-items:center;gap:10px;font-weight:400}
.odds-table .team-cell img{width:20px;height:14px;object-fit:cover;border-radius:1px;box-shadow:0 0 0 1px rgba(255,255,255,0.06) inset}
.odds-val{font-family:var(--font-mono);font-size:15px;font-weight:500;color:var(--ivory)}
.odds-implied{font-family:var(--font-mono);font-size:13px;color:var(--mist)}
.odds-bar{width:80px;height:4px;background:var(--iron);border-radius:2px;display:inline-block;vertical-align:middle;margin-left:8px}
.odds-bar-fill{height:100%;background:var(--emerald);border-radius:2px}
.match-card{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;padding:1rem 1.25rem;border-bottom:1px solid var(--card-border);text-decoration:none;transition:background .15s}
.match-card:last-child{border-bottom:none}
.match-card:hover{background:rgba(255,255,255,0.02)}
.match-home,.match-away{font-size:14px;color:var(--bone);font-weight:300;display:flex;align-items:center;gap:8px}
.match-away{justify-content:flex-end;text-align:right}
.match-center{text-align:center}
.match-vs{font-size:11px;color:var(--iron);font-family:var(--font-mono);text-transform:uppercase}
.match-date{font-size:11px;color:var(--mist);font-family:var(--font-mono)}
.match-venue-text{font-size:10px;color:var(--iron)}
.faq{margin-top:3rem}
.faq-item{margin-bottom:1.5rem}
.faq-q{font-size:14px;font-weight:500;color:var(--ivory);margin-bottom:.5rem}
.faq-a{font-size:14px;color:var(--mist);line-height:1.6}
.group-nav{display:flex;justify-content:space-between;align-items:center;margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--card-border)}
.group-nav a{font-size:13px;color:var(--silver);text-decoration:none;transition:color .15s}
.group-nav a:hover{color:var(--ivory)}
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
.group-header h1{font-size:28px}
.group-teams{gap:.75rem}
.match-card{grid-template-columns:1fr auto 1fr;gap:.5rem;padding:.75rem 1rem}
.footer-top{flex-direction:column;align-items:flex-start;gap:1rem}
.odds-bar{display:none}
}
`.trim();

// ═══════════════════════════════════════════════════════════════
// PAGE RENDER
// ═══════════════════════════════════════════════════════════════

function renderGroupPage(letter: string, group: GroupInfo): string {
    const meta = GROUP_META[letter];
    if (!meta) throw new Error(`No meta for group ${letter}`);

    const letters = 'ABCDEFGHIJKL'.split('');
    const idx = letters.indexOf(letter);
    const prev = idx > 0 ? letters[idx - 1] : null;
    const next = idx < letters.length - 1 ? letters[idx + 1] : null;

    const teamNames = group.teams.map(t => t.name).join(', ');
    const venues = [...new Set(group.matches.map(m => `${m.venue.name}, ${m.venue.city}`))].join('; ');

    // Structured data
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'The Drip', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: `Group ${letter}`, item: `${SITE_URL}/group/${letter.toLowerCase()}/` },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Who will win World Cup 2026 Group ${letter}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${group.teams[0].name} is the group favorite based on current sportsbook outright winner odds. ${teamNames} compete in Group ${letter} of the 2026 FIFA World Cup.`,
                },
            },
            {
                '@type': 'Question',
                name: `Where is World Cup 2026 Group ${letter} being played?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Group ${letter} matches are hosted at ${venues}.`,
                },
            },
            {
                '@type': 'Question',
                name: `What are the World Cup 2026 Group ${letter} odds?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: group.teams.map(t => {
                        const o = TEAM_ODDS[t.code];
                        return o ? `${t.name}: ${o.odds} (${o.implied} implied)` : `${t.name}: TBD`;
                    }).join('. ') + '.',
                },
            },
        ],
    };

    // Team chips
    const teamChipsHtml = group.teams.map(t => {
        const flag = flagUrl(t.code);
        return `<div class="team-chip">${flag ? `<img src="${flag}" alt="${escapeHtml(t.name)}" loading="lazy">` : ''}<span>${escapeHtml(t.name)}</span></div>`;
    }).join('\n        ');

    // Odds table rows
    const oddsRows = group.teams.map((t, i) => {
        const o = TEAM_ODDS[t.code];
        const flag = flagUrl(t.code);
        const isTop = i === 0;
        return `
      <tr${isTop ? ' style="background:rgba(0,201,120,0.03)"' : ''}>
        <td><div class="team-cell">${flag ? `<img src="${flag}" alt="${escapeHtml(t.name)}" loading="lazy">` : ''}<span${isTop ? ' style="font-weight:500;color:var(--ivory)"' : ''}>${escapeHtml(t.name)}</span></div></td>
        <td class="r"><span class="odds-val"${isTop ? ' style="color:var(--emerald)"' : ''}>${o?.odds ?? 'TBD'}</span></td>
        <td class="r">
          <span class="odds-implied">${o?.implied ?? '—'}</span>
          ${o && o.pct > 0 ? `<span class="odds-bar"><span class="odds-bar-fill" style="width:${o.pct}%"></span></span>` : ''}
        </td>
      </tr>`;
    }).join('');

    // Match schedule rows
    const matchRows = group.matches.map(m => {
        const homeFlag = flagUrl(m.homeTeam.code);
        const awayFlag = flagUrl(m.awayTeam.code);
        const slug = `${m.awayTeam.code.toLowerCase()}-vs-${m.homeTeam.code.toLowerCase()}-${new Date(m.kickoff).toISOString().slice(0, 10)}`;
        return `
      <a href="/edges/${slug}/" class="match-card">
        <div class="match-home">${homeFlag ? `<img src="${homeFlag}" alt="" style="width:18px;height:12px;object-fit:cover;border-radius:1px">` : ''}${escapeHtml(m.homeTeam.name)}</div>
        <div class="match-center">
          <div class="match-vs">vs</div>
          <div class="match-date">${formatMatchDate(m.kickoff)}</div>
          <div class="match-venue-text">${escapeHtml(m.venue.name)}</div>
        </div>
        <div class="match-away">${escapeHtml(m.awayTeam.name)}${awayFlag ? `<img src="${awayFlag}" alt="" style="width:18px;height:12px;object-fit:cover;border-radius:1px">` : ''}</div>
      </a>`;
    }).join('');

    // Badge HTML
    const badgeHtml = meta.badge
        ? `<div class="group-badge ${meta.badgeType === 'death' ? 'badge-death' : 'badge-host'}">${escapeHtml(meta.badge)}</div>`
        : '';

    // Adjacent groups nav
    const groupNavHtml = `
    <nav class="group-nav">
      ${prev ? `<a href="/group/${prev.toLowerCase()}/">&larr; Group ${prev}</a>` : '<span></span>'}
      <a href="/">All Groups</a>
      ${next ? `<a href="/group/${next.toLowerCase()}/">Group ${next} &rarr;</a>` : '<span></span>'}
    </nav>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>${escapeHtml(meta.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(meta.seoDesc)}">
  <link rel="canonical" href="${SITE_URL}/group/${letter.toLowerCase()}/">

  <meta property="og:title" content="${escapeHtml(meta.seoTitle)}">
  <meta property="og:description" content="${escapeHtml(meta.seoDesc)}">
  <meta property="og:url" content="${SITE_URL}/group/${letter.toLowerCase()}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Drip">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(meta.seoTitle)}">
  <meta name="twitter:description" content="${escapeHtml(meta.seoDesc)}">

  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">

  <style>${INLINE_CSS}</style>
</head>
<body>

  <nav class="nav">
    <div class="nav-inner">
      <div style="display:flex;align-items:center;gap:2rem">
        <a href="/"><span class="t">the</span><span class="d">Drip</span></a>
        <div class="nav-links">
          <a href="/">Hub</a>
          ${letters.map(l => `<a href="/group/${l.toLowerCase()}/"${l === letter ? ' style="color:var(--ivory)"' : ''}>Group ${l}</a>`).join('\n          ')}
        </div>
      </div>
      <div class="live-dot"><span>Live</span></div>
    </div>
  </nav>

  <main>
    <div class="breadcrumb">
      <a href="/">Hub</a><span class="sep">/</span><span style="color:var(--ivory)">Group ${letter}</span>
    </div>

    <div class="group-header">
      ${badgeHtml}
      <h1>Group ${letter}</h1>
      <div class="group-teams">
        ${teamChipsHtml}
      </div>
    </div>

    <!-- Analysis -->
    <div class="section">
      <div class="label"><span>Analysis</span></div>
      <div class="prose">
        <p>${escapeHtml(meta.analysis)}</p>
      </div>
    </div>

    <!-- Outright Winner Odds -->
    <div class="section">
      <div class="section-head">Outright Winner Odds</div>
      <div class="card">
        <table class="odds-table">
          <thead>
            <tr>
              <th>Team</th>
              <th class="r">Odds</th>
              <th class="r">Implied Win Prob</th>
            </tr>
          </thead>
          <tbody>${oddsRows}
          </tbody>
        </table>
      </div>
      <p style="font-size:11px;color:var(--iron);line-height:1.5">Outright tournament winner odds via DraftKings. Implied probability calculated after devigging. Prediction market prices from Kalshi and Polymarket reflect last traded contract price.</p>
    </div>

    <!-- Match Schedule -->
    <div class="section">
      <div class="section-head">Match Schedule &middot; ${group.matches.length} Matches</div>
      <div class="card">${matchRows}
      </div>
    </div>

    <!-- FAQ -->
    <div class="faq">
      <div class="section-head">Frequently Asked</div>
      <div class="faq-item">
        <div class="faq-q">Who will win World Cup 2026 Group ${letter}?</div>
        <div class="faq-a">${escapeHtml(group.teams[0].name)} is the group favorite based on current sportsbook odds at ${TEAM_ODDS[group.teams[0].code]?.odds ?? 'TBD'} outright. ${escapeHtml(teamNames)} compete in Group ${letter}.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Where is Group ${letter} being played?</div>
        <div class="faq-a">Group ${letter} matches are hosted at ${escapeHtml(venues)}.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">What are the Group ${letter} prediction market odds?</div>
        <div class="faq-a">${group.teams.map(t => {
            const o = TEAM_ODDS[t.code];
            return `${escapeHtml(t.name)}: ${o?.odds ?? 'TBD'} (${o?.implied ?? '—'} implied)`;
        }).join('. ')}. Prices compared across DraftKings, Kalshi, and Polymarket.</div>
      </div>
    </div>

    ${groupNavHtml}
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="brand"><span class="t">the</span><span class="d">Drip</span></div>
        <div class="footer-copy">&copy; 2026 The Drip. Not financial advice.</div>
      </div>
      <div class="footer-legal">
        <p>The Drip compares odds across sportsbooks and prediction markets for informational purposes only. Gambling involves risk. Confirm legality in your jurisdiction before placing wagers. Past performance does not guarantee future results.</p>
      </div>
    </div>
  </footer>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// PATCH SITEMAP
// ═══════════════════════════════════════════════════════════════

function patchSitemap(): void {
    const sitemapPath = resolve(PUBLIC_DIR, 'sitemap.xml');
    if (!existsSync(sitemapPath)) {
        console.warn('sitemap.xml not found — skipping patch');
        return;
    }

    let sitemap = readFileSync(sitemapPath, 'utf-8');

    // Check if group pages already exist
    if (sitemap.includes('/group/a/')) {
        console.log('  Group pages already in sitemap — skipping');
        return;
    }

    const groupUrls = 'ABCDEFGHIJKL'.split('').map(l => `  <url>
    <loc>${SITE_URL}/group/${l.toLowerCase()}/</loc>
    <lastmod>${BUILD_TIME}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    // Insert after the homepage entry
    sitemap = sitemap.replace(
        '</url>\n  <url>',
        `</url>\n${groupUrls}\n  <url>`,
    );

    writeFileSync(sitemapPath, sitemap, 'utf-8');
    console.log('  ✓ sitemap.xml patched with 12 group pages');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
    console.log('Pre-rendering 12 group pages...');

    let generated = 0;
    for (const [letter, group] of Object.entries(allGroups)) {
        const dir = resolve(PUBLIC_DIR, 'group', letter.toLowerCase());
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }

        const html = renderGroupPage(letter, group);
        writeFileSync(resolve(dir, 'index.html'), html, 'utf-8');
        generated++;
        console.log(`  ✓ /group/${letter.toLowerCase()}/`);
    }

    patchSitemap();

    console.log(`\nDone: ${generated} group pages generated.`);
    console.log(`Build date: ${BUILD_TIME}`);
}

main();

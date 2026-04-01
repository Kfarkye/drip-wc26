'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  TrendsPageData,
  TrendsPageTrendRow,
  TrendDirection,
} from '../../../lib/trends-page';

type SortMode = 'strength' | 'sample' | 'alphabetical';
type SignalFilter = 'all' | 'trend' | 'fade';
type DirectionFilter = 'all' | 'trend' | 'fade' | 'neutral';
type SportFilter = 'all' | 'soccer' | 'nba' | 'nhl' | 'mlb' | 'ncaab' | 'mls';

type LayerLedger = {
  avgHit: number;
  above80: number;
  sampleAtLeast10: number;
  perfect: number;
  total: number;
};

const DEFAULT_LIMIT = 250;

const SORT_OPTIONS = [
  { value: 'strength', label: 'Strength (hit % desc)' },
  { value: 'sample', label: 'Sample' },
  { value: 'alphabetical', label: 'Alphabetical' },
] as const;

const SPORT_OPTIONS: { value: SportFilter; label: string }[] = [
  { value: 'all', label: 'All sports' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'nba', label: 'NBA' },
  { value: 'nhl', label: 'NHL' },
  { value: 'mlb', label: 'MLB' },
  { value: 'ncaab', label: 'NCAAB' },
  { value: 'mls', label: 'MLS' },
];

const DIRECTION_TABS: { value: DirectionFilter; label: string }[] = [
  { value: 'all', label: 'ALL' },
  { value: 'trend', label: 'TREND' },
  { value: 'fade', label: 'FADE' },
  { value: 'neutral', label: 'NEUTRAL' },
];

const SIGNAL_OPTIONS: { value: SignalFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'trend', label: 'Trend' },
  { value: 'fade', label: 'Fade' },
];

const SCOREBOARD_METRICS: Array<{ label: string; suffix: string }> = [
  { label: 'AVG GOALS', suffix: '' },
  { label: 'AVG CORNERS', suffix: '' },
  { label: 'AVG CARDS', suffix: '' },
  { label: 'AVG PASS %', suffix: '%' },
  { label: 'AVG SHOT ACCURACY', suffix: '%' },
  { label: 'OVER ROI', suffix: '%' },
  { label: 'HOME ATS ROI', suffix: '%' },
];

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatPercent(value: number | null, suffix = '%'): string {
  if (!Number.isFinite(value as number) || value === null) return '--';
  return `${value.toFixed(1)}${suffix}`;
}

function qualityColor(value: number): 'high' | 'mid' | 'low' {
  if (value >= 80) return 'high';
  if (value >= 65) return 'mid';
  return 'low';
}

function directionMeta(direction: TrendDirection): { label: string; icon: string; className: string } {
  if (direction === 'trend') {
    return { label: 'TREND', icon: '↑', className: 'trends-direction-trend' };
  }

  if (direction === 'fade') {
    return { label: 'FADE', icon: '↓', className: 'trends-direction-fade' };
  }

  return { label: 'NEUTRAL', icon: '→', className: 'trends-direction-neutral' };
}

function prettyLeague(league: string): string {
  return league || 'Global';
}

function sportFromLeague(league: string): SportFilter {
  const normalized = league.toLowerCase();

  if (normalized.includes('nba')) return 'nba';
  if (normalized.includes('nhl')) return 'nhl';
  if (normalized.includes('mlb')) return 'mlb';
  if (normalized.includes('ncaab') || normalized.includes('mens-college-basketball')) return 'ncaab';
  if (normalized.includes('mls') || normalized.includes('usa.1') || normalized.includes('mex')) return 'mls';

  return 'soccer';
}

function sortRows(rows: TrendsPageTrendRow[], sort: SortMode): TrendsPageTrendRow[] {
  const sorted = [...rows];

  if (sort === 'sample') {
    sorted.sort((left, right) => right.sample - left.sample || right.hitRate - left.hitRate);
    return sorted;
  }

  if (sort === 'alphabetical') {
    sorted.sort((left, right) => left.team.localeCompare(right.team) || left.league.localeCompare(right.league));
    return sorted;
  }

  sorted.sort((left, right) => right.hitRate - left.hitRate || right.sample - left.sample);
  return sorted;
}

function buildFilters(payload: { layer: string; minRate: number }) {
  const params = new URLSearchParams();
  params.set('minRate', String(payload.minRate));
  params.set('limit', String(DEFAULT_LIMIT));

  if (payload.layer !== 'all') {
    params.set('layer', payload.layer);
  }

  return params;
}

function buildLayerLedger(rows: TrendsPageTrendRow[]): Array<{ layer: string; ledger: LayerLedger }> {
  const groups = new Map<string, LayerLedger>();

  for (const row of rows) {
    const existing = groups.get(row.layer);
    if (!existing) {
      groups.set(row.layer, {
        avgHit: 0,
        above80: 0,
        sampleAtLeast10: 0,
        perfect: 0,
        total: 0,
      });
    }

    const entry = groups.get(row.layer);
    if (!entry) continue;

    entry.total += 1;
    entry.avgHit += row.hitRate;
    if (row.hitRate >= 80) entry.above80 += 1;
    if (row.sample >= 10) entry.sampleAtLeast10 += 1;
    if (row.hitRate >= 100) entry.perfect += 1;
  }

  const cards: Array<{ layer: string; ledger: LayerLedger }> = [];

  for (const [layer, entry] of groups) {
    cards.push({
      layer,
      ledger: {
        ...entry,
        avgHit: entry.total === 0 ? 0 : entry.avgHit / entry.total,
      },
    });
  }

  cards.sort((left, right) => left.layer.localeCompare(right.layer));
  return cards;
}

export default function TrendsBoard({ data }: { data: TrendsPageData }) {
  const [activeLayer, setActiveLayer] = useState('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [sortBy, setSortBy] = useState<SortMode>('strength');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [minHitRate, setMinHitRate] = useState(80);
  const [minSample, setMinSample] = useState(10);
  const [signalSearch, setSignalSearch] = useState('');
  const [trendsRows, setTrendsRows] = useState<TrendsPageTrendRow[]>(data.rows);
  const [metrics, setMetrics] = useState(data.metrics);
  const [leagues, setLeagues] = useState<string[]>(data.leagues);
  const [layers, setLayers] = useState<string[]>(data.layers);
  const [updatedAt, setUpdatedAt] = useState<string>(data.updatedAt);
  const [sourceLabel, setSourceLabel] = useState<string>(data.sourceLabel);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [layerOptions, setLayerOptions] = useState<string[]>(data.layers);
  const requestRef = useRef(0);

  useEffect(() => {
    if (activeLayer === 'all' && sportFilter === 'all' && minHitRate === 80) {
      setTrendsRows(data.rows);
      setMetrics(data.metrics);
      setLeagues(data.leagues);
      setLayers(data.layers);
      setLayerOptions(data.layers);
      setUpdatedAt(data.updatedAt);
      setSourceLabel(data.sourceLabel);
      return;
    }

    const requestId = ++requestRef.current;
    const controller = new AbortController();

    setLoading(true);
    setErrorState(null);

    const params = buildFilters({
      layer: activeLayer,
      minRate: minHitRate,
    });

    const load = async () => {
      try {
        const response = await fetch(`/api/trends?${params.toString()}`, {
          headers: {
            accept: 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Server returned ${response.status}`);

        const payload = (await response.json()) as TrendsPageData;
        if (requestRef.current !== requestId) return;

        setTrendsRows(payload.rows);
        setMetrics(payload.metrics);
        setLeagues(payload.leagues);
        setLayers(payload.layers);
        setLayerOptions(payload.layers);
        setUpdatedAt(payload.updatedAt);
        setSourceLabel(payload.sourceLabel);

        if (activeLayer !== 'all' && !payload.layers.includes(activeLayer)) {
          setActiveLayer('all');
        }
      } catch (error) {
        if (requestRef.current !== requestId) return;
        if ((error as Error).name !== 'AbortError') {
          setErrorState('Unable to refresh trends right now. Showing last loaded dataset.');
        }
      } finally {
        if (requestRef.current === requestId) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [activeLayer, minHitRate, data.rows, data.metrics, data.leagues, data.layers, data.updatedAt, data.sourceLabel]);

  useEffect(() => {
    if (minHitRate === 80 && activeLayer === 'all' && sportFilter === 'all' && signalFilter === 'all' && directionFilter === 'all' && signalSearch.length === 0 && minSample === 10 && sortBy === 'strength') {
      return;
    }

    if (requestRef.current === 0) {
      setTrendsRows(data.rows);
      setMetrics(data.metrics);
      setLeagues(data.leagues);
      setLayers(data.layers);
      setLayerOptions(data.layers);
      setUpdatedAt(data.updatedAt);
      setSourceLabel(data.sourceLabel);
    }
  }, [signalFilter, directionFilter, minSample, sortBy, signalSearch, data.rows, data.metrics, data.leagues, data.layers, data.updatedAt, data.sourceLabel]);

  const filteredRows = useMemo(() => {
    const query = signalSearch.trim().toLowerCase();

    return trendsRows.filter((row) => {
      const teamMatch = signalFilter === 'all' || row.signalType === signalFilter;
      const directionMatch = directionFilter === 'all' || row.direction === directionFilter;
      const layerMatch = activeLayer === 'all' || row.layer === activeLayer;
      const sportMatch = sportFilter === 'all' || sportFromLeague(row.league) === sportFilter;
      const hitMatch = row.hitRate >= minHitRate;
      const sampleMatch = row.sample >= minSample;
      const searchMatch =
        query.length === 0 ||
        row.team.toLowerCase().includes(query) ||
        row.trend.toLowerCase().includes(query) ||
        row.record.toLowerCase().includes(query);

      return teamMatch && directionMatch && layerMatch && sportMatch && hitMatch && sampleMatch && searchMatch;
    });
  }, [activeLayer, directionFilter, minHitRate, minSample, signalFilter, sportFilter, signalSearch, trendsRows]);

  const sortedRows = useMemo(() => sortRows(filteredRows, sortBy), [filteredRows, sortBy]);

  const summaryCards = useMemo(
    () => [
      metrics.avgGoals,
      metrics.avgCorners,
      metrics.avgCards,
      metrics.avgPassPct,
      metrics.avgShotAccuracy,
      metrics.overRoi,
      metrics.homeAtsRoi,
    ],
    [metrics],
  );

  const layerLedger = useMemo(() => buildLayerLedger(trendsRows), [trendsRows]);

  const columns = useMemo<ColumnDef<TrendsPageTrendRow>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        cell: (context) => context.row.index + 1,
        size: 60,
      },
      {
        accessorKey: 'team',
        header: 'Team / Entity',
        cell: (context) => {
          const row = context.row.original;
          return (
            <div className="trends-team-cell">
              {row.logoUrl ? (
                <img src={row.logoUrl} alt="team logo" className="trends-team-logo" />
              ) : (
                <span className="trends-team-fallback">{row.team.slice(0, 2).toUpperCase()}</span>
              )}
              <span>
                <strong>{row.team}</strong>
                <span className="trends-record-pill">{row.record}</span>
              </span>
            </div>
          );
        },
        minSize: 210,
      },
      {
        accessorKey: 'league',
        header: 'League',
        cell: (context) => prettyLeague(context.getValue<string>()),
      },
      {
        accessorKey: 'trend',
        header: 'Signal',
        cell: (context) => {
          const row = context.row.original;
          return (
            <>
              <div className="trends-signal-copy">{row.trend}</div>
              <div className="trends-signal-meta">{row.section ? row.section : row.layer}</div>
            </>
          );
        },
      },
      {
        accessorKey: 'layer',
        header: 'Layer',
        cell: (context) => <span className="league-badge league-badge-amber">{context.getValue<string>()}</span>,
      },
      {
        id: 'signalQuality',
        header: 'Signal Quality',
        cell: (context) => {
          const hit = context.row.original.hitRate;
          const quality = qualityColor(hit);
          return (
            <div className="trends-signal-track-wrap">
              <div className={`trends-signal-track ${quality}`}>
                <span style={{ width: `${Math.max(0, Math.min(100, hit))}%` }} />
              </div>
              <span className={`trends-signal-value trends-hit-${quality}`}>{hit.toFixed(1)}%</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'hitRate',
        header: 'Hit %',
        cell: (context) => {
          const value = context.getValue<number>();
          return <strong className={`trends-hit-${qualityColor(value)}`}>{value.toFixed(1)}%</strong>;
        },
      },
      {
        accessorKey: 'sample',
        header: 'Sample',
        cell: (context) => context.getValue<number>(),
      },
      {
        id: 'direction',
        header: 'Direction',
        cell: (context) => {
          const row = context.row.original;
          const meta = directionMeta(row.direction);
          return (
            <span className="trends-direction-cell">
              <span className={`trends-direction ${meta.className}`}>
                <span aria-hidden="true">{meta.icon}</span>
                {meta.label}
              </span>
              <span className={`trends-held ${row.lastHeld ? 'trends-held-yes' : 'trends-held-no'}`}>{row.lastHeld ? '✓' : '✕'}</span>
            </span>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: sortedRows,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="match-shell trends-shell">
      <header className="hero-card trends-hero">
        <div className="trends-intro">
          <p className="eyebrow">Trend Board</p>
          <h1 className="hero-title">SportsSync Trends</h1>
        </div>
        <p className="hero-copy">Market behavior and directional trends with signal quality, odds context, and team logos.</p>
        <dl className="meta-grid trends-kpi-grid">
          <div>
            <dt>Source</dt>
            <dd>{sourceLabel}</dd>
          </div>
          <div>
            <dt>Rows</dt>
            <dd>{trendsRows.length}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatUpdated(updatedAt)}</dd>
          </div>
          <div>
            <dt>Leagues visible</dt>
            <dd>{leagues.length}</dd>
          </div>
          <div>
            <dt>Filtered</dt>
            <dd>{sortedRows.length}</dd>
          </div>
        </dl>
      </header>

      <section className="panel">
        <div className="panel-header">
          <h2>Summary metrics (finished matches)</h2>
          <p>Calculated from finished rows in match_feed.</p>
        </div>
        <div className="trends-metric-scroll" aria-label="match_feed summary metrics">
          {summaryCards.map((value, index) => {
            const metric = SCOREBOARD_METRICS[index];
            return (
              <article key={metric.label} className="trends-metric-card">
                <p className="trends-metric-label">{metric.label}</p>
                <strong>{formatPercent(value, metric.suffix)}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Layer quality</h2>
          <p>One card per layer from current loaded trend set.</p>
        </div>
        <div className="trends-ledger-grid">
          {layerLedger.slice(0, 12).map((item) => {
            const { avgHit, above80, sampleAtLeast10, perfect, total } = item.ledger;
            return (
              <article key={item.layer} className="trends-ledger-card">
                <h3>{item.layer}</h3>
                <p>{total} active signals</p>
                <strong>{avgHit.toFixed(1)}%</strong>
                <span>Avg hit rate</span>
                <div className="trends-layer-metric-grid">
                  <span>
                    +80% hit: <b>{above80}</b>
                  </span>
                  <span>
                    sample 10+: <b>{sampleAtLeast10}</b>
                  </span>
                  <span>
                    perfect: <b>{perfect}</b>
                  </span>
                </div>
              </article>
            );
          })}
          {layerLedger.length === 0 && <p className="trends-empty">No layers loaded yet.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Filter controls</h2>
          <p>Use local filters for fast scans. Core set is refreshed from RPC based on layer/sport/min hit.</p>
        </div>
        {errorState ? <p className="trends-error">{errorState}</p> : null}

        <div className="trends-toolbar">
          <label className="trends-filter">
            <span>Layer</span>
            <select value={activeLayer} onChange={(event) => setActiveLayer(event.target.value)}>
              <option value="all">All layers</option>
              {(layerOptions.length > 0 ? layerOptions : layers).map((layer) => (
                <option key={layer} value={layer}>
                  {layer}
                </option>
              ))}
            </select>
          </label>

          <label className="trends-filter">
            <span>Sport</span>
            <select value={sportFilter} onChange={(event) => setSportFilter(event.target.value as SportFilter)}>
              {SPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="trends-filter">
            <span>Signal</span>
            <select value={signalFilter} onChange={(event) => setSignalFilter(event.target.value as SignalFilter)}>
              {SIGNAL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="trends-filter">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortMode)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="trends-filter">
            <span>Min Hit %</span>
            <input type="range" min={50} max={100} value={minHitRate} onChange={(event) => setMinHitRate(Number(event.target.value))} />
            <strong>{minHitRate}%</strong>
          </label>

          <label className="trends-filter">
            <span>Min games</span>
            <input type="range" min={1} max={10} value={minSample} onChange={(event) => setMinSample(Number(event.target.value))} />
            <strong>{minSample}</strong>
          </label>

          <label className="trends-filter">
            <span>Signal search</span>
            <input
              type="text"
              value={signalSearch}
              onChange={(event) => setSignalSearch(event.target.value)}
              placeholder="Search team or trend"
            />
          </label>

          <div className="trends-chip-row">
            {DIRECTION_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`trends-chip ${directionFilter === tab.value ? 'trends-chip-active' : ''}`}
                onClick={() => setDirectionFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Trends table</h2>
          <p>Showing {sortedRows.length} of {trendsRows.length} active rows.</p>
        </div>

        {loading ? <p className="trends-loading">Refreshing from get_trends...</p> : null}

        <div className="favorites-table-wrap trends-table-wrap" role="region" aria-live="polite" aria-label="trends table">
          <table className="favorites-table trends-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="trends-empty">
                    No rows match your filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  useTrends,
  LAYER_LABELS,
  humanizeTrend,
  deriveRecord,
  type TrendRow,
} from '../../hooks/useHomepageData';

function getTeamLogoUrl(teamName: string): string {
  const slug = teamName.trim().toLowerCase().replace(/\s+/g, '-');
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${slug}.png`;
}

function groupByLayer(rows: TrendRow[]): Map<string, TrendRow[]> {
  const groups = new Map<string, TrendRow[]>();
  for (const row of rows) {
    const key = row.layer || 'OTHER';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return groups;
}

function getUniqueLeagues(rows: TrendRow[]): string[] {
  const leagues = new Set<string>();
  for (const row of rows) {
    if (row.league) leagues.add(row.league);
  }
  return Array.from(leagues).sort();
}

export const TrendsBoard: React.FC = () => {
  const { data: trends = [], isLoading } = useTrends();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const leagues = useMemo(() => getUniqueLeagues(trends), [trends]);

  const filtered = useMemo(
    () => (selectedLeague ? trends.filter((r) => r.league === selectedLeague) : trends),
    [trends, selectedLeague]
  );

  const grouped = useMemo(() => groupByLayer(filtered), [filtered]);

  // Sort layer keys by defined order
  const layerOrder = Object.keys(LAYER_LABELS);
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const ia = layerOrder.indexOf(a);
    const ib = layerOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-ui)' }}>
        Loading trends…
      </div>
    );
  }

  return (
    <div>
      {/* League filter chips */}
      {leagues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedLeague(null)}
            className="px-3 py-1 text-xs uppercase tracking-wider transition-colors"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              background: selectedLeague === null ? 'var(--gray-900)' : 'var(--gray-100)',
              color: selectedLeague === null ? '#fff' : 'var(--gray-600)',
              border: '1px solid',
              borderColor: selectedLeague === null ? 'var(--gray-900)' : 'var(--gray-300)',
            }}
          >
            All
          </button>
          {leagues.map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league === selectedLeague ? null : league)}
              className="px-3 py-1 text-xs uppercase tracking-wider transition-colors"
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                background: selectedLeague === league ? 'var(--gray-900)' : 'var(--gray-100)',
                color: selectedLeague === league ? '#fff' : 'var(--gray-600)',
                border: '1px solid',
                borderColor: selectedLeague === league ? 'var(--gray-900)' : 'var(--gray-300)',
              }}
            >
              {league}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-12 text-center" style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-ui)' }}>
          No public trends available.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((layer) => {
            const rows = grouped.get(layer)!;
            const sectionLabel = LAYER_LABELS[layer] || layer;
            return (
              <div key={layer}>
                {/* Section header */}
                <h3
                  className="text-sm uppercase tracking-wider pb-2 mb-0"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 800,
                    color: 'var(--gray-900)',
                    borderBottom: '3px solid var(--gray-900)',
                  }}
                >
                  {sectionLabel}
                </h3>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="sports-table" style={{ minWidth: '640px' }}>
                    <thead>
                      <tr>
                        <th>Team</th>
                        <th>League</th>
                        <th>Trend</th>
                        <th className="text-right">Record</th>
                        <th className="text-right">Percent</th>
                        <th className="text-center" style={{ width: '48px' }}>Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const record = deriveRecord(row.sample, row.hit_rate);
                        const pct = `${(row.hit_rate * 100).toFixed(0)}%`;
                        const lastResult = row.last_result;

                        return (
                          <tr key={`${layer}-${row.team}-${row.trend}-${i}`}>
                            <td>
                              <div className="flex items-center gap-2">
                                <img
                                  src={getTeamLogoUrl(row.team)}
                                  alt=""
                                  className="w-5 h-5 object-contain flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <span style={{ fontWeight: 600 }}>{row.team}</span>
                              </div>
                            </td>
                            <td>
                              <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                                {row.league}
                              </span>
                            </td>
                            <td>{humanizeTrend(row.trend)}</td>
                            <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                              {record}
                            </td>
                            <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                              {pct}
                            </td>
                            <td className="text-center">
                              {lastResult === true ? (
                                <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                              ) : lastResult === false ? (
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>✗</span>
                              ) : (
                                <span style={{ color: 'var(--gray-400)' }}>–</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-6 pt-4 text-xs"
        style={{ fontFamily: 'var(--font-ui)', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-200)' }}
      >
        {filtered.length} shown. Source: get_all_trends.
      </div>
    </div>
  );
};

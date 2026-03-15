import React, { useState, useMemo } from 'react';
import { useDailyPicks, mapPickType, type PickRow } from '../../hooks/useHomepageData';

function formatGameTime(isoTime?: string): string {
  if (!isoTime) return '';
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }) + ' PT';
  } catch {
    return '';
  }
}

function getUniqueLeagues(rows: PickRow[]): string[] {
  const leagues = new Set<string>();
  for (const row of rows) {
    if (row.league) leagues.add(row.league);
  }
  return Array.from(leagues).sort();
}

export const PicksBoard: React.FC = () => {
  const { data: picks = [], isLoading } = useDailyPicks();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const leagues = useMemo(() => getUniqueLeagues(picks), [picks]);

  const filtered = useMemo(
    () => (selectedLeague ? picks.filter((r) => r.league === selectedLeague) : picks),
    [picks, selectedLeague]
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-ui)' }}>
        Loading picks…
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
          No picks available today.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="sports-table" style={{ minWidth: '560px' }}>
            <thead>
              <tr>
                <th>Matchup</th>
                <th>League</th>
                <th>Play</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const matchup = `${row.home_team} vs ${row.away_team}`;
                const time = formatGameTime(row.game_time);
                return (
                  <tr key={`pick-${i}`}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{matchup}</span>
                        {time && (
                          <span
                            className="block text-xs mt-0.5"
                            style={{ color: 'var(--gray-500)', fontFamily: "'SF Mono', Menlo, monospace" }}
                          >
                            {time}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
                        {row.league}
                      </span>
                    </td>
                    <td>{row.play}</td>
                    <td>
                      <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-600)' }}>
                        {mapPickType(row.pick_type)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-6 pt-4 text-xs"
        style={{ fontFamily: 'var(--font-ui)', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-200)' }}
      >
        {filtered.length} shown. Source: get_daily_picks.
      </div>
    </div>
  );
};

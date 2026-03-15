import React, { useState, useMemo } from 'react';
import { usePropEdges, type PropEdgeRow } from '../../hooks/useHomepageData';

function gradeColor(grade: string): { bg: string; text: string } {
  switch (grade.toUpperCase()) {
    case 'A':
      return { bg: '#dcfce7', text: '#15803d' };
    case 'B':
      return { bg: '#fef3c7', text: '#b45309' };
    default:
      return { bg: 'var(--gray-100)', text: 'var(--gray-600)' };
  }
}

function deriveRecord(total?: number, winPct?: number): string {
  if (total == null || winPct == null) return '–';
  const wins = Math.round(total * winPct);
  const losses = total - wins;
  return `${wins}-${losses}`;
}

function derivePct(winPct?: number): string {
  if (winPct == null) return '–';
  return `${(winPct * 100).toFixed(0)}%`;
}

function getUniqueGrades(rows: PropEdgeRow[]): string[] {
  const grades = new Set<string>();
  for (const row of rows) {
    if (row.grade) grades.add(row.grade.toUpperCase());
  }
  return ['A', 'B', 'C'].filter((g) => grades.has(g));
}

export const PropsBoard: React.FC = () => {
  const { data: props = [], isLoading } = usePropEdges();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const grades = useMemo(() => getUniqueGrades(props), [props]);

  const filtered = useMemo(
    () =>
      selectedGrade
        ? props.filter((r) => r.grade.toUpperCase() === selectedGrade)
        : props,
    [props, selectedGrade]
  );

  if (isLoading) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-ui)' }}>
        Loading prop edges…
      </div>
    );
  }

  return (
    <div>
      {/* Grade filter chips */}
      {grades.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedGrade(null)}
            className="px-3 py-1 text-xs uppercase tracking-wider transition-colors"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              background: selectedGrade === null ? 'var(--gray-900)' : 'var(--gray-100)',
              color: selectedGrade === null ? '#fff' : 'var(--gray-600)',
              border: '1px solid',
              borderColor: selectedGrade === null ? 'var(--gray-900)' : 'var(--gray-300)',
            }}
          >
            All
          </button>
          {grades.map((grade) => {
            const colors = gradeColor(grade);
            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade === selectedGrade ? null : grade)}
                className="px-3 py-1 text-xs uppercase tracking-wider transition-colors"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  background: selectedGrade === grade ? colors.bg : 'var(--gray-100)',
                  color: selectedGrade === grade ? colors.text : 'var(--gray-600)',
                  border: '1px solid',
                  borderColor: selectedGrade === grade ? colors.text : 'var(--gray-300)',
                }}
              >
                Grade {grade}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-12 text-center" style={{ color: 'var(--gray-500)', fontFamily: 'var(--font-ui)' }}>
          No prop edges available today.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="sports-table" style={{ minWidth: '820px' }}>
            <thead>
              <tr>
                <th style={{ width: '56px' }}>Grade</th>
                <th>Player</th>
                <th>Prop</th>
                <th>Side</th>
                <th className="text-right">Line</th>
                <th className="text-right">Odds</th>
                <th className="text-right">Record</th>
                <th className="text-right">Percent</th>
                <th className="text-right">Avg</th>
                <th className="text-right">Delta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const colors = gradeColor(row.grade);
                const isFade = row.pick_type === 'fade';
                const sideText = row.side.toLowerCase() === 'over' ? 'Over' : 'Under';
                const sideColor = row.side.toLowerCase() === 'over' ? '#16a34a' : '#dc2626';
                const record = deriveRecord(row.hist_total, row.hist_win_pct);
                const pct = derivePct(row.hist_win_pct);

                return (
                  <tr key={`prop-${i}`}>
                    <td>
                      <span
                        className="inline-block px-2 py-0.5 text-xs font-bold text-center"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          minWidth: '28px',
                          fontFamily: 'var(--font-ui)',
                        }}
                      >
                        {row.grade.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.player}</td>
                    <td>{row.prop}</td>
                    <td>
                      <span style={{ color: sideColor, fontWeight: 600 }}>
                        {sideText}{isFade ? ' fade' : ''}
                      </span>
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {row.line}
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {row.odds}
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {record}
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {pct}
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {row.hist_avg != null ? row.hist_avg.toFixed(1) : '–'}
                    </td>
                    <td className="text-right" style={{ fontFamily: "'SF Mono', Menlo, monospace", fontVariantNumeric: 'tabular-nums' }}>
                      {row.delta != null ? (row.delta > 0 ? `+${row.delta.toFixed(1)}` : row.delta.toFixed(1)) : '–'}
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
        {filtered.length} shown. Source: get_todays_prop_edges.
      </div>
    </div>
  );
};
